
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
var transactions ;
var wallets ;
connection.then(() => {
  console.log("Connected correctly to server");
  transactions= client.db('MWallet').collection("transactions");
  wallets = client.db('MWallet').collection("wallets");
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
  const   users = client.db('MWallet').collection("Users");
  socket.on('disconnect', () => {
    verification.delete(socket.id);
    console.info(`Client gone [id=${socket.id}]`);
    
  });
  
 
  socket.on('authentication_start', (data) => {
    console.log("authentication Start", data)
    
     users.findOne({authenticationToken: data.token}).then((user) => {
   console.log(user)
    if (user){
      verification[socket.id] = { state: "Authenticated" , user: user.PubkeyHash}
    }else{
      verification[socket.id] = { state: "Challenge" , challenge_string: stringToHex("challenge_" + (crypt.randomBytes(36).toString('hex')))}
      socket.emit('authentication_challenge', {challenge: verification[socket.id].challenge_string})
    }
    }).catch((err) => {
      console.log(err)
      socket.emit('error', {error: "Authentication token not found"})
      socket.disconnect() 
    })
  })

  socket.on('authentication_response', (data) => {
    console.log("authentication responsea", data)
    const { address, signature } = data;
    const { challenge_string } = verification[socket.id];
    console.log(address, challenge_string, signature)
    try{
      const PubkeyHash =  verify( address, challenge_string, signature)
      const authenticationToken = crypt.randomBytes(36).toString('hex')

      users.updateOne( {PubkeyHash: PubkeyHash}, { $set : { PubkeyHash: PubkeyHash , authenticationToken: authenticationToken , issueTime : Date.now() }}, {upsert: true})
      socket.emit('authentication_success', {authenticationToken: authenticationToken})
      verification[socket.id] = { state: "Authenticated" , user: PubkeyHash}

    }catch(err){
      console.log(err)
      socket.emit('error', {error: "Signature verification failed"})
      socket.disconnect()
    } 


    
  })


  
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
  if ( publicKeyCose.verify(data, signature))
      return  publicKeyCose.hash().to_hex()
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