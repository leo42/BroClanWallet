
const express = require('express');
const fs = require('fs');

const app = express();
const http = require('http');
const { Server } = require("socket.io");
const axios = require('axios');
const { MongoClient } = require("mongodb");


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

const startTime = "2022-05-29T20:55:00.000000Z"
const server = http.createServer(app);






let tsBuildersByClient = new Map();
var botProtectionThreshold = 0.85
//console.log(config.Ed25519KeyHash)


main()
  
  async function main() {

const io = new Server(server,{

});




io.on('connection', (socket ) => {
  console.info(`Client connected [id=${socket.id}]`);
  tsBuildersByClient.set(socket.id, "Void");
 
  
  socket.on('disconnect', () => {
    tsBuildersByClient.delete(socket.id);
    console.info(`Client gone [id=${socket.id}]`);
    
  });
  
 
  socket.on('authentication_start', (data) => {
    console.log("authentication Start", data)
    socket.emit('authentication_challenge', {challenge: "challenge"})
  })

  socket.on('authentication_response', (data) => {
    console.log(data)}
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

