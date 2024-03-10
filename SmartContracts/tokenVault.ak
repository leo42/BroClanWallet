use aiken/list
use aiken/transaction/value.{ PolicyId , AssetName  }
use aiken/transaction.{ ScriptContext    }


validator(policy: PolicyId, tokenName: AssetName ) {
  fn spending( __, _, ctx: ScriptContext) {
    list.any(ctx.transaction.inputs, fn(input) {
        value.quantity_of(input.output.value, policy, tokenName) >= 1  
      } )
  }
}
