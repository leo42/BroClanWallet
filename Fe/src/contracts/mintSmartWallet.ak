
use aiken/collection/list
use aiken/option
use aiken/collection/dict
use  aiken/primitive/bytearray
use cardano/address.{Credential }
use aiken/crypto
use cardano/assets.{ PolicyId , AssetName  }
use cardano/transaction.{Transaction,  Output, InlineDatum }



type AdminDatum {
      mintAmount: Int,
      paymentAddressCredential : Credential
}



validator minting() {
  mint(_redeemer, policyId: PolicyId, self: Transaction) {
        and {
          payment_made(self),
          mint_consumed_utxos(self, policyId)
        }
  }
}
 
fn payment_made(transaction: Transaction ) {

  //This are hardcoded values 
  //for the NFT controlling the price and payment address, we it the admin token
  //and for the cupons for 1 free mint we call the redemption token 
  let adminTokenPolicy : PolicyId = #"29348067d7a4cb37d84061e6f40e6815b9361f2d68923a804b2683ae" 
  let adminTokenName : AssetName  = #"42726f436c616e4d696e74696e6741646d696e"

  let redemptionTokenPolicy : PolicyId = #"24fc896805f0b75ab51502b022834440ef8235f134475e0c14ea9353" 
  let redemptionTokenName :  AssetName  = #"546f6b656e5661756c742056617563686572"


  
  let adminUtxo = transaction.reference_inputs 
                     |> list.find(fn(x) { ( assets.quantity_of(x.output.value  ,adminTokenPolicy ,adminTokenName) > 0 ) } ) 
                  
   
  expect adminData: AdminDatum  = option.or_else(option.map(adminUtxo, fn(utxo) {
                                                                  when (utxo.output.datum) is {
                                                                  InlineDatum(data) -> data
                                                                  _ -> fail}}), None)    
    
  let regularPayment = list.any( transaction.outputs, fn(output) { and {
                                                address_belongs_to_hash(output, adminData.paymentAddressCredential),
                                                assets.lovelace_of(output.value) == adminData.mintAmount
                                                }
                                              })
      
  let tokensMinted = transaction.mint

  let redemptionPayment = (assets.quantity_of(tokensMinted, redemptionTokenPolicy, redemptionTokenName) == -1)
  
  regularPayment ||  redemptionPayment
                                           
}
 
fn mint_consumed_utxos(transaction: Transaction,  policyId:PolicyId) {
  let tokensMinted = dict.keys(assets.tokens( transaction.mint, policyId))
  and {
   list.all( tokensMinted, fn(token) { 
        let tokenTrimed = bytearray.drop(token, 1)
        list.count(transaction.inputs , fn(input)  {
                let inputHashTrimmed =  bytearray.drop(crypto.sha2_256(bytearray.push(input.output_reference.transaction_id,
                                               input.output_reference.output_index
                                          )),1 )
                inputHashTrimmed == tokenTrimed  
                  }) == 1 
          }),
          
    list.all(transaction.inputs , fn(input)  {
       input.output_reference.output_index < 255
    })
  }
}


fn address_belongs_to_hash( output : Output , hash : Credential  )  {
    output.address.payment_credential == hash
}