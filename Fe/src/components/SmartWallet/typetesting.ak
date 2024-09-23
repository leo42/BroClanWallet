use aiken/cbor
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/option
use cardano/assets.{AssetName, PolicyId}
use cardano/script_context.{ScriptContext}

pub type Datum {
  owner: VerificationKeyHash,
}

pub type SmartMultisigDescriptor {
  KeyHash { keyHash: VerificationKeyHash }
  NftHolder { policy: PolicyId, name: AssetName }
  AtLeast { scripts: List<SmartMultisigDescriptor>, m: Int }
  Before { time: Int }
  After { time: Int }
}

test serializeKeyHash() {
  let keyHash: VerificationKeyHash =
    #"ffb645124aa91654bc3b2818184e5fd3ae7e58a1931eaab9ba45820a"
  let descriptor = KeyHash { keyHash }
  trace cbor.serialise(descriptor)
  True
}
