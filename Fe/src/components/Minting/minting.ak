
use aiken/list
use aiken/option
use aiken/dict
use aiken/transaction/credential.{VerificationKeyCredential , ScriptCredential ,VerificationKey, Script}
use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction/value.{ PolicyId , AssetName  }

use aiken/transaction.{Transaction, ScriptContext, Mint, Output, InlineDatum }

type VerificationKeyHash =
  Hash<Blake2b_224, VerificationKey>

type ScriptHash = 
     Hash<Blake2b_224, Script>

type VerificationHash {
    VerificationKeyHash { paymentAddressCredential : VerificationKeyHash} 
    ScriptHash  { paymentAddressCredential : ScriptHash }
}

type AdminDatum {
      mintAmount: Int,
      affiliateBounty: Int,
      paymentAddressCredential : VerificationHash
}

type Redeemer {
    Void
    Affiliate { paymentAddressCredential : VerificationHash}
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
  let adminTokenPolicy : PolicyId = #"29348067d7a4cb37d84061e6f40e6815b9361f2d68923a804b2683ae" 
  let adminTokenName : AssetName  = #"42726f436c616e4d696e74696e6741646d696e"

  let tokensMintedAmount = value.tokens( value.from_minted_value(transaction.mint), policyId)
                          |> dict.size()
  
  let adminUtxo = transaction.reference_inputs 
                     |> list.find(fn(x) { ( value.quantity_of(x.output.value  ,adminTokenPolicy ,adminTokenName) > 0 ) } ) 
                  
   
  expect adminData: AdminDatum  = option.or_else(option.map(adminUtxo, fn(utxo) {
                                                                  when (utxo.output.datum) is {
                                                                  InlineDatum(data) -> data
                                                                  _ -> fail}}), None)    
    
  

  
   when (redeemer) is { 
     Void ->   list.any( transaction.outputs, fn(output) { and {
                                                address_belongs_to_hash(output, adminData.paymentAddressCredential),
                                                value.lovelace_of(output.value) == adminData.mintAmount * tokensMintedAmount
                                                }
                                              })
      
    Affiliate(affiliateKey) -> and { 
                  list.any( transaction.outputs, fn(output) { and { 
                                                       address_belongs_to_hash(output, adminData.paymentAddressCredential),
                                                       value.lovelace_of(output.value) == (adminData.mintAmount - adminData.affiliateBounty ) * tokensMintedAmount
                                                        }
                                                      }),
                  list.any( transaction.outputs, fn(output) { and {
                                                        address_belongs_to_hash(output, affiliateKey),
                                                        value.lovelace_of(output.value) == adminData.affiliateBounty * tokensMintedAmount
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


fn address_belongs_to_hash( output : Output , hash : VerificationHash  )  {
  when( hash) is {
    VerificationKeyHash(paymentAddressCredential) -> output.address.payment_credential == VerificationKeyCredential(paymentAddressCredential)
    ScriptHash(paymentAddressCredential  ) -> and {
               output.address.payment_credential ==  ScriptCredential(paymentAddressCredential),
               when (output.datum) is {
                 InlineDatum(_) -> True
                 _ -> False
               }
               }
  }
  
}