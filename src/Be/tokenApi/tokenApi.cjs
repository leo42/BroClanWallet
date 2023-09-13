const express = require("express");
const { MongoClient } = require("mongodb");

var  tokens

async function main() { 
    config = await import("./config.js")
    config = ({ ...config }).default;
    const app = express();
    const client = new MongoClient(config.mongoUri);
    await client.connect();
    const db = client.db("TokenVaults");
    tokens = db.collection("Tokens");
    app.get("/api/:tokenVault/tokens", async (req, res) => {
        const resault = await getTokens(req.params.tokenVault);
        res.json(resault);
    });

    app.listen(config.port, () => {
        console.log(`Example app listening on port ${config.port}`)
      })
}


async function getTokens(tokenVault) {
    console.log(tokenVault)
    const result = await tokens.findOne({id : tokenVault})
    console.log(result)
    const utxos = result.utxos.filter((utxo) => {
        return utxo.spent === false;
    });

    const tokenList = {};
    result.utxos.map((utxo) => {
        if (tokenList["lovelace"] === undefined) {
            tokenList["lovelace"] = 0;
        }
        tokenList["lovelace"] += utxo.value.ada.lovelace;
        Object.keys(utxo.value).map((policyId) => {
            if (policyId === "ada" ) return
            Object.keys(utxo.value[policyId]).map((assetName) => {
                if (tokenList[policyId+assetName] === undefined) {
                    tokenList[policyId+assetName] = 0;
                }
                tokenList[policyId+assetName] += utxo.value[policyId][assetName];
            });
    });
    });
    return tokenList;

}
main()