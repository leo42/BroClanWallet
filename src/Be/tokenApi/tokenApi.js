const express = require("express");
const { MongoClient } = require("mongodb");
const config = require('./config.js');

var  tokens

async function main() { 
    const app = express();
    const client = new MongoClient(config.mongoUri);
    await client.connect();
    const db = client.db("TokenVaults");
    tokens = db.collection("Tokens");
    app.get("/api/:tokenVault/tokens", async (req, res) => {
        const resault = await getTokens(req.params.tokenVault);
        res.json(resault);
    });

    app.get("/api/:tokenVault/image.png", async (req, res) => {
        const result = await tokens.findOne({id : req.params.tokenVault})
        if (result === null) {
            res.json({error: "no such token vault"})
        }else{
        //image is buffer type I want to send it as png to load in the browser


        res.set('Content-Type', 'image/png');
        res.send(result.image.buffer);
        console.log(typeof(result.image))
    }
    });

    app.listen(config.port, () => {
        console.log(`Example app listening on port ${config.port}`)
      })
}


async function getTokens(tokenVault) {
    const result = await tokens.findOne({id : tokenVault})
   
    if (result === null) {
        return {error: "no such token vault"}
    }
    const utxos = result.utxos.filter((utxo) => {
        return utxo.spent === false;
    });

    const tokenList = {};
    utxos.map((utxo) => {
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