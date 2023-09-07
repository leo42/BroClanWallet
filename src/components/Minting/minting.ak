
use aiken/list
use aiken/option
use aiken/dict
use aiken/transaction/credential.{VerificationKeyCredential ,VerificationKey}
use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction/value.{ PolicyId , AssetName }

use aiken/transaction.{Transaction, ScriptContext, Mint   , InlineDatum }

type VerificationKeyHash =
  Hash<Blake2b_224, VerificationKey>


type AdminDatum {
      mintAmount: Int,
      afiliateBounty: Int,
      paymentAddressCredential : VerificationKeyHash
}

type Redeemer {
    Void
    Afiliate { paymentAddressCredential : VerificationKeyHash}
}

validator {
  fn minting( redeemer: Redeemer, ctx: ScriptContext) {
    // In principle, scripts can be used for different purpose (e.g. minting
    // assets). Here we make sure it's only used when 'spending' from a eUTxO
    when ctx.purpose is {
      Mint(policyId) ->
        and {
        payment_made(ctx.transaction,policyId, redeemer),
        mint_consumed_utxos(ctx.transaction, policyId)
          }
      _ -> False
    }
  }
}
 
fn payment_made(transaction: Transaction, policyId:PolicyId , redeemer : Redeemer ) {
  let adminTokenPolicy : PolicyId = #"72ff4773518459890ea5224018c10f7487a339ea0a9e42ac6826f829" 
  let adminTokenName : AssetName  = #"41646d696e4b6579"

  let tokensMintedAmount = value.tokens( value.from_minted_value(transaction.mint), policyId)
                          |> dict.size()
  
  let adminUtxo = transaction.reference_inputs 
                     |> list.find(fn(x) { ( value.quantity_of(x.output.value  ,adminTokenPolicy ,adminTokenName) > 0 ) } ) 
                  
   
  expect adminData: AdminDatum  = option.or_else(option.map(adminUtxo, fn(utxo) {
                                                                  when (utxo.output.datum) is {
                                                                  InlineDatum(data) -> data
                                                                  _ -> fail}}), None)    
                                                                       
  let payment_credential =   VerificationKeyCredential(adminData.paymentAddressCredential)


  let regular_payment  = list.any( transaction.outputs, fn(output) { and {
                                                output.address.payment_credential == payment_credential,
                                                value.lovelace_of(output.value) == adminData.mintAmount * tokensMintedAmount
                                                }
                                              })
  

  
   when (redeemer) is { 
     Void ->   list.any( transaction.outputs, fn(output) { and {
                                                output.address.payment_credential == payment_credential,
                                                value.lovelace_of(output.value) == adminData.mintAmount * tokensMintedAmount
                                                }
                                              })
      
    Afiliate(afiliateKey) -> and { 
                  list.any( transaction.outputs, fn(output) { and {
                                                        output.address.payment_credential == payment_credential,
                                                        value.lovelace_of(output.value) == (adminData.mintAmount - adminData.afiliateBounty ) * tokensMintedAmount
                                                        }
                                                      }),
                  list.any( transaction.outputs, fn(output) { and {
                                                        output.address.payment_credential == VerificationKeyCredential(afiliateKey),
                                                        value.lovelace_of(output.value) == adminData.afiliateBounty * tokensMintedAmount
                                                        }
                                                      })
                              }
        
  }
                                           
}
 
 fn mint_consumed_utxos(transaction: Transaction,  policyId:PolicyId) {
  let tokensMinted = dict.keys(value.tokens( value.from_minted_value(transaction.mint), policyId))
  
   list.all( tokensMinted, fn(token) { 
                                  list.count(transaction.inputs , fn(input)  {
                                           and{ 
                                             input.output_reference.transaction_id.hash == token , 
                                             input.output_reference.output_index == 0 
                                             }
                                            }) == 1
                                    })
   
}
