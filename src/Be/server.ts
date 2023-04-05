
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

const uri =  process.env.MONGO_CONNECTION_STRING ||  "mongodb+srv://cluster0.9drtorw.mongodb.net/test?authMechanism=MONGODB-X509&authSource=%24external&tls=true&tlsCertificateKeyFile=secrets/mongo.pem";
const client = new MongoClient(uri,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true, 
  keepAlive: true,

});

const connection = client.connect();
var transactions ;
var wallets ;
var users;



app.use(express.json());


app.post('/api/wallet', function(req, res) {
  const hash = walletHash(req.body)
  wallets.updateOne( {hash: hash}, {  $setOnInsert : { hash: hash , json: req.body , members: getMemebers(req.body) , creationTime : Date.now() }}, {upsert: true})
  res.sendStatus(200);
});



app.post('/api/transaction', function(req, res) {
  try{
    const data = req.body
    const tx = CardanoWasm.Transaction.from_bytes( Buffer.from(data.tx, 'hex') )
    const txWallet = walletHash(data.wallet)

    const verifiedSighners =  Object.values(data.signatures).map((signature  ) => {
      const witness  =  CardanoWasm.TransactionWitnessSet.from_bytes( Buffer.from(String( signature), 'hex') )
      const signer = witness.vkeys().get(0).vkey().public_key().hash().to_hex();
      if(!witness.vkeys().get(0).vkey().public_key().verify(  CardanoWasm.hash_transaction(tx.body()).to_bytes(), witness.vkeys().get(0).signature())){
        console.log('Invalid signature');
        return
      }else {
        return signer
      }
    })
    
      if(getMemebers(data.wallet).filter((member) => verifiedSighners.includes(member)).length === 0){
        console.log('Signer not member of wallet');
        return
      }
      transactions.updateOne( {hash: CardanoWasm.hash_transaction(tx.body()).to_hex()}, { $set : { hash:  CardanoWasm.hash_transaction(tx.body()).to_hex() , transaction :  Buffer.from(tx.to_bytes(), 'hex').toString('hex') , signatures: data.signatures ,  requiredSigners : tx.body().to_js_value().required_signers , lastUpdate : Date.now(), wallet: txWallet }}, {upsert: true})
    }catch(e){
        console.log(e) 
      }
   
  res.sendStatus(200);
});


app.use(express.static(__dirname + '/public'))








const server = http.createServer(app);
const io = new Server(server,{});





connection.then(() => {
  console.log("Connected correctly to server");
  transactions= client.db('MWallet').collection("transactions");
  users = client.db('MWallet').collection("Users");
  wallets = client.db('MWallet').collection("wallets");
  watchWallets().catch(console.error);
}).catch(err => {
  console.log(err.stack);
  process.exit(1);
});

client.on("close", () => {
  console.error("Lost MongoDB connection");
  process.exit(1);
});

client.on("error", (err) => {
  console.error("MongoDB error:", err);
});

process.on("SIGINT", () => {
  console.log("Closing MongoDB connection");
  client.close().then(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});




let verification = new Map();
let subscriptions = new Map();
//console.log(config.Ed25519KeyHash)


main()
  
  async function main() {


io.on('connection', (socket ) => {
  console.info(`Client connected [id=${socket.id}]`);
  
  socket.on('disconnect', () => {
    if (verification[socket.id].state === "Authenticated"){
      users.findOneAndUpdate({PubkeyHash: verification[socket.id].user}, { $set : { lastLogin: Date.now()}})
    }
    verification.delete(socket.id);
    subscriptions.delete(socket.id);
    console.info(`Client gone [id=${socket.id}]`); 
  });
  
 
  socket.on('authentication_start', (data) => {
    
     users.findOne({authenticationToken: data.token} ).then((user) => {
          if (user){
            users.findOneAndUpdate({authenticationToken: data.token}, { $set : { lastLogin: Date.now()}})
            verification[socket.id] = { state: "Authenticated" , user: user.PubkeyHash}
            subscribeToWallets( socket,  data.wallets , user.lastLogin)            
            findNewWallets(user.PubkeyHash, user.lastLogin, socket )
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
    const { address, signature } = data;
    const { challenge_string } = verification[socket.id];
    try{
      const PubkeyHash =  verify( address, challenge_string, signature)
      const authenticationToken = crypt.randomBytes(36).toString('hex')

      users.findOneAndUpdate( {PubkeyHash: PubkeyHash}, { $set : { PubkeyHash: PubkeyHash , authenticationToken: authenticationToken , issueTime : Date.now(), lastLogin: Date.now() }}, {upsert: true}).then((user) => {
        if (user){
            findNewWallets(PubkeyHash, user.value ? user.value.lastLogin : 0, socket)
            subscribeToWallets( socket,  data.wallets , user.lastLogin) 
        }else{
            findNewWallets(PubkeyHash, 0, socket)
            subscribeToWallets( socket,  data.wallets , user.lastLogin) 
        }
      })
      socket.emit('authentication_success', {authenticationToken: authenticationToken})
      socket.verification= { state: "Authenticated" , user: PubkeyHash}
      verification[socket.id] = { state: "Authenticated" , user: PubkeyHash}

    }catch(err){
      console.log(err)
      socket.emit('error', {error: "Signature verification failed"})
      socket.disconnect()
    } 
 })

 socket.on("subscribe", (data) => {
  if(verification[socket.id].state === "Authenticated"){
    //Date.now() minus 4 hours to get all transactions since last login
    
    subscribeToWallets( socket,  [data] , data.lastUpdate ? data.lastUpdate : Date.now() - 14400000)  
  }else {
    socket.emit('error', { error: "Not authenticated" })
    socket.disconnect()
  }
 })

 socket.on('loadWallets', (data) => {
  if(verification[socket.id].state === "Authenticated"){
    let walletsFound = wallets.find({members: verification[socket.id].user})
    walletsFound.toArray().then((walletsFound) => {
    if (walletsFound.length > 0) {
      socket.emit('wallets_found', { wallets: walletsFound })
    } else {
      socket.emit('wallets_found', { wallets: [] })
    }
  }).catch((err) => {
    console.log(err)
    socket.emit('error', {error: "Wallets not found"})
    socket.disconnect() 
  })

}else {
    socket.emit('error', { error: "Not authenticated" })
  }
})

  
});

};

function subscribeToWallets(socket, wallets , lastLogin){
  
   wallets.map((wallet) => {

    if (getMemebers(wallet).includes(verification[socket.id].user)){  
    watchTransactions( socket,wallet ).catch(console.error);
    if(subscriptions[socket.id]){
      subscriptions[socket.id].push( walletHash(wallet) )
      findNewTransactions(walletHash(wallet), lastLogin, socket)
    }else{
      subscriptions[socket.id] = [walletHash(wallet)]
      findNewTransactions(walletHash(wallet), lastLogin, socket)
    }
  }
  })

  


}


app.get('/api', function(req, res) {
  res.sendfile('public/index.html');
});

//use express to submit a new wallet into the database 


let getMemebers = function (json){
  let members = []
  if(json.type == "sig"){
    return [json.keyHash]
  }else if(json.type === "any" || json.type === "all" || json.type === "at_least"){
    for(let i = 0; i < json.scripts.length; i++){
      //how do I fix this error? 

      members = members.concat( getMemebers(json.scripts[i]))
    }
  }else if(json.type === "after" || json.type === "before"){
    return []
  }
  return members
}

const verify = (address, payload, walletSig) => {
  const coseSign1 = MS.COSESign1.from_bytes(Buffer.from(walletSig.signature, 'hex'));
  const coseKey = MS.COSEKey.from_bytes(Buffer.from(walletSig.key, 'hex'));
  const payloadCose = coseSign1.payload();
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


function findNewWallets(PubKeyHash, lastLogin, socket){
  let walletsFound = wallets.find({members: PubKeyHash, creationTime: {$gt: lastLogin}})
  walletsFound.toArray().then((walletsFound) => {
  if (walletsFound.length > 0) {
    socket.emit('wallets_found', { wallets: walletsFound })
  }
 

}).catch((err) => {
  console.log(err)
  socket.emit('error', {error: "Wallets not found"})
  socket.disconnect() 
})
}

function findNewTransactions(wallet, lastLogin, socket, ){
  let TransactionsFound = transactions.find({wallet: wallet, lastUpdate: {$gt: lastLogin}})
  TransactionsFound.toArray().then((TransactionsFound) => {
  if (TransactionsFound.length > 0) {
    socket.emit('transaction', { transactions: TransactionsFound })
  } 

}).catch((err) => {
  console.log(err)
  socket.emit('error', {error: "Wallets not found"})
  socket.disconnect()
})


}

async function watchWallets()  {
  const changeStream = wallets.watch();
  changeStream.on('change', async (change) => {
    if (change.operationType === 'update' || change.operationType ===  'insert') {
      
      
      const wallet = await wallets.findOne({ _id: change.documentKey._id });
      const signers = wallet.members;
      const RelevantSockets : String[] = []
      Object.keys(verification).map( (key) => {
        if( signers.includes(verification[key].user) ){RelevantSockets.push(key)}}
      )
      if (RelevantSockets.length > 0) {
        RelevantSockets.forEach((socket) => {
          const sock = io.sockets.sockets.get(socket)
          if (sock && sock.connected) {
            sock.emit('wallets_found', { wallets: [wallet] });
          }
        });
      }
    }
  });
}


async function watchTransactions( socket , wallet ) {
  const filter = {
    $match: {
      operationType: { $in: ["update", "insert"] },
      "fullDocument.wallet": {  wallet },
    }
  };
  const options = { fullDocument: "updateLookup" };
  const changeStream = transactions.watch( );

  changeStream.on('change', async (change) => {
      const transaction = await transactions.findOne({ _id: change.documentKey._id }); 
          socket.emit('transaction', { transactions: [transaction] });
});

  socket.on('disconnect', () => {
    changeStream.close();
  });
}




function walletHash(wallet) {
  //remove the name field from the wallet object recursively
  function removeName(obj) {
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        obj.forEach((item) => {
          removeName(item);
        });
      } else {
        delete obj.name;
        Object.keys(obj).forEach((key) => {
          removeName(obj[key]);
        });
      }
    }
  }
  ;
  // create a deep copy of the wallet object

  const cleanWallet = JSON.parse(JSON.stringify(wallet));
  removeName(cleanWallet)
 return crypt.createHash('sha256').update(JSON.stringify(cleanWallet)).digest('hex');
}


server.listen(3001, () => {
  console.log('listening on *:3001');
});
