use aiken/collection/dict
use aiken/collection/list
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use env

validator minting {
  mint(_redeemer, policyId: PolicyId, self: Transaction) {
    let adminAuthorized =
      list.any(
        self.inputs,
        fn(input) {
          assets.quantity_of(
            input.output.value,
            env.couponAdminPolicy,
            env.couponAdminTokenName,
          ) == 1
        },
      )
    let minted = assets.tokens(self.mint, policyId)
    let onlyBurn = list.all(dict.values(minted), fn(value) { value < 0 })

    adminAuthorized || onlyBurn
  }

  else(_) {
    fail
  }
}
