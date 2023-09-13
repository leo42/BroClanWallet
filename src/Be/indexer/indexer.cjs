const WebSocket = require('ws');
const { MongoClient } = require("mongodb");
let Lucid = import("lucid-cardano")

let Wallet = import("../../wallets/TokenWallet.js")
const client = new WebSocket("ws://194.163.159.42:1337");



function rpc(method, params, id) {
    client.send(JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id
    }));
}

let mongoClient 
let config 
let lucid 
let tokens

async function checkMint(tx, slot){
    if(tx.mint && Object.keys(tx.mint).includes(config.policyId)){
        const keysMinted = Object.keys(tx.mint[config.policyId])
        keysMinted.map( async (token) => {
            const key = {id: token}
            key["slot"] = slot
            const wallet = new Wallet.default(config.policyId+token, config.api)    
            await wallet.initialize(config.settings)
            key["address"] = wallet.getAddress()
            key["utxos"] = []
            const paymentCredential = wallet.getPaymentCredential()
            key["paymentCredential"] = paymentCredential.hash
            await tokens.insertOne(key)
        })
        


    }
}
async function checkTransaction(tx, slot){
    //console.log(tx)
    if(tx.outputs){
        tx.outputs.map( async (output, index) => {
            let outputCred
            try{
                outputCred = await lucid.utils.getAddressDetails(output.address).paymentCredential
        
            if(outputCred.type === "Script"){
                if(await tokens.findOne({paymentCredential: outputCred.hash})){
                    const utxoData = output
                    utxoData["spent"] = false
                    utxoData["spenttime"] = 0
                    utxoData["createdtime"] = slot
                    utxoData["id"] = tx.id
                    utxoData["index"] = index
                    tokens.updateOne({paymentCredential: outputCred.hash}, {$push: {utxos: output }, $set: {imageUpdate: true}})
              
                }
            }
        }
            catch(e){
                
            }
        })

    }
    if(tx.inputs){
        tx.inputs.map( async (input) => {
           if((await tokens.findOne({utxos: {$elemMatch: {id: input.transaction.id , index: input.index } }})) !== null){
                tokens.updateOne({utxos: {$elemMatch: {id: input.transaction.id, index: input.index }}}, {$set: {"utxos.$.spent": true, "utxos.$.spenttime": slot, imageUpdate: true}})
            }
        })
    }

}   

async function rollBack(intersection){
    tokens.deleteMany({slot: {$gte: intersection.slot}})
    tokens.updateMany({utxos: {$elemMatch: {spenttime: {$gte: intersection.slot}}}}, {$set: {"utxos.$.spent": false, "utxos.$.spenttime": 0}})
    tokens.updateMany({utxos: {$elemMatch: {createdtime: {$gte: intersection.slot}}}}, {$pull: {utxos: {createdtime: {$gte: intersection.slot}}}})    
}

async function cleanUtxos(){
    // remove utxos that are spent more than 36 hours ago
    const current = await mongoClient.db("TokenVaults").collection("syncStatus").findOne({flag: "preprod"})
    tokens.updateMany({utxos: {$elemMatch: {spenttime: {$lte: current.slot - 129600000}}}}, {$pull: {utxos: {spenttime: {$lte: current.slot - 129600000}}}})
}

async function main(){
    config = await import("./config.js")
    config = ({ ...config }).default;
    console.log(config)
    mongoClient = new MongoClient(config.mongoUri);
    Lucid = await Promise.resolve(Lucid)
    lucid = await Lucid.Lucid.new(
        undefined,
        config.settings.network
      );
    await mongoClient.connect();
    tokens = mongoClient.db("TokenVaults").collection("Tokens")
    Wallet = await Promise.resolve(Wallet)
    const startpoint = await mongoClient.db("TokenVaults").collection("syncStatus").findOne({flag: "preprod"})
    console.log(startpoint)
    //clean utxos every 30 minutes
    setInterval(cleanUtxos, 1800000)  
    rpc("findIntersection", { points: [{slot: startpoint.slot, id : startpoint.id }] }, "find-intersection");
}



client.once('open', () => {
    main()
    
    
});

client.on('message', async function(msg) {
    const response = JSON.parse(msg);
    switch (response.id) {
        case "find-intersection":
            if (!response.result.intersection) { throw "Whoops? Last Byron block disappeared?" }
            
            await rollBack(response.result.intersection);
            rpc("nextBlock", {}, "main" );
            break;

        default:
            if (response.result.direction === "forward") {
                response.result.block.transactions.map(async (tx) => {
                  await checkTransaction(tx, response.result.block.slot)
                  await checkMint(tx, response.result.block.slot)
                });
            }else if (response.result.direction === "backward"){
                console.log(response.result);
                await rollBack(response.result.point);
               
            }
            //console.log(response)
            if (response.result.block) await mongoClient.db("TokenVaults").collection("syncStatus").updateOne({flag: "preprod"}, {$set: {slot: response.result.block.slot, id: response.result.block.id}}, {upsert: true})
            rpc("nextBlock", {}, response.id );            
            break;
    }
});
