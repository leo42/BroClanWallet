const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const cbor = require('cbor');
const app = express();

const blockfrostApiBaseUrl = 'https://cardano-preprod.blockfrost.io/api/v0';
const blockfrostApis ={
    "preprod": "https://cardano-preprod.blockfrost.io/api/v0",
    "mainnet": "https://cardano-mainnet.blockfrost.io/api/v0",
    "testnet": "https://cardano-testnet.blockfrost.io/api/v0",
    "preview" : "https://cardano-preview.blockfrost.io/api/v0"
}

const blockfrostApiKeys ={
    "preprod": "preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp"
}
// Set Blockfrost API key as an environment variable or hard-code it here
const blockfrostApiKey = process.env.BLOCKFROST_API_KEY || 'preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp';
const SERVING = process.env.SERVING || '*' ;

app.use(bodyParser.raw({ type: 'application/cbor', limit: '10mb' }));

// Endpoint: /epochs/latest/parameters
app.get('/epochs/latest/parameters', async (req, res) => {
  res.header('Access-Control-Allow-Origin', SERVING);
  try {
    // get project_id from request header
    const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/epochs/latest/parameters`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: /addresses/${queryPredicate}/utxos?page=${page}
app.get('/addresses/:queryPredicate/utxos',  async (req, res) => {
  const { queryPredicate } = req.params;
  const { page } = req.query;
  res.header('Access-Control-Allow-Origin', SERVING);

  try {
    const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/addresses/${queryPredicate}/utxos?page=${page}`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id]} });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: /addresses/${queryPredicate}/utxos/${unit}?page=${page}
app.get('/addresses/:queryPredicate/utxos/:unit',  async (req, res) => {
  const { queryPredicate, unit } = req.params;
  const { page } = req.query;
  res.header('Access-Control-Allow-Origin', SERVING);
  try {
    const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/addresses/${queryPredicate}/utxos/${unit}?page=${page}`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
    res.json(response.data);
  } catch (error) {
    if(error.response.status === 404){
       res.json([]);
    }else{

      const statusCode = error.response.status || 500;
      res.status(statusCode).json({ error: error.message });
        }
  }
});

// Endpoint: /assets/${unit}/addresses?count=2
app.get('/assets/:unit/addresses',  async (req, res) => {
  const { unit } = req.params;
  const { count } = req.query;
  res.header('Access-Control-Allow-Origin', SERVING);
  try {
    const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/assets/${unit}/addresses?count=${count}`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
    res.json(response.data);
  } catch (error) {
    const statusCode = error.response.status || 500;
    res.status(statusCode).json({ error: error.message });
    }
});

// Endpoint: /txs/${txHash}/utxos
app.get('/txs/:txHash/utxos',  async (req, res) => {
res.header('Access-Control-Allow-Origin', SERVING);
  const { txHash } = req.params;
  try {
    const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/txs/${txHash}/utxos`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
    res.json(response.data);
  } catch (error) {
    const statusCode = error.response.status || 500;
    res.status(statusCode).json({ error: error.message });
    }
});

// Endpoint: /accounts/${rewardAddress}
app.get('/accounts/:rewardAddress',  async (req, res) => {
res.header('Access-Control-Allow-Origin', SERVING);
  const { rewardAddress } = req.params;
  try {
    const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/accounts/${rewardAddress}`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
    res.json(response.data);
    } catch (error) {
      const statusCode = error.response.status || 500;
      res.status(statusCode).json({ error: error.message });
    }
});

// Endpoint: scripts/datum/${datumHash}/cbor
app.get('/scripts/datum/:datumHash/cbor',  async (req, res) => {
res.header('Access-Control-Allow-Origin', SERVING);
    const { datumHash } = req.params;
    try {
        const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/scripts/datum/${datumHash}/cbor`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
        res.json(response.data);
    } catch (error) {
      const statusCode = error.response.status || 500;
      res.status(statusCode).json({ error: error.message });
    }
    }
);

//Endpoint :txs/${txHash}
app.get('/txs/:txHash',  async (req, res) => {
    const { txHash } = req.params;
    try {
      const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/txs/${txHash}`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
      res.header('Access-Control-Allow-Origin', SERVING);
        res.json(response.data);
    } catch (error) {
      const statusCode = error.response.status || 500;
      res.status(statusCode).json({ error: error.message });    }
});




//Endpoint POST :tx/submit

app.post('/tx/submit',  async (req, res) => {
  res.header('Access-Control-Allow-Origin', SERVING);
  try {
    console.log(req.body)
    const payloadString = req.body;

    // convert string to buffer
    const payloadBuffer = Buffer.from(payloadString, 'utf8');

    // decode binary CBOR string
    const decoded = await cbor.decodeFirst(payloadBuffer);
    console.log(decoded)
  
    console.log(req.body)
    axios.post(`${blockfrostApis[req.headers.project_id]}/tx/submit`, cbor.encode(decoded)  , { headers: { project_id: blockfrostApiKeys[req.headers.project_id] ,  'Content-Type': 'application/cbor'} })
    .then(response => {;
      res.json(response.data);
    
    });

  } catch (error) {
      console.log(error)
      const statusCode = error.response.status || 500;
      res.status(statusCode).json({ error: error.message });
    }
});


//Endpoint :scripts/${r.reference_script_hash}
app.get('/scripts/:reference_script_hash',  async (req, res) => {
  res.header('Access-Control-Allow-Origin', SERVING);
  const { reference_script_hash } = req.params;
  try {
    const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/scripts/${reference_script_hash}`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
    res.json(response.data);
    } catch (error) {
      const statusCode = error.response.status || 500;
      res.status(statusCode).json({ error: error.message });    }
});

//Endpoint :scripts/${r.reference_script_hash}/cbor
app.get('/scripts/:reference_script_hash/cbor',  async (req, res) => {
  res.header('Access-Control-Allow-Origin', SERVING);
    const { reference_script_hash } = req.params;
    try {
        const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/scripts/${reference_script_hash}/cbor`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
        res.json(response.data);
    } catch (error) {
      const statusCode = error.response.status || 500;
      res.status(statusCode).json({ error: error.message });    }
});

//Endpoint :txs/${transactionId.tx_hash}/utxos
app.get('/txs/:transactionId.tx_hash/utxos',  async (req, res) => {
  res.header('Access-Control-Allow-Origin', SERVING);
    const { transactionId } = req.params;
    try {
        const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/txs/${transactionId.tx_hash}/utxos`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
        res.json(response.data);
    } catch (error) {
      const statusCode = error.response.status || 500;
      res.status(statusCode).json({ error: error.message });    }
});
//Endpoint :assets/${tokenId}
app.get('/assets/:tokenId',  async (req, res) => {
  res.header('Access-Control-Allow-Origin', SERVING);
    const { tokenId } = req.params;
    try {
        const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/assets/${tokenId}`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
        res.json(response.data);
    } catch (error) {
      const statusCode = error.response.status || 500;
      res.status(statusCode).json({ error: error.message });    }
});

//Endpoint :addresses/${address}/transactions
app.get('/addresses/:address/transactions',  async (req, res) => {
  res.header('Access-Control-Allow-Origin', SERVING);
    const { address } = req.params;
    try {
        const response = await axios.get(`${blockfrostApis[req.headers.project_id]}/addresses/${address}/transactions`, { headers: { project_id: blockfrostApiKeys[req.headers.project_id] } });
        res.json(response.data);
    } catch (error) {
      const statusCode = error.response.status || 500;
      res.status(statusCode).json({ error: error.message });    }
}
);

// allow cross origin requests
app.use(cors());


const server = http.createServer(app);


server.listen(3002, () => {
    console.log('listening on *:3001');
  });
