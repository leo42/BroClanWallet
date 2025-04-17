use aiken/collection/list
use aiken/collection/pairs.{has_key}
use aiken/crypto.{VerificationKeyHash}
use aiken/interval
use aiken/primitive/bytearray
use cardano/address.{Script, VerificationKey}
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

pub type TokenDescriptor {
  tokenInfo: Option<
    (Option<VerificationKeyHash>, Option<SmartMultisigDescriptor>),
  >,
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
      TokenDescriptor{tokenInfo: Some((_, Some(descriptor)))} -> descriptor
      _ -> fail
    }
  validate(descriptor, transaction)
}

fn checkNFT(policy: PolicyId, name: AssetName, transaction: Transaction) -> Bool {
  let utxo =
    list.find(
      transaction.reference_inputs,
      fn(x) { quantity_of(x.output.value, policy, name) > 0 },
    )
  when utxo is {
    Some(utxo) -> True
    None -> False
  }
}

fn getDescriptorFromTokenName(
  policy: PolicyId,
  assetName: AssetName,
  transaction: Transaction,
) -> TokenDescriptor {
  let utxo =
    list.find(
      transaction.reference_inputs,
      fn(x) { quantity_of(x.output.value, policy, assetName) > 0 },
    )
  

  let keyHash: Option<VerificationKeyHash> =
        when utxo.output.address.payment_credential is {
          VerificationKey(paymentCredential) -> Some(paymentCredential)
          _ -> None
        }
      when keyHash is {
        Some(hash) ->
          when utxo.output.datum is {
            InlineDatum(data) ->
              if data is descriptor: SmartMultisigDescriptor {
                TokenDescriptor {
                  tokenInfo: Some((Some(hash), Some(descriptor))),
                }
              } else {
                TokenDescriptor { tokenInfo: Some((Some(hash), None)) }
              }
            _ -> TokenDescriptor { tokenInfo: Some((Some(hash), None)) }
          }
        None -> TokenDescriptor { tokenInfo: None }
      }
    }
    None -> TokenDescriptor { tokenInfo: None }
  }
}

pub fn validate(
  segment: SmartMultisigDescriptor,
  transaction: Transaction,
) -> Bool {
  when segment is {
    KeyHash(keyHash) ->
      list.any(transaction.extra_signatories, fn(signer) { signer == keyHash })
    NftHolder(policy, name) -> {
      let descriptor = getDescriptorFromTokenName(policy, name, transaction)
      when descriptor is {
        TokenDescriptor{tokenInfo: Some((Some(keyHash), Some(descriptor)))} ->
          or {
            list.any(
              transaction.extra_signatories,
              fn(signer) { signer == keyHash },
            ),
            validate(descriptor, transaction),
          }

        _ -> False
      }
    }
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
