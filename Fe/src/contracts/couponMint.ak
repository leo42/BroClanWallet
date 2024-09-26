use aiken/collection/dict
use aiken/collection/list
use cardano/transaction.{ Transaction}
use cardano/assets.{AssetName, PolicyId}



validator minting(adminPolicy: PolicyId, adminTokenName: AssetName) {
  
    mint(_redeemer, policyId: PolicyId, self: Transaction) {

        let adminAuthorized =
          list.any(
            self.inputs,
            fn(input) {
              assets.quantity_of(input.output.value, adminPolicy, adminTokenName) == 1
            },
          )
        let minted =
          assets.tokens(self.mint, policyId)
        let onlyBurn = list.all(dict.values(minted), fn(value) { value < 0 })

        adminAuthorized || onlyBurn
      }
}
