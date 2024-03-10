use aiken/list
use aiken/dict
use aiken/transaction/value.{ PolicyId , AssetName  }
use aiken/transaction.{ ScriptContext, Mint  }


validator(policy: PolicyId, tokenName: AssetName ) {
  fn minting( _, ctx: ScriptContext) {  
  when ctx.purpose is {
      Mint(policyId) -> {
        let adminAuthorized =  list.any(ctx.transaction.inputs, fn(input) {
          value.quantity_of(input.output.value, policy, tokenName) == 1  
        }  )
        
        let minted = value.tokens( value.from_minted_value(ctx.transaction.mint), policyId)
        
        let onlyBurn = list.all( dict.values(minted), fn(value) {value < 0} )

        adminAuthorized || onlyBurn
      }
      _ -> False
      }
  }     
}

