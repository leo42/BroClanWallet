use aiken/collection/dict
use aiken/collection/list
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{Transaction}

validator minting {
  mint(_redeemer, policyId: PolicyId, self: Transaction) {
    let adminPolicy: PolicyId =
      #"592fb0f9d8ed15c06858118d134d5c4b7c77320507810fee9ac2ddf9"
    let adminTokenName: AssetName = #"61647361666177"

    let adminAuthorized =
      list.any(
        self.inputs,
        fn(input) {
          assets.quantity_of(input.output.value, adminPolicy, adminTokenName) == 1
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
