use aiken/collection/list
use aiken/collection/pairs.{has_key}
use aiken/crypto.{VerificationKeyHash}
use aiken/interval
use aiken/option
use aiken/primitive/bytearray
use cardano/address.{Script}
use cardano/assets.{AssetName, PolicyId, quantity_of}
use cardano/script_context.{ScriptContext}
use cardano/transaction.{InlineDatum, Output, OutputReference, Transaction}
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
  transaction.reference_inputs
    |> list.find(fn(x) { quantity_of(x.output.value, policy, assetName) > 0 })
    |> option.and_then(
        fn(utxo) {
          when utxo.output.datum is {
            InlineDatum(data) ->
              if data is descriptor: SmartMultisigDescriptor {
                Some(descriptor)
              } else {
                None
              }
            _ -> None
          }
        },
      )
}

pub fn validate(
  segment: SmartMultisigDescriptor,
  transaction: Transaction,
) -> Bool {
  when segment is {
    KeyHash(keyHash) ->
      list.any(transaction.extra_signatories, fn(signer) { signer == keyHash })
    NftHolder(policy, name) -> or {
        list.any(
          transaction.inputs,
          fn(input) { quantity_of(input.output.value, policy, name) >= 1 },
        ),
        when getDescriptorFromTokenName(policy, name, transaction) is {
          Some(descriptor) -> validate(descriptor, transaction)
          None -> False
        },
      }
    AtLeast(scripts, m) ->
      list.count(scripts, fn(script) { validate(script, transaction) }) >= m
    Before(time) ->
      interval.is_entirely_before(transaction.validity_range, time)
    After(time) -> interval.is_entirely_after(transaction.validity_range, time)
    ScriptRef(scriptHash) ->
      has_key(transaction.withdrawals, Script(scriptHash))
  }
}
