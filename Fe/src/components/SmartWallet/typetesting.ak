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
  let cbor = cbor.serialise(descriptor)
  trace cbor
  cbor == #"d8799f581cffb645124aa91654bc3b2818184e5fd3ae7e58a1931eaab9ba45820aff"
}

test serializeAtLeast() {
  let keyHash: VerificationKeyHash =
    #"ffb645124aa91654bc3b2818184e5fd3ae7e58a1931eaab9ba45820a"
  let descriptor: SmartMultisigDescriptor =
    AtLeast { scripts: [KeyHash { keyHash }], m: 1 }
  let cbor = cbor.serialise(descriptor)
  trace cbor
  cbor == #"d87b9f9fd8799f581cffb645124aa91654bc3b2818184e5fd3ae7e58a1931eaab9ba45820affff01ff"
}
