use aiken/collection/dict
use aiken/crypto.{VerificationKeyHash}
use aiken/interval.{
  Finite, Interval, IntervalBound, NegativeInfinity, PositiveInfinity,
}
use cardano/address.{from_script}
use cardano/assets.{PolicyId, from_lovelace, zero}
use cardano/transaction.{Input, NoDatum, Output, OutputReference, Transaction}
use smartmulitisg.{
  After, AtLeast, KeyHash, NftHolder, SmartMultisigDescriptor, validate,
}

pub type Datum {
  owner: VerificationKeyHash,
}

fn create_base_transaction(
  validity_range: Interval<Int>,
  extra_signatories: List<VerificationKeyHash>,
) -> Transaction {
  let address = from_script("")
  Transaction {
    inputs: [
      Input {
        output_reference: OutputReference {
          transaction_id: #"ffb645124aa91654bc3b2818184e5fd3ae7e58a1931eaab9ba45820a",
          output_index: 0,
        },
        output: Output {
          address,
          value: from_lovelace(100000000),
          datum: NoDatum,
          reference_script: None,
        },
      },
    ],
    reference_inputs: [],
    outputs: [
      Output {
        address,
        value: from_lovelace(100000000),
        datum: NoDatum,
        reference_script: None,
      },
    ],
    fee: 100000,
    mint: zero,
    certificates: [],
    withdrawals: [],
    validity_range,
    extra_signatories,
    redeemers: [],
    datums: dict.from_pairs([]),
    id: #"",
    votes: [],
    proposal_procedures: [],
    current_treasury_amount: None,
    treasury_donation: None,
  }
}

fn create_test_descriptor() -> SmartMultisigDescriptor {
  let policyId: PolicyId =
    #"79dfc51ebff0b40e596e6ce59a0e3306038c7214afd40f9bf1f15cd1"
  let key_hash = #"ffb645124aa91654bc3b2818184e5fd3ae7e58a1931eaab9ba45820a"
  AtLeast {
    scripts: [
      KeyHash { keyHash: key_hash },
      NftHolder { policy: policyId, name: #"124212" },
      After { time: 172800 },
    ],
    m: 1,
  }
}

const empty_transaction =
  create_base_transaction(
    Interval {
      lower_bound: IntervalBound {
        bound_type: NegativeInfinity,
        is_inclusive: False,
      },
      upper_bound: IntervalBound {
        bound_type: PositiveInfinity,
        is_inclusive: False,
      },
    },
    [],
  )

const signed_transaction =
  create_base_transaction(
    Interval {
      lower_bound: IntervalBound {
        bound_type: NegativeInfinity,
        is_inclusive: False,
      },
      upper_bound: IntervalBound {
        bound_type: PositiveInfinity,
        is_inclusive: False,
      },
    },
    [#"ffb645124aa91654bc3b2818184e5fd3ae7e58a1931eaab9ba45820a"],
  )

const after_transaction =
  create_base_transaction(
    Interval {
      lower_bound: IntervalBound {
        bound_type: Finite(172800),
        is_inclusive: False,
      },
      upper_bound: IntervalBound {
        bound_type: PositiveInfinity,
        is_inclusive: False,
      },
    },
    [],
  )

test validateAfter() {
  let descriptor = create_test_descriptor()
  expect validate(descriptor, after_transaction)
}

test validateSignature() {
  let descriptor =
    KeyHash {
      keyHash: #"ffb645124aa91654bc3b2818184e5fd3ae7e58a1931eaab9ba45820a",
    }
  expect validate(descriptor, signed_transaction)
  expect not(validate(descriptor, after_transaction))
  expect not(validate(descriptor, empty_transaction))
}
