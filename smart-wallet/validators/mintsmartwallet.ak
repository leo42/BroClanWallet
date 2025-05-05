use aiken/collection/dict
use aiken/collection/list
use aiken/crypto
use aiken/primitive/bytearray
use cardano/address.{Script, VerificationKey}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, Output, Transaction}
use env

type AdminDatum {
  mintAmount: Int,
  paymentAddressCredential: ByteArray,
}

validator minting {
  mint(_redeemer, policyId: PolicyId, self: Transaction) {
    and {
      payment_made(self),
      mint_consumed_utxos(self, policyId),
    }
  }

  else(_) {
    fail
  }
}

fn payment_made(transaction: Transaction) {
  let adminUtxo =
    transaction.reference_inputs
      |> list.find(
          fn(x) {
            assets.quantity_of(
              x.output.value,
              env.mintAdminPolicy,
              env.mintAdminTokenName,
            ) > 0
          },
        )
  let regularPayment =
    when adminUtxo is {
      Some(utxo) ->
        when utxo.output.datum is {
          InlineDatum(data) -> {
            expect adminData: AdminDatum = data

            list.any(
              transaction.outputs,
              fn(output) {
                and {
                  address_belongs_to_hash(
                    output,
                    adminData.paymentAddressCredential,
                  ),
                  assets.lovelace_of(output.value) == adminData.mintAmount,
                }
              },
            )
          }
          _ -> False
        }
      _ -> False
    }

  let tokensMinted = transaction.mint

  let redemptionPayment =
    assets.quantity_of(tokensMinted, env.couponTokenPolicy, env.couponTokenName) == -1
  regularPayment || redemptionPayment
}

fn mint_consumed_utxos(transaction: Transaction, policyId: PolicyId) {
  let tokensMinted = dict.keys(assets.tokens(transaction.mint, policyId))
  and {
    list.all(
      tokensMinted,
      fn(token) {
        let tokenTrimed = bytearray.drop(token, 1)
        list.count(
          transaction.inputs,
          fn(input) {
            let inputHashTrimmed =
              bytearray.drop(
                crypto.sha2_256(
                  bytearray.push(
                    input.output_reference.transaction_id,
                    input.output_reference.output_index,
                  ),
                ),
                1,
              )
            inputHashTrimmed == tokenTrimed
          },
        ) == 1
      },
    ),
    list.all(
      transaction.inputs,
      fn(input) { input.output_reference.output_index < 255 },
    ),
  }
}

fn address_belongs_to_hash(output: Output, hash: ByteArray) {
  let paymentCredHash: ByteArray =
    when output.address.payment_credential is {
      VerificationKey(hash) -> hash
      Script(hash) -> hash
    }
  paymentCredHash == hash
}
