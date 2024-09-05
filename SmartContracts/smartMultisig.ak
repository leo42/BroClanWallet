use aiken/crypto.{  VerificationKeyHash}
use cardano/assets.{AssetName, PolicyId, quantity_of}
use aiken/collection/list
use cardano/transaction.{ Transaction}
use cardano/script_context.{ScriptContext}
use aiken/interval

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

validator smartMultisig (descriptor: SmartMultisigDescriptor)  {
  else( ctx: ScriptContext) -> Bool {
    validate(descriptor, ctx)
  }
}


fn validate(segment: SmartMultisigDescriptor, ctx: ScriptContext) -> Bool {
  when segment is {
    KeyHash(keyHash) ->
      list.any(
        ctx.transaction.extra_signatories,
        fn(signer) { signer == keyHash },
      )
    NftHolder(policy, name) ->
      list.any(
        ctx.transaction.inputs,
        fn(input) { quantity_of(input.output.value, policy, name) >= 1 },
      )
    AtLeast(scripts, m) ->
      list.count(scripts, fn(script) { validate(script, ctx) }) >= m
    Before(slot) ->
      interval.is_entirely_before(ctx.transaction.validity_range, slot)
    After(slot) ->
      interval.is_entirely_after(ctx.transaction.validity_range, slot)
  }
}
