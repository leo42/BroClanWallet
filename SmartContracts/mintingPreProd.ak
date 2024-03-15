
use aiken/list
use aiken/option
use aiken/dict
use aiken/bytearray
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
      paymentAddressCredential : VerificationHash
}



validator( ) {
  fn minting(  _, ctx: ScriptContext) {
    when ctx.purpose is {
      Mint(policyId) ->
        and {
        payment_made(ctx.transaction,policyId),
        mint_consumed_utxos(ctx.transaction, policyId)
          }
      _ -> False
    }
  }
}
 
fn payment_made(transaction: Transaction, policyId:PolicyId  ) {

  //This are hardcoded values 
  //for the NFT controlling the price and payment address, we it the admin token
  //and for the cupons for 1 free mint we call the redemption token 
  let adminTokenPolicy : PolicyId = #"29348067d7a4cb37d84061e6f40e6815b9361f2d68923a804b2683ae" 
  let adminTokenName : AssetName  = #"42726f436c616e4d696e74696e6741646d696e"

  let redemptionTokenPolicy : PolicyId = #"24fc896805f0b75ab51502b022834440ef8235f134475e0c14ea9353" 
  let redemptionTokenName :  AssetName  = #"546f6b656e5661756c742056617563686572"

  let tokensMintedAmount = value.tokens( value.from_minted_value(transaction.mint), policyId)
                          |> dict.size()
  
  let adminUtxo = transaction.reference_inputs 
                     |> list.find(fn(x) { ( value.quantity_of(x.output.value  ,adminTokenPolicy ,adminTokenName) > 0 ) } ) 
                  
   
  expect adminData: AdminDatum  = option.or_else(option.map(adminUtxo, fn(utxo) {
                                                                  when (utxo.output.datum) is {
                                                                  InlineDatum(data) -> data
                                                                  _ -> fail}}), None)    
    
  let regularPayment = list.any( transaction.outputs, fn(output) { and {
                                                address_belongs_to_hash(output, adminData.paymentAddressCredential),
                                                value.lovelace_of(output.value) == adminData.mintAmount * tokensMintedAmount
                                                }
                                              })
      
  let tokensMinted = value.from_minted_value(transaction.mint)

  let redemptionPayment = (value.quantity_of(tokensMinted, redemptionTokenPolicy,redemptionTokenName) == -tokensMintedAmount)
  
  
  regularPayment ||  redemptionPayment
                                           
}
 
 fn mint_consumed_utxos(transaction: Transaction,  policyId:PolicyId) {
  let tokensMinted = dict.keys(value.tokens( value.from_minted_value(transaction.mint), policyId))
  and {
   list.all( tokensMinted, fn(token) { 
        list.count(transaction.inputs , fn(input)  {
                hash.sha2_256(bytearray.push(input.output_reference.transaction_id.hash,
                                               input.output_reference.output_index
                                          )) == token  
                  }) == 1 
                 
          }),
    list.all(transaction.inputs , fn(input)  {
       input.output_reference.output_index < 255
    })
  }
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