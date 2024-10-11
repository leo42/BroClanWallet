
use aiken/crypto.{ ScriptHash ,  VerificationKeyHash}
use cardano/assets.{AssetName , Value, PolicyId, quantity_of, from_lovelace, negate, zero, merge, from_asset}
use aiken/collection/list
use cardano/transaction.{ Transaction, InlineDatum, Output,OutputReference}
use cardano/script_context.{ScriptContext}
use aiken/interval
use cardano/address.{Address, Credential, Script}
use aiken/option
use aiken/primitive/bytearray


type PaymentAmount {
      Lovelace { lovelace : Int}
      NativeToken { policy : PolicyId , assetName : AssetName, amount : Int}
  }

type SubscriptionDatum {
    nextPayment : Int,
    paymentInterval : Int, 
    recipient : Address, 
    paymentAmount : PaymentAmount,
    clientAddress :  ScriptHash
}

pub type Redeemer{
    Spend 
    SubScription{ subscriptionIndex : Int}
}




validator subscriptionModule ()  {

  spend(_datum, redeemer : Redeemer , myUtxo: OutputReference, self: Transaction) {
    or{
      withdrawOk(),
      burn(myUtxo, self)
    }
  }

  mint(_redeemer , policy_id , self: Transaction) {
   and{
      clientApproved(policy_id,self),
      True
    }

  }
  
  withdraw(_redeemer, account : Credential, self: Transaction) {
    subscriptionPayment(self, account)
  }

}

fn burn(myUtxo: OutputReference, self: Transaction){
  // Check that all tokens mints are Burns (Negative)
  // check for each token that is being burned  clientApproved(policy_id,self)

  True
}

fn withdrawOk( ) -> Bool{
    //check that withdraw contains my self
    True
}

fn  clientApproved(walletId: ByteArray, transaction: Transaction) -> Bool{
  //
  True
}

fn subscriptionPayment(transaction : Transaction , account : Credential){
// Need to find all the subscriptins being fullfild, we find them by searching for all the inputs that contain a token with our minting policy
// Then check that we consume the exact amount, 
// Check that outputs are correct with the expected datum
// Check  you are not spending any inputs from any client that you should not
// Check that no mints are happening

  let clientAddress = getClientAddress(account, transaction)
  True

}


fn getClientAddress(account : Credential,  transaction: Transaction){

  expect Some(input) = list.find(
    transaction.inputs,
    fn(input) { input.output.address.payment_credential == account }
  )
  
  input.output.address
}


fn getValueSpend(transaction : Transaction, clientAddress: Address) -> Value{
      list.foldl(transaction.inputs, 
                 zero, 
                 fn( input, n) { if (clientAddress.payment_credential == input.output.address.payment_credential)
                                  {
                                    merge(n, input.output.value )
                                  } else {
                                    n
                                  }
                                }
                  )
                                    
}

fn getChangeValue(transaction : Transaction, clientAddress : Address) -> Value{
    list.foldl(transaction.outputs, 
               zero, 
               fn(output , n) { if (clientAddress == output.address){
                                merge(n, output.value)
                              } else{
                                n
                              }
   })

}

fn getTotalSpend(transaction: Transaction, clientAddress: Address) -> Value {
  let valueSpend = getValueSpend(transaction, clientAddress) 
  let changeValue = getChangeValue(transaction, clientAddress)

  merge(valueSpend, negate(changeValue))  
}

fn getPaymentOutput(transaction : Transaction, myAddress : Address) -> Output {
  let outputs = list.filter(transaction.outputs, fn(output) { output.address !=  myAddress})
  
  let output =  when list.length(outputs) is {
                  1 -> list.at(outputs, 0) 
                  _ -> fail 
                }
  when output is {
      Some(out) -> out
      None -> fail
  }
}

