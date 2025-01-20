use aiken/collection/dict.{Dict, foldl, size}
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

pub type RedeemerSequence {
  KeyHashRedeemer { index: Int }
  NftHolderRedeemer { index: Int }
  AtLeastRedeemer { sequence: List<RedeemerSequence> }
  BeforeRedeemer
  AfterRedeemer
  ScriptRefRedeemer { input: Int }
  VoidRedeemer
}

validator configHost {
  spend(
    datum: Option<SmartMultisigDescriptor>,
    pattern: RedeemerSequence,
    myUtxo: OutputReference,
    self: Transaction,
  ) {
    let valid =
      when datum is {
        Some(descriptor) -> validate(descriptor, self, pattern)
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
  withdraw(redeemer: RedeemerSequence, __, self: Transaction) {
    multisigAproved(walletId, self, redeemer)
  }

  else(ctx: ScriptContext) {
    True
  }
}

fn multisigAproved(
  walletId: ByteArray,
  transaction: Transaction,
  pattern: RedeemerSequence,
) -> Bool {
  let configPolicy: PolicyId =
    #"79dfc51ebff0b40e596e6ce59a0e3306038c7214afd40f9bf1f15cd1"
  let configToken: AssetName = bytearray.push(walletId, 0)
  let descriptor =
    when getDescriptorFromTokenName(configPolicy, configToken, transaction) is {
      Some(descriptor) -> descriptor
      None -> fail
    }
  validate(descriptor, transaction, pattern)
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
  pattern: RedeemerSequence,
) -> Bool {
  when segment is {
    KeyHash(keyHash) -> {
      expect KeyHashRedeemer(index) = pattern
      expect Some(signature) = list.at(transaction.extra_signatories, index)
      signature == keyHash
    }
    NftHolder(policy, name) -> {
      expect NftHolderRedeemer(index) = pattern
      expect Some(input) = list.at(transaction.inputs, index)
      quantity_of(input.output.value, policy, name) >= 1
    }
    AtLeast(scripts, m) -> {
      expect AtLeastRedeemer(sequence) = pattern

      let evaluatedScripts =
        scripts
          |> list.indexed_map(
              fn(index, script) {
                expect Some(redeemer) = list.at(sequence, index)
                when redeemer is {
                  VoidRedeemer -> False
                  _ -> validate(script, transaction, redeemer)
                }
              },
            )
      list.count(evaluatedScripts, fn(pair) { pair == True }) >= m
    }

    Before(time) ->
      interval.is_entirely_before(transaction.validity_range, time)
    After(time) -> interval.is_entirely_after(transaction.validity_range, time)
    ScriptRef(scriptHash) ->
      has_key(transaction.withdrawals, Script(scriptHash))
  }
}
