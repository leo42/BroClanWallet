const express = require('express');
const fs = require('fs');

const app = express();
const http = require('http');
const { Server } = require("socket.io");
const axios = require('axios');

//const privateKey = fs.readFileSync('/etc/letsencrypt/live/api.testnet.clownsinc.com/privkey.pem', 'utf8');
//const certificate = fs.readFileSync('/etc/letsencrypt/live/api.testnet.clownsinc.com/cert.pem', 'utf8');
//const ca = fs.readFileSync('/etc/letsencrypt/live/api.testnet.clownsinc.com/chain.pem', 'utf8');

//const credentials = {
//	key: privateKey,
//	cert: certificate,
//	ca: ca
//};

const startTime = "2022-05-29T20:55:00.000000Z"
const server = http.createServer(app);






let tsBuildersByClient = new Map();
let nftsByClient = new Map();
var botProtectionThreshold = 0.85
//console.log(config.Ed25519KeyHash)


main()
  
  async function main() {



const io = new Server(server,{
  cors: {
    origin: "http://testnet.clownsinc.com",
    methods: ["GET", "POST"]
  }
});


app.get('/', function(req, res) {
  console.log(__dirname + 'public')
  res.sendfile('public/index.html');
});


io.on('connection', (socket) => {
  console.info(`Client connected [id=${socket.id}]`);
  // initialize this client's sequence number
  tsBuildersByClient.set(socket.id, "Void");
  nftsByClient.set(socket.id, []);
  
  //  console.log(socket);
  
  

  
  
  socket.on('disconnect', () => {
    tsBuildersByClient.delete(socket.id);
    nftsByClient.delete(socket.id);
    console.info(`Client gone [id=${socket.id}]`);
    
  });
  
  socket.on('initilize_multisig', (data) => {
  });
  
  
  socket.on('witness', (feWitness) => { 
    
  });
});

};

app.use(express.static(__dirname + '\\public'))
server.listen(3001, () => {
  console.log('listening on *:3001');
});

