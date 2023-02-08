
const express = require('express');
const fs = require('fs');
var crypt = require("crypto");
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const axios = require('axios');
const { MongoClient } = require("mongodb");
const CardanoWasm  = require("@dcspark/cardano-multiplatform-lib-nodejs");
const MS = require('@emurgo/cardano-message-signing-nodejs');

const uri = "mongodb://0.0.0.0:27017/?directConnection=true";
const client = new MongoClient(uri);
const connection = client.connect();
var transactions = null;
var wallets = null;
var users = null;
connection.then(() => {
  console.log("Connected correctly to server");
  transactions= client.db('MWallet').collection("transactions");
  wallets = client.db('MWallet').collection("wallets");
  users = client.db('MWallet').collection("Users");
}).catch(err => {
  console.log(err.stack);
});



const server = http.createServer(app);


let verification = new Map();
//console.log(config.Ed25519KeyHash)


main()
  
  async function main() {

const io = new Server(server,{

});




io.on('connection', (socket ) => {
  console.info(`Client connected [id=${socket.id}]`);
  verification.set(socket.id, "Void");
 console.log(verify("addr_test1qpceptsuy658a4tjartjqj29fhwgwnfkq2fur66r4m6fpc73h7m9jt9q7mt0k3heg2c6sckzqy2pvjtrzt3wts5nnw2q9z6p9m",
             "6368616c6c656e67655f363963646466353934653630303361356361623730326436323830333630306265363563323232306461393666353135383766623036653633623339396666356665643461333034",
             {
                   signature: '845846a2012767616464726573735839007190ae1c26a87ed572e8d72049454ddc874d360293c1eb43aef490e3d1bfb6592ca0f6d6fb46f942b1a862c2011416496312e2e5c2939b94a166686173686564f458526368616c6c656e67655f3639636464663539346536303033613563616237303264363238303336303062653635633232323064613936663531353837666230366536336233393966663566656434613330345840b272caf5970c60012d298c6afdbfa950ce3ac90cceed19dc17b82174a78f9f83cd23662dd319392893a1793bb8a0edc5044111a2712a97eaaf2576231f231603',
                   key: 'a401010327200621582024a97c7d033acb4292cacac9e6de546b9a02e1492d7f76226c8e5ed5be5aa133'
                 }));
  
  socket.on('disconnect', () => {
    verification.delete(socket.id);
    console.info(`Client gone [id=${socket.id}]`);
    
  });
  
 
  socket.on('authentication_start', (data) => {
    console.log("authentication Start", data)
    

    
    verification[socket.id] = { state: "Challenge" , challenge_string: stringToHex("challenge_" + (crypt.randomBytes(36).toString('hex')))}
    socket.emit('authentication_challenge', {challenge: verification[socket.id].challenge_string})

  })

  socket.on('authentication_response', (data) => {
    console.log("authentication responsea", data)
    const { address, signature } = data;
    const { challenge_string } = verification[socket.id];
    console.log(address, challenge_string, signature)
    console.log(verify( address, challenge_string, signature))


    
  })

  socket.on('authentication', (data) => {
    console.log(data)


     socket.on('initilize_multisig', (data) => {
      console.log(data)
      });
      
      
      socket.on('witness', (signature) => { 
        
      });

  });
  
});

};


app.get('/api', function(req, res) {
  console.log(__dirname + 'public')
  console.log("Hey")
  res.sendfile('public/index.html');
});

app.use(express.static(__dirname + '\\public'))
server.listen(3001, () => {
  console.log('listening on *:3001');
});



const verify = (address, payload, walletSig) => {
  const coseSign1 = MS.COSESign1.from_bytes(Buffer.from(walletSig.signature, 'hex'));
  const coseKey = MS.COSEKey.from_bytes(Buffer.from(walletSig.key, 'hex'));
  const payloadCose = coseSign1.payload();
  console.log(JSON.stringify(coseKey))
  if (verifyPayload(payload, payloadCose))
    throw new Error('Payload does not match');
  const keyHeaders = coseKey.header(MS.Label.new_int( MS.Int.new_i32(-2))).as_bytes()
  const protectedHeaders = coseSign1
    .headers()
    .protected()
    .deserialized_headers();
  const addressCose =CardanoWasm.Address.from_bytes(
    protectedHeaders.header(MS.Label.new_text('address')).as_bytes()
  );
  const publicKeyCose = CardanoWasm.PublicKey.from_bytes( keyHeaders );

  if (!verifyAddress(address, addressCose, publicKeyCose))
   throw new Error('Could not verify because of address mismatch');

  const signature =CardanoWasm.Ed25519Signature.from_bytes(coseSign1.signature());
  const data = coseSign1.signed_data().to_bytes();
  return publicKeyCose.verify(data, signature);
};

const verifyPayload = (payload, payloadCose) => {
  return Buffer.from(payloadCose, 'hex').compare(Buffer.from(payload, 'hex'));
};

function stringToHex(str) {
  var hex = '';
  for (var i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16);
  }
  return hex;
};

const verifyAddress = (address, addressCose, publicKeyCose) => {
  const checkAddress = CardanoWasm.Address.from_bech32(address);
  if (addressCose.to_bech32() !== checkAddress.to_bech32()) return false;
  // check if BaseAddress
  try {
    const baseAddress = CardanoWasm.BaseAddress.from_address(addressCose);
    //reconstruct address
    const paymentKeyHash = publicKeyCose.hash();
    const stakeKeyHash = baseAddress.stake_cred().to_keyhash();
    const reconstructedAddress = CardanoWasm.BaseAddress.new(
      checkAddress.network_id(),
      CardanoWasm.StakeCredential.from_keyhash(paymentKeyHash),
      CardanoWasm.StakeCredential.from_keyhash(stakeKeyHash)
    );
    if (
      checkAddress.to_bech32() !== reconstructedAddress.to_address().to_bech32()
    )
      return false;

    return true;
  } catch (e) {}
  // check if RewardAddress
  try {
    //reconstruct address
    const stakeKeyHash = publicKeyCose.hash();
    const reconstructedAddress = CardanoWasm.RewardAddress.new(
      checkAddress.network_id(),
      CardanoWasm.StakeCredential.from_keyhash(stakeKeyHash)
    );
    if (
      checkAddress.to_bech32() !== reconstructedAddress.to_address().to_bech32()
    )
      return false;

    return true;
  } catch (e) {}
  return false;
};