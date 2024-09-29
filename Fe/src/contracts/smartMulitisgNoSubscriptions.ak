use aiken/crypto.{  VerificationKeyHash}
use cardano/assets.{AssetName , Value, PolicyId, quantity_of, from_lovelace, negate, zero, merge, from_asset}
use aiken/collection/list
use cardano/transaction.{ Transaction, InlineDatum, Output,OutputReference}
use cardano/script_context.{ScriptContext}
use aiken/interval
use cardano/address.{Address}
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
    paymentAmount : PaymentAmount
}

pub type Redeemer{
    Spend 
    SubScription{ subscriptionIndex : Int}
}

validator configHost() {
  spend(datum : Option<SmartMultisigDescriptor>, _redeemer : Redeemer , myUtxo: OutputReference, self: Transaction) {
     let valid = when datum is {
      Some(descriptor) -> validate(descriptor,self)
      None -> fail
     }

    let outputValid = configOutputValid(myUtxo , self)
    valid && outputValid
  }


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

validator smartMultisig (walletId: ByteArray)  {

  spend(_datum, _redeemer : Redeemer , _myUtxo: OutputReference, self: Transaction) {
    let configPolicy : PolicyId  = #"79dfc51ebff0b40e596e6ce59a0e3306038c7214afd40f9bf1f15cd1"
    let configToken : AssetName = bytearray.push( walletId, 0 )  
    let descriptor = when getDescriptorFromTokenName(configPolicy , configToken , self) is {
                Some(descriptor) -> descriptor
                None -> fail
    }
    validate(descriptor, self)
    

  }
  
  else( ctx: ScriptContext) -> Bool {
    let configPolicy : PolicyId  = #"79dfc51ebff0b40e596e6ce59a0e3306038c7214afd40f9bf1f15cd1"
    let configToken : AssetName = bytearray.push( walletId, 0 )  

    let descriptor = when getDescriptorFromTokenName(configPolicy , configToken , ctx.transaction) is {
                Some(descriptor) -> descriptor
                None -> fail
    }
    validate(descriptor, ctx.transaction)
  }
}

fn subscriptionPayment(transaction : Transaction , policy : PolicyId ,  walletId : ByteArray, subscriptionIndex: Int, outRef : OutputReference){
  let myAddress = getMyAddress(transaction,outRef)
  
  let subscriptionAssetName = bytearray.push(walletId, 1)
  let subscriptionUtxo =  transaction.inputs 
                     |> list.find(fn(x) { ( quantity_of(x.output.value  ,policy ,subscriptionAssetName) > 0 ) } ) 
                          

  let incomingSubscriptionDatum : List<SubscriptionDatum> = 
                                      when subscriptionUtxo is {
                                        Some(utxo) -> when utxo.output.datum  is {
                                          InlineDatum(data) -> {
                                            if data is datum : List<SubscriptionDatum>{
                                              datum
                                            } else {
                                              fail
                                            }
                                          }
                                          _ -> fail
                                        }
                                      _ -> fail
                                    }

  let subscriptionDatumOutput = transaction.outputs
                     |> list.find(fn(x) { ( quantity_of(x.value  ,policy ,subscriptionAssetName) > 0 ) } ) 
  
  let subscription = when list.at(incomingSubscriptionDatum,subscriptionIndex) is{
                            Some(subscriptionDatum) -> subscriptionDatum
                            None -> fail
                          }

  let outgoingSubscriptionDatum : List<SubscriptionDatum> = 
                                      when subscriptionDatumOutput is {
                                        Some(ouput) -> when ouput.datum  is {
                                          InlineDatum(data) -> {
                                            if data is datum : List<SubscriptionDatum>{
                                              datum
                                            } else {
                                              fail
                                            }
                                          }
                                          _ -> fail
                                        }
                                      _ -> fail
                                    }

  let outgoingSubscription = when list.at(outgoingSubscriptionDatum,subscriptionIndex) is{
                                  Some(subscriptionDatum) -> subscriptionDatum
                                  None -> fail
                          }

  let expectedOutcoingSubscription = SubscriptionDatum { nextPayment : subscription.nextPayment + subscription.paymentInterval,
                                      paymentInterval : subscription.paymentInterval, 
                                      recipient : subscription.recipient, 
                                      paymentAmount : subscription.paymentAmount
                                        }
  let subscriptionAmount = when subscription.paymentAmount is {
                                      Lovelace(lovelace) -> from_lovelace(lovelace)
                                      NativeToken(policy , assetName , amount ) -> from_asset(policy,assetName,amount)
                                      }

  let subscriptionTimeValid = interval.is_entirely_before(transaction.validity_range, subscription.nextPayment)
  
  let totalSpend = getTotalSpend(transaction, myAddress)

  let spendCorrect = totalSpend == subscriptionAmount

  let paymentOutput = getPaymentOutput(transaction , myAddress)

  let paymentAddressCorrect = paymentOutput.address == subscription.recipient

  let datumDifferences = list.difference(outgoingSubscriptionDatum,incomingSubscriptionDatum) 

  let datumCorrect = list.length(datumDifferences) == 1 && expectedOutcoingSubscription == outgoingSubscription && expectedOutcoingSubscription.paymentInterval != 0
   

  subscriptionTimeValid && spendCorrect && paymentAddressCorrect && datumCorrect

}

fn getMyAddress(transaction : Transaction, outRef : OutputReference){
  expect Some(input) = list.find(
    transaction.inputs,
    fn(input) { input.output_reference == outRef }
  )
  
  input.output.address
}


fn getValueSpend(transaction : Transaction, myAddress : Address) -> Value{
      list.foldl(transaction.inputs, 
                 zero, 
                 fn( input, n) { if (myAddress.payment_credential == input.output.address.payment_credential)
                                  {
                                    merge(n, input.output.value )
                                  } else {
                                    n
                                  }
                                }
                  )
                                    
}

fn getChangeValue(transaction : Transaction, myAddress : Address) -> Value{
    list.foldl(transaction.outputs, 
               zero, 
               fn(output , n) { if (myAddress == output.address){
                                merge(n, output.value)
                              } else{
                                n
                              }
   })

}

fn getTotalSpend(transaction: Transaction, myAddress: Address) -> Value {
  let valueSpend = getValueSpend(transaction, myAddress) 
  let changeValue = getChangeValue(transaction, myAddress)

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

fn getDescriptorFromTokenName(policy: PolicyId, assetName: AssetName, transaction: Transaction) -> Option<SmartMultisigDescriptor> {
  let hostUtxo = transaction.reference_inputs 
    |> list.find(fn(x) { quantity_of(x.output.value, policy, assetName) > 0 })
  
  hostUtxo
    |> option.and_then(fn(utxo) {
      when utxo.output.datum is {
        InlineDatum(data) ->
          if data is descriptor: SmartMultisigDescriptor {
            Some(descriptor)
          } else {
            None
          }
        _ -> None
      }
    })
}

fn validate(segment: SmartMultisigDescriptor, transaction: Transaction) -> Bool {
  when segment is {
    KeyHash(keyHash) ->
      list.any(
        transaction.extra_signatories,
        fn(signer) { signer == keyHash },
      )
    NftHolder(policy, name) ->
      or {
        list.any(
          transaction.inputs,
          fn(input) { quantity_of(input.output.value, policy, name) >= 1 },
        ),
        when getDescriptorFromTokenName(policy , name , transaction)  is {
            Some(descriptor) ->validate(descriptor ,  transaction)  
            None -> False
        }
               
      }
    AtLeast(scripts, m) ->
      list.count(scripts, fn(script) { validate(script, transaction) }) >= m
    Before(slot) ->
      interval.is_entirely_before(transaction.validity_range, slot)
    After(slot) ->
      interval.is_entirely_after(transaction.validity_range, slot)
  }
}
