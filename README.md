# BroClanWallet
Bro Clan is a multisig Wallet for the Cardano ecosystem.


It consists of 3 components: 
- The Main Wallet in React 
- The Sync Service that comunicates with the UI instances and the DB to deliver syncronization services
- The Passthrough API that forwords requests for data from the users to blockfrost. 



## Running BroClan:

You can run access this app via our servise on broclan.io (coming soon)

We also provide dockerfiles for all components. 

To run your own full instanse you will need to have a mongoDB instance, pass the MONGO_CONNECTION_STRING as en Enviroment variable and provide the connection certificate in a folder called secrets located in the paret directory of this code.
The Passthrough service will allso need a set of ProjectIDs to comminicate with Blockfrost, this need to be placed in a file called: blockfrostApiKeys.json with the following format :

```sh
{
    "preprod": "preprodxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "mainnet" : "mainnetxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

Your file stracture will look like this :
```sh
 -secrets
 |- mondo.pem
 -BroClanWallet 
 -blockfrostApiKeys.json
```
You can then start a full instance of BroClan using: 

```sh 
 docker-compose up -d --build
```



## Developing against BroClan

# Install dependencies 
```sh
npm run update
```

# running 
You can run 3 versions of a dev-enviroments to develop against 
```sh 
npm run start
```
Will run the react app and serve it over port 8080, to run this you do not need any blockfrost keys or DB but all sync services will be disabled.

```sh 
npm run dev
```
Will start a dev server for the UI + the sync servise and serve it over port 3001, to run this you will need a MongoDB instance, you can configure the servicess connection string with the ENV variable : MONGO_CONNECTION_STRING.

```sh
npm run Uidev
```
This is a special variation of the previus command, it will start again the UI and sycn services and requires a MondoDB instance, the diferense is it will not auto-reload changes to the code of the server only the UI. This is usefull for Windows devs where the performance of the "node --watch" randomly drops into a loop of infinate restarts.


# Best practices 

Critical code is all inside the "wallets.js" file, this allows for much reliable developlment, since I can audit this one relatively small file and ensure safe operation of the entire app. 

React componenents are broken down under the "Components" folder, more smaller components are always preferable. 

The backend is entirely hosted in 1 file for each component, that is because most of the logic and functionality is all in happening in the frontend. 
