
use aiken/interval.{Finite}
use aiken/list
use aiken/hash
use aiken/option
use aiken/dict
use aiken/transaction/value.{Value, PolicyId , AssetName }
use aiken/transaction.{Transaction, ScriptContext, Mint , Datum , InlineDatum }


type AdminDatum {
      mintAmount: Int,
      afiliateBounty: Int
}


validator {
  fn minting( _redeemer: Void, ctx: ScriptContext) {
    // In principle, scripts can be used for different purpose (e.g. minting
    // assets). Here we make sure it's only used when 'spending' from a eUTxO
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
 
fn payment_made(transaction: Transaction, policyId:PolicyId ) {
  let adminTokenPolicy : PolicyId = #"72ff4773518459890ea5224018c10f7487a339ea0a9e42ac6826f829" 
  let adminTokenName : AssetName  = #"41646d696e4b6579"

  let tokensMintedAmount = value.tokens( value.from_minted_value(transaction.mint), policyId)
                      |> dict.size()
  
  let adminUtxo = transaction.reference_inputs 
                     |> list.find(fn(x) { ( value.quantity_of(x.output.value  ,adminTokenPolicy ,adminTokenName) > 0 ) } )
                     
                     
                     

  let regularPriceOption : Option<Datum> = option.map(adminUtxo, fn(utxo) {(utxo.output.datum)})            

  
  
  True
}
 
 fn mint_consumed_utxos(transaction: Transaction,  policyId:PolicyId) {
  let tokensMinted = value.tokens( value.from_minted_value(transaction.mint), policyId)
  
   True
}
