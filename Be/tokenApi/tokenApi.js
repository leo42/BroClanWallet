const express = require("express");
const { MongoClient } = require("mongodb");
const config = require('./config.js');
const cors = require('cors');

const imageBuffer = {}

var  tokens

async function main() { 
    const app = express();
    const client = new MongoClient(config.mongoUri);
    await client.connect();
    app.use(cors());
    const db = client.db(config.dbName);
    tokens = db.collection("Tokens");
    app.get("/api/:tokenVault/tokens", async (req, res) => {
        const resault = await getTokens(req.params.tokenVault);
        res.json(resault);
    });

    app.get("/api/:tokenVault/image.png", async (req, res) => {
        res.set('Content-Type', 'image/png');
        res.send(await getImage(req.params.tokenVault))
    
    });

    app.listen(config.port, () => {
        console.log(`Example app listening on port ${config.port}`)
      })
}


async function getImage(tokenVault) {
    const tokenInfo = await tokens.findOne({id : tokenVault}, { projection: { imageVersion: 1  } }) 
    if (tokenInfo === null) {
        return({error: "no such token vault"})
    }else{
        if (imageBuffer[tokenVault] === undefined || imageBuffer[tokenVault].imageVersion !== tokenInfo.imageVersion) {
            imageBuffer[tokenVault] = await tokens.findOne({id : tokenVault}, { projection: { image: 1 , imageVersion: 1 } })
            imageBuffer[tokenVault].time = Date.now()
            if (Object.keys(imageBuffer).length > config.bufferSize) {
                let oldest = {time : Date.now()}
                Object.keys(imageBuffer).map((key) => {
                    if (imageBuffer[key].time < oldest.time) {
                        oldest = key
                    }
                })
                delete imageBuffer[oldest]
            }
            
        }
        console.log(Object.keys(imageBuffer).length)
        return imageBuffer[tokenVault].image.buffer
    }
}

async function getTokens(tokenVault) {
    const result = await tokens.findOne({id : tokenVault} ,  { projection: { utxos: 1 } } )
   
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