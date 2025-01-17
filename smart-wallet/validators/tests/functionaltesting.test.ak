use aiken/collection/dict
use aiken/crypto.{VerificationKeyHash}
use aiken/interval.{
  Finite, Interval, IntervalBound, NegativeInfinity, PositiveInfinity,
}
use cardano/address.{from_script}
use cardano/assets.{PolicyId, Value, from_asset, from_lovelace, zero}
use cardano/transaction.{Input, NoDatum, Output, OutputReference, Transaction}
use smartmulitisg.{
  After, AtLeast, Before, KeyHash, NftHolder, SmartMultisigDescriptor, validate,
}

const nft_holder_policy =
  #"79dfc51ebff0b40e596e6ce59a0e3306038c7214afd40f9bf1f15cd1"

const nft_holder_name = #"124212"

const key_hash = #"ffb645124aa91654bc3b2818184e5fd3ae7e58a1931eaab9ba45820a"

fn create_base_transaction(
  validity_range: Interval<Int>,
  extra_signatories: List<VerificationKeyHash>,
  nft_holder: Value,
) -> Transaction {
  let address = from_script("")
  Transaction {
    inputs: [
      Input {
        output_reference: OutputReference {
          transaction_id: key_hash,
          output_index: 0,
        },
        output: Output {
          address,
          value: nft_holder,
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
    from_lovelace(100000000),
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
    [key_hash],
    from_lovelace(100000000),
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
    from_lovelace(100000000),
  )

const after_invalid_transaction_edge =
  create_base_transaction(
    Interval {
      lower_bound: IntervalBound {
        bound_type: Finite(172799),
        is_inclusive: False,
      },
      upper_bound: IntervalBound {
        bound_type: PositiveInfinity,
        is_inclusive: False,
      },
    },
    [],
    from_lovelace(100000000),
  )

const before_transaction =
  create_base_transaction(
    Interval {
      lower_bound: IntervalBound {
        bound_type: NegativeInfinity,
        is_inclusive: False,
      },
      upper_bound: IntervalBound {
        bound_type: Finite(172800),
        is_inclusive: False,
      },
    },
    [],
    from_lovelace(100000000),
  )

const before_invalid_transaction_edge =
  create_base_transaction(
    Interval {
      lower_bound: IntervalBound {
        bound_type: NegativeInfinity,
        is_inclusive: False,
      },
      upper_bound: IntervalBound {
        bound_type: Finite(172801),
        is_inclusive: False,
      },
    },
    [],
    from_lovelace(100000000),
  )

const nft_holder_transaction =
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
    from_asset(nft_holder_policy, nft_holder_name, 1),
  )

test validateAfter() {
  let descriptor = After { time: 172800 }
  expect validate(descriptor, after_transaction)
  expect not(validate(descriptor, empty_transaction))
  expect not(validate(descriptor, signed_transaction))
  expect not(validate(descriptor, after_invalid_transaction_edge))
}

test validateSignature() {
  let descriptor = KeyHash { keyHash: key_hash }
  expect validate(descriptor, signed_transaction)
  expect not(validate(descriptor, after_transaction))
  expect not(validate(descriptor, empty_transaction))
}

test validateBefore() {
  let descriptor = Before { time: 172800 }
  expect validate(descriptor, before_transaction)
  expect not(validate(descriptor, empty_transaction))
  expect not(validate(descriptor, signed_transaction))
  expect not(validate(descriptor, after_transaction))
  expect not(validate(descriptor, after_invalid_transaction_edge))
  expect not(validate(descriptor, before_invalid_transaction_edge))
}

test nftHolder() {
  let descriptor =
    NftHolder { policy: nft_holder_policy, name: nft_holder_name }

  expect validate(descriptor, nft_holder_transaction)
  expect !validate(descriptor, before_transaction)
  expect not(validate(descriptor, empty_transaction))
  expect not(validate(descriptor, signed_transaction))
  expect not(validate(descriptor, after_transaction))
  expect not(validate(descriptor, after_invalid_transaction_edge))
  expect not(validate(descriptor, before_invalid_transaction_edge))
}

test atLeast() {
  let descriptor =
    AtLeast {
      scripts: [
        Before { time: 172800 },
        After { time: 172800 },
        NftHolder { policy: nft_holder_policy, name: nft_holder_name },
        KeyHash { keyHash: key_hash },
      ],
      m: 1,
    }

  expect validate(descriptor, nft_holder_transaction)
  expect validate(descriptor, before_transaction)
  expect validate(descriptor, after_transaction)
  expect validate(descriptor, signed_transaction)
  expect not(validate(descriptor, before_invalid_transaction_edge))
  expect not(validate(descriptor, after_invalid_transaction_edge))
  expect not(validate(descriptor, empty_transaction))
}
