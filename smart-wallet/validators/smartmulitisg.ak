use aiken/collection/list
use aiken/collection/pairs.{has_key}
use aiken/crypto.{VerificationKeyHash}
use aiken/interval
use aiken/primitive/bytearray
use cardano/address.{Script, VerificationKey}
use cardano/assets.{AssetName, PolicyId, quantity_of}
use cardano/script_context.{ScriptContext}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}
use env

pub type Datum {
  owner: VerificationKeyHash,
}

pub type SmartMultisigDescriptor {
  KeyHash { keyHash: VerificationKeyHash }
  NftHolder { policy: PolicyId, name: AssetName }
  AtLeast { scripts: List<SmartMultisigDescriptor>, m: Int }
  Before { time: Int }
  After { time: Int }
  ScriptRef { scriptHash: ByteArray }
}

validator configHost {
  spend(
    datum: Option<SmartMultisigDescriptor>,
    _,
    myUtxo: OutputReference,
    self: Transaction,
  ) {
    let valid =
      when datum is {
        Some(descriptor) -> validate(descriptor, self)
        None -> fail
      }

    let outputValid = configOutputValid(myUtxo, self)
    valid && outputValid
  }

  else(_) {
    fail
  }
}

fn configOutputValid(myUtxo: OutputReference, self: Transaction) -> Bool {
  expect Some(myinput) =
    list.find(self.inputs, fn(input) { input.output_reference == myUtxo })
  expect Some(myOutput) =
    list.find(self.outputs, fn(output) { output.value == myinput.output.value })
  expect InlineDatum(data) = myOutput.datum
  expect _: SmartMultisigDescriptor = data

  let addressEqual = myinput.output.address == myOutput.address
  addressEqual
}

validator smartMultisig(walletId: ByteArray) {
  else(ctx: ScriptContext) {
    multisigAproved(walletId, ctx.transaction)
  }
}

fn multisigAproved(walletId: ByteArray, transaction: Transaction) -> Bool {
  let configToken: AssetName = bytearray.push(walletId, 0)
  let descriptor =
    when
      getDescriptorFromTokenName(env.configPolicy, configToken, transaction)
    is {
      Some(descriptor) -> descriptor
      None -> fail
    }
  validate(descriptor, transaction)
}

fn getDescriptorFromTokenName(
  policy: PolicyId,
  assetName: AssetName,
  transaction: Transaction,
) -> Option<SmartMultisigDescriptor> {
  when getTokenReference(policy, assetName, transaction) is {
    Some(input) -> descriptorFromInput(input)
    None -> None
  }
}

fn descriptorFromInput(input: Input) -> Option<SmartMultisigDescriptor> {
  when input.output.datum is {
    InlineDatum(data) ->
      if data is descriptor: SmartMultisigDescriptor {
        Some(descriptor)
      } else {
        None
      }
    _ -> None
  }
}

fn getTokenReference(
  policy: PolicyId,
  name: AssetName,
  transaction: Transaction,
) -> Option<Input> {
  list.find(
    transaction.reference_inputs,
    fn(x) { quantity_of(x.output.value, policy, name) > 0 },
  )
}

fn validateNFT(
  policy: PolicyId,
  name: AssetName,
  transaction: Transaction,
) -> Bool {
  let utxo = getTokenReference(policy, name, transaction)
  when utxo is {
    Some(utxo) -> {
      let descriptor = descriptorFromInput(utxo)
      let nftHolder =
        when utxo.output.address.payment_credential is {
          VerificationKey(keyHash) -> keyHash
          Script(keyHash) -> keyHash
        }
      or {
        list.any(transaction.extra_signatories, fn(x) { x == nftHolder }),
        when descriptor is {
          Some(descriptor) -> validate(descriptor, transaction)
          None -> False
        },
      }
    }
    None -> False
  }
}

pub fn validate(
  segment: SmartMultisigDescriptor,
  transaction: Transaction,
) -> Bool {
  when segment is {
    KeyHash(keyHash) ->
      list.any(transaction.extra_signatories, fn(signer) { signer == keyHash })
    NftHolder(policy, name) -> validateNFT(policy, name, transaction)
    AtLeast(scripts, m) -> {
      let total = list.length(scripts)
      if total < m {
        False
      } else {
        count_valid(scripts, 0, m, total, transaction)
      }
    }
    Before(time) ->
      interval.is_entirely_before(transaction.validity_range, time)
    After(time) -> interval.is_entirely_after(transaction.validity_range, time)
    ScriptRef(scriptHash) ->
      has_key(transaction.withdrawals, Script(scriptHash))
  }
}

fn count_valid(remaining, valid_count, needed, total, transaction) {
  when remaining is {
    [] -> valid_count >= needed
    [script, ..rest] ->
      if valid_count >= needed {
        True
      } else if valid_count + list.length(remaining) < needed {
        False
      } else if validate(script, transaction) {
        count_valid(rest, valid_count + 1, needed, total, transaction)
      } else {
        count_valid(rest, valid_count, needed, total, transaction)
      }
  }
}
