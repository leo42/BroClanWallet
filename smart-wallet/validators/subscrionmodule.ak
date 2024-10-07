
use aiken/crypto.{ ScriptHash ,  VerificationKeyHash}
use cardano/assets.{AssetName , Value, PolicyId, quantity_of, from_lovelace, negate, zero, merge, from_asset}
use aiken/collection/list
use cardano/transaction.{ Transaction, InlineDatum, Output,OutputReference}
use cardano/script_context.{ScriptContext}
use aiken/interval
use cardano/address.{Address, Credential, Script}
use aiken/option
use aiken/primitive/bytearray

pub type Datum {
  owner: VerificationKeyHash,
}

pub type SmartMultisigDescriptor {
    KeyHash { keyHash : VerificationKeyHash }
    NftHolder { policy : PolicyId, name: AssetName }
    AtLeast {  scripts: List<SmartMultisigDescriptor> , m: Int }
    Before { time: Int }
    After { time: Int }
}

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


fn configOutputValid( myUtxo: OutputReference, self: Transaction) -> Bool{
  expect Some(myinput) = list.find(
    self.inputs,
    fn(input) { input.output_reference == myUtxo }
  )
  
  expect Some(myOutput) = list.find(
    self.outputs,
    fn(output) {output.value == myinput.output.value}
  )
  
  expect InlineDatum(data) = myOutput.datum
  expect _: SmartMultisigDescriptor = data

  let addressEqual = myinput.output.address == myOutput.address
  addressEqual
  }


validator subscriptionModule (walletId: ByteArray)  {

  spend(_datum, _redeemer : Redeemer , _myUtxo: OutputReference, self: Transaction) {
    or{
      True,
      clientApproved(walletId,self)
      }
  }

  mint(_redeemer , _policy_id , self: Transaction) {
   and{
      clientApproved(walletId,self)
  }

  }
  
  withdraw(_redeemer, account : Credential, self: Transaction) {
    subscriptionPayment(self, account)
  }

}



fn  clientApproved(walletId: ByteArray, transaction: Transaction) -> Bool{
  True
}

fn subscriptionPayment(transaction : Transaction , account : Credential){
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

