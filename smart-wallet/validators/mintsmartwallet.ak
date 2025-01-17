use aiken/collection/dict
use aiken/collection/list
use aiken/crypto
use aiken/option
use aiken/primitive/bytearray
use cardano/address.{Script, VerificationKey}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{InlineDatum, Output, Transaction}

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
  //This are hardcoded values 
  //for the NFT controlling the price and payment address, we it the admin token
  //and for the cupons for 1 free mint we call the redemption token 
  let adminTokenPolicy: PolicyId =
    #"592fb0f9d8ed15c06858118d134d5c4b7c77320507810fee9ac2ddf9"
  let adminTokenName: AssetName = #"736d6172744d696e7441646d696e"

  let redemptionTokenPolicy: PolicyId =
    #"24fc896805f0b75ab51502b022834440ef8235f134475e0c14ea9353"
  let redemptionTokenName: AssetName = #"546f6b656e5661756c742056617563686572"

  let adminUtxo =
    transaction.reference_inputs
      |> list.find(
          fn(x) {
            assets.quantity_of(x.output.value, adminTokenPolicy, adminTokenName) > 0
          },
        )
  expect adminData: AdminDatum =
    option.or_else(
      option.map(
        adminUtxo,
        fn(utxo) {
          when utxo.output.datum is {
            InlineDatum(data) -> data
            _ -> fail
          }
        },
      ),
      None,
    )
  let regularPayment =
    list.any(
      transaction.outputs,
      fn(output) {
        and {
          address_belongs_to_hash(output, adminData.paymentAddressCredential),
          assets.lovelace_of(output.value) == adminData.mintAmount,
        }
      },
    )
  let tokensMinted = transaction.mint

  let redemptionPayment =
    assets.quantity_of(tokensMinted, redemptionTokenPolicy, redemptionTokenName) == -1
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
