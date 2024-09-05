use aiken/crypto.{  VerificationKeyHash}
use cardano/assets.{AssetName, PolicyId, quantity_of}
use aiken/collection/list
use cardano/transaction.{ Transaction, InlineDatum}
use cardano/script_context.{ScriptContext}
use aiken/interval
use aiken/option
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


validator smartMultisig (walletId: AssetName)  {

  spend(_, __, ___, self: Transaction) {
    let configPolicy : PolicyId  = #"a653490ca18233f06e7f69f4048f31ade4e3885750beae0170d7c8ae"
    let descriptor = getDescriptorFromTokenName(configPolicy , walletId , self) 
     validate(descriptor, self)
  }
  
  else( ctx: ScriptContext) -> Bool {
    let configPolicy : PolicyId  = #"a653490ca18233f06e7f69f4048f31ade4e3885750beae0170d7c8ae"


    let descriptor = getDescriptorFromTokenName(configPolicy , walletId , ctx.transaction)
    
    validate(descriptor, ctx.transaction)
  }
}

fn getDescriptorFromTokenName(policy : PolicyId, assetName : AssetName, transaction : Transaction) -> SmartMultisigDescriptor{
      let adminUtxo = transaction.reference_inputs 
                     |> list.find(fn(x) { ( quantity_of(x.output.value  ,policy ,assetName) > 0 ) } ) 

    expect descriptor: SmartMultisigDescriptor  = option.or_else(option.map(adminUtxo, fn(utxo) {
                                                                  when (utxo.output.datum) is {
                                                                  InlineDatum(data) -> data
                                                                  _ -> fail}}), None)  
    descriptor  

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
        validate( getDescriptorFromTokenName(policy , name , transaction), 
                  transaction)         
      }
    AtLeast(scripts, m) ->
      list.count(scripts, fn(script) { validate(script, transaction) }) >= m
    Before(slot) ->
      interval.is_entirely_before(transaction.validity_range, slot)
    After(slot) ->
      interval.is_entirely_after(transaction.validity_range, slot)
  }
}
