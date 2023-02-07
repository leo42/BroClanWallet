
const express = require('express');
const fs = require('fs');
var crypt = require("crypto");
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const axios = require('axios');
const { MongoClient } = require("mongodb");
const  CardanoWasm  = require("@dcspark/cardano-multiplatform-lib-nodejs");

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
 
  
  socket.on('disconnect', () => {
    verification.delete(socket.id);
    console.info(`Client gone [id=${socket.id}]`);
    
  });
  
 
  socket.on('authentication_start', (data) => {
    console.log("authentication Start", data)
    //set the challenge for the user to sign with a random String


    verification[socket.id] = { state: "Challenge" , challenge_string: "challenge_" + (crypt.randomBytes(36).toString('hex'))}
    //set the challenge for the user to sign with a random String

    socket.emit('authentication_challenge', {challenge: verification[socket.id].challenge_string})

  })

  socket.on('authentication_response', (data) => {
    console.log("authentication responsea", data)
    const { address, signature } = data;
    const { challenge_string } = verification[socket.id];
    const  pubkeyHash = CardanoWasm.Address.from_bech32(address).payment_cred().to_scripthash().to_hex();
    console.log(pubkeyHash)
  }
    )

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

