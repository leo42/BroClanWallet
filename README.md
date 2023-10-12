# BroClanWallet
Bro Clan is a multisig Wallet for the Cardano ecosystem.


It consists of 3 components: 
- The Main Wallet in React 
- The Sync Service that comunicates with the UI instances and the DB to deliver syncronization services
- The Passthrough API that forwords requests for data from the users to blockfrost. 



## Running BroClan:

You can run access this app via our servise on broclan.io 

We also provide dockerfiles and docker Images for all components. 

To run the latest version with docker: 
```sh
docker run -it -p 80:80 leo42/broclan:latest
```

To run a specific version replace `latest` with `<version>`

To run from code: 
```sh
cd Fe
npm install   
npm run start
```


## Developing against BroClan


# Best practices 

Critical code is all inside the "wallets.js" file, this allows for much reliable developlment, since I can audit this one relatively small file and ensure safe operation of the entire app. 

React componenents are broken down under the "Components" folder, more smaller components are always preferable. 

The backend is entirely hosted in 1 file for each component, that is because most of the logic and functionality is all in happening in the frontend. 
