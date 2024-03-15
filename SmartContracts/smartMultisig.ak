use aiken/list
use aiken/interval
use aiken/time.{PosixTime}
use aiken/transaction/credential.{VerificationKey}
use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction/value.{ PolicyId , AssetName  }
use aiken/transaction.{ ScriptContext }



type SmartMultisigDescriptor {
    KeyHash { keyHash : Hash<Blake2b_224, VerificationKey>}
    NftHolder { policy : PolicyId, name: AssetName }
    AtLeast {  scripts: List<SmartMultisigDescriptor> , m: Int }
    Before { time: PosixTime }
    After { time: PosixTime }
}

validator(descriptor: SmartMultisigDescriptor ) {

  fn smartMultisig(  _, ctx: ScriptContext) -> Bool {
    validate(descriptor, ctx)
     
  }
}
 

fn validate(segment: SmartMultisigDescriptor,ctx: ScriptContext) -> Bool{
    when segment is { 
      KeyHash(keyHash) -> list.any(ctx.transaction.extra_signatories, fn(signer) { signer == keyHash} ) 
      NftHolder(policy, name) -> list.any(ctx.transaction.inputs, fn(input) {
        value.quantity_of(input.output.value, policy, name) >= 1  
      } )
      AtLeast(scripts,m) -> list.count(scripts , fn(script)  {
                                validate(script, ctx)} 
                            ) >= m
      Before(slot) -> interval.is_entirely_before(ctx.transaction.validity_range, slot) 
      After(slot) -> interval.is_entirely_after( ctx.transaction.validity_range, slot)
    }
     
}