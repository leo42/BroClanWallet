import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Wallet from './Wallet';
import MWalletList from "./components/WalletList";
import MWalletMain from './components/WalletMain'; 
import { ToastContainer, toast } from 'react-toastify';
import './components/ReactToastify.css';
import WalletConnector from './components/walletConnector';
import connectSocket from  './helpers/SyncService';
import ModalsContainer from './components/ModalsContainer';

import sha256 from 'crypto-js/sha256';
import {  Blockfrost ,Kupmios} from "lucid-cardano";
import  { ReactComponent as LoadingIcon } from './html/assets/loading.svg';


const script1 = {
  "type": "all",
  "scripts":
  [
    {
      "type": "sig",
      "keyHash": "487b9485cf18d99e875e7aef9b80c4d3a89cccddefbc2641c87da293"
    },
    {
      "type": "sig",
      "keyHash": "addr1qx0mmzuwnya2yasfy78klcqazd73a320a9agpunuv4zqlyjwrycda8m2jmtws4hktfq6xp59q2t2a8w6elnky6a9txts5a6hkj"
    },
  ]
} 

//const myWallet = new Wallet(script1,"Leos Wallet");
//await myWallet.initialize();

const script2 = {
  "type": "any",
  "scripts":
  [
    {
      "type": "sig",
      "name" : "test",
      "keyHash": "487b9485cf18d99e875e7aef9b80c4d3a89cccddefbc2641c87da293"
    },
    {
      "type": "sig",
      "name": "Leo",
      "keyHash": "7190ae1c26a87ed572e8d72049454ddc874d360293c1eb43aef490e3"
    },
  ]
} 



//const myWallet2 = new Wallet(script2,"Leos2 Wallet");
//await myWallet2.initialize();


const script3 ={
  "type": "atLeast",
  "scripts": [
      {
          "type": "sig",
          "name": "Leo",
          "keyHash": "487b9485cf18d99e875e7aef9b80c4d3a89cccddefbc2641c87da293"
      },
      {
          "type": "sig",
          "name": "tamiaki",
          "keyHash": "1974f3669dae35113e20425d486ef3aa07ee19d40e3503e3aff5d0de"
      },
      {
          "type": "sig",
          "name": "trash",
          "keyHash": "7190ae1c26a87ed572e8d72049454ddc874d360293c1eb43aef490e3"
      }
  ],
  "required": 2
}


//const myWallet3 = new Wallet(script3,"Leos 2 out of 3");
//await myWallet3.initialize();

//myWallet.addSignature("a1008182582024a97c7d033acb4292cacac9e6de546b9a02e1492d7f76226c8e5ed5be5aa13358408b2318f6834a057e383738614e37cfefb630d7fb7f56a97163bc54b39d26a4aa7a2934a55535fd40995cce1adce976f3d2e7deb06fbcb5abaff19a306bf39f00")


class App extends React.Component {
  state= {
    wallets: [],
    pendingWallets: {},
    selectedWallet: 0,
    connectedWallet: {name: "", socket: null},
    loading : true,
    modal: "",
    settings: { metadataProvider :"Blockfrost", sendAll: false, network: "Preprod", explorer: "https://preprod.cardanoscan.io/" , provider: "Blockfrost" ,  api :  {"url": "https://passthrough.broclan.io" , "projectId": "preprod"} }
  }



  async setState(state){

      
    
    super.setState(state)
    this.storeWallets()
    
    this.storeState()
  }

  async setSettings(settings){
    const valid = await this.checkSettings(settings)
    if (!valid){
      throw ("Invalid settings");
      return
    }
    const wallets=[...this.state.wallets]
    for(let index = 0 ; index < this.state.wallets.length ; index++){
      try{
       await wallets[index].changeSettings(settings)
      }catch(e){
        console.log(e)
      }
    }
     this.setState({settings})
    this.setState({wallets})
    this.reloadBalance()
  }

  async checkSettings(settings){
    try{
      if (settings.provider === "Blockfrost"){
        const provider = new Blockfrost(settings.api.url, settings.api.projectId)
        await provider.getProtocolParameters()
      }else if (settings.provider === "Kupmios"){
        const provider = new Kupmios(settings.api.kupoUrl, settings.api.ogmiosUrl)
        await provider.getProtocolParameters()
      }else if (settings.provider === "MWallet"){
        const provider = new Blockfrost(settings.api.url, settings.api.projectId)
        await provider.getProtocolParameters()
      }
      return true
    }catch(e){
      console.log(e)
      return false
    }
  }


  componentDidMount() {
    this.loadState()
    this.interval = setInterval(() => {
        this.reloadBalance()
    }, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }
  

  async connectWallet(wallet){
    try{

        if (this.state.connectedWallet) {
            const connectedWallet = this.state.connectedWallet
  
            if (connectedWallet.socket) {
                connectedWallet.socket.close()
            }
        }

      const socket =  await connectSocket(wallet, this) 
      let connectedWallet = {  name :wallet , socket: socket}
      this.setState({connectedWallet})
    }
    catch(e){
      console.log(e.message)
      toast.error("Could not connect to sync service");
    }
  }

  disconnectWallet(error=""){
    if (error !== ""){
      toast.error(error);
    }
    if (this.state.connectedWallet.socket) {
      this.state.connectedWallet.socket.close()
    }
    let connectedWallet = {name: "", socket: null}

    this.setState({connectedWallet})
  }
  async reloadAllBalance(){
    try {
      if (this.state.wallets.length > 0){
        const wallets = this.state.wallets
        for(let index = 0 ; index < this.state.wallets.length ; index++){
          await wallets[index].loadUtxos()
        }
        this.setState({wallets})
      }
    }
    catch(e) {
      toast.error(e.message);
    } 
  }

  async reloadBalance(){
      try {
        if (this.state.wallets.length > 0){
          const wallets = this.state.wallets
          await wallets[this.state.selectedWallet].loadUtxos()
          this.setState({wallets})
        }
      }
      catch(e) {
        toast.error(e.message);
      }
    
  }

  storeState(){

    localStorage.setItem("connectedWallet", JSON.stringify(this.state.connectedWallet.name ))
    localStorage.setItem("settings", JSON.stringify(this.state.settings))
    localStorage.setItem("pendingWallets", JSON.stringify(this.state.pendingWallets))

  }

  storeWallets()  {
    if (this.state.loading) return

     const dataPack = this.state.wallets.map( (wallet,index)=> ({json: wallet.getJson(),
                                                                name :wallet.getName(),
                                                               defaultAddress: wallet.getDefaultAddress(),
                                                               addressNames: wallet.getAddressNames(),
                                                               pendingTxs: wallet.getPendingTxs().map( tx => ( {tx: tx.tx.toString(), signatures: tx.signatures } ) ) 
                                                              }) )
    localStorage.setItem("wallets", JSON.stringify(dataPack))
  }

  async loadState(){
    const wallets = JSON.parse(localStorage.getItem('wallets'));
    let state = this.state

    if (wallets) for(let index = 0 ; index < wallets.length ; index++){

      const myWallet = new Wallet(wallets[index].json,wallets[index].name);
      await myWallet.initialize(localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : this.state.settings  );
      myWallet.setDefaultAddress(wallets[index].defaultAddress)
      myWallet.setAddressNamess(wallets[index].addressNames)
      myWallet.setPendingTxs(wallets[index].pendingTxs)
      await myWallet.checkTransactions()
      state.wallets.push(myWallet)
    }
    state.pendingWallets = JSON.parse(localStorage.getItem('pendingWallets'))
    state.settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : this.state.settings
    if (localStorage.getItem('connectedWallet') && JSON.parse(localStorage.getItem('connectedWallet')) !== ""){
      this.connectWallet(JSON.parse(localStorage.getItem('connectedWallet')))
    }
    super.setState(state) 
    this.setState({loading : false})
  }
 
  async toggleSendAll(){
    const settings = this.state.settings
    settings.sendAll = !settings.sendAll
    this.setState({settings})
  }

  async toggleDisableSync(){
    const settings = this.state.settings
    settings.disableSync = !settings.disableSync
    this.setState({settings})
  }

  async createTx(recipients,signers,sendFrom, sendAll=null){
    try{
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createTx(recipients,signers,sendFrom,sendAll)
    
    this.setState({wallets})
    toast.info('Transaction created');
    }catch(e){
      if (e ==="InputsExhaustedError")
        toast.error("Insuficient Funds");
      else
        {
          toast.error(e.message);
          toast.error(e);
        }

    }
  }

  async importTransaction(transaction){
    try{
    const wallets = this.state.wallets
    await this.state.wallets[this.state.selectedWallet].importTransaction(transaction)
    this.setState({wallets})
    toast.success("Transaction imported");
    }catch(e){
      toast.error("Could not import transaction: " + e.message);
    }
  }

  async createDelegationTx(pool,signers){
    try{
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createDelegationTx(pool,signers)
    this.setState({wallets})
    toast.info('Delegation Transaction created');
    }catch(e){
      toast.error(e.message);
    }
    
  }

  async createStakeUnregistrationTx(signers){
    try{
    const wallets = this.state.wallets
      await this.state.wallets[this.state.selectedWallet].createStakeUnregistrationTx(signers)
    this.setState({wallets})
    toast.info('Stake Unregistration Transaction created');
    }catch(e){
      toast.error(e.message);
    }
  }

  async deleteWallet(index){
    const wallets = this.state.wallets
    const confirmation =  window.confirm("Are you sure you want to delete this wallet?");
    if (confirmation === false){
      return
    }
    if (index === this.state.selectedWallet){
      this.setState({selectedWallet: 0})
    }
    wallets.splice(index,1)
    this.setState({wallets})
  }

  async removePendingTx(index){
    const wallets = this.state.wallets
    await wallets[this.state.selectedWallet].removePendingTx(index)
    this.setState({wallets})
  }

  changeWalletName(name){
    const wallets = this.state.wallets
    wallets[this.state.selectedWallet].setName(name)
    this.setState({wallets})
  }


  addSignature(signature){ 
    try {
    const wallets = this.state.wallets
    const transaction = wallets[this.state.selectedWallet].addSignature(signature)

    this.transmitTransaction(transaction)
    this.setState({wallets})
    toast.info('Signature Added');
    }
    catch(e) {
      toast.error(e.message);
    }
  }

  setDefaultAddress(address){
    try {
      const wallets = this.state.wallets
      wallets[this.state.selectedWallet].setDefaultAddress(address)
      this.setState({wallets})
      toast.info('Default Account Changed');
      }
      catch(e) {
        toast.error(e.message);
      }
  }



  changeAddressName(address,name){
    try {
      
      const wallets = this.state.wallets
      wallets[this.state.selectedWallet].changeAddressName(address,name)
      this.setState({wallets})
      }
      catch(e) {
        toast.error(e.message);
      }
  }

  getTransactionHistory(address){

    const wallets = this.state.wallets
    const resault = wallets[this.state.selectedWallet].getTransactionHistory(address)
    this.setState({wallets})
    toast.promise(
      resault,
      {
        pending: 'Getting Transaction History',
        error: 'Failed Retriving Transaction History'
      }
  )
    return resault
  }

  deleteImportedWallet(key){
    const pendingWallets = this.state.pendingWallets
    delete pendingWallets[key]
    this.setState({pendingWallets})
  }

  deleteAllPendingWallets(){
    const pendingWallets = this.state.pendingWallets
    for (var key in pendingWallets) {
      delete pendingWallets[key]
    }
    this.setState({pendingWallets})
  }

  async importPendingWallet(key){
    try{
      const pendingWallets = this.state.pendingWallets
      const wallets = this.state.wallets
      const pendingWallet = pendingWallets[key]
      const walletHash = await this.walletHash(pendingWallet.json)
      const walletsHashes = wallets.map(wallet =>  this.walletHash(wallet.getJson()))
      // resole promices in walletHashes
      const res = await Promise.all(walletsHashes)
      if (! res.includes(walletHash)) {
        const myWallet = new Wallet(pendingWallet.json,"Imported Wallet");
        await myWallet.initialize(this.state.settings);
        wallets.push(myWallet)
        this.setState({wallets})
        //remove pending wallet
        delete pendingWallets[key]
        
        this.setState({pendingWallets})
        toast.success("Wallet Imported");
      }else{
        toast.error("Wallet already exists")
      }
      }catch(e){
        toast.error(e.message);
      }
  }


  async addWallet(script,name){
    const wallets = this.state.wallets
    const walletsHashes = wallets.map(wallet =>  this.walletHash(wallet.getJson()))
    console.log(script)
    const res = await Promise.all(walletsHashes)
    const myWallet = new Wallet(script,name);
    await myWallet.initialize(this.state.settings);
    const walletHash = await this.walletHash(myWallet.getJson())

    if (this.state.connectedWallet.socket) {
       this.state.connectedWallet.socket.emit('subscribe' , script)}
    if (! res.includes(walletHash)) {
      
      this.transmitWallet(script)
      wallets.push(myWallet)
      this.setState(wallets)
    }else{
      
      toast.error("Wallet already exists")
    }
  }

  loadWallets(){
    if(this.state.connectedWallet.socket) {
    this.state.connectedWallet.socket.emit('loadWallets')
    }else{
      toast.error("Not Connected to a SyncService")
    }
  }

  transmitTransaction(transaction) {
    if(this.state.settings.disableSync) return

    fetch('/api/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({tx: transaction.tx.toString() , signatures: transaction.signatures , wallet:  this.state.wallets[this.state.selectedWallet].getJson()}),
      })
  }


  transmitWallet(script) {
    if(this.state.settings.disableSync) return
    fetch('/api/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(script),
      })
  }

  async loadTransaction(transaction, walletIndex){
    const wallets = this.state.wallets
    toast.info("Transaction update for wallet " + wallets[walletIndex].getName());
    await wallets[walletIndex].loadTransaction(transaction)
    this.setState({wallets})
  }

  selectWallet(key){
    const selectedWallet = key
    this.setState( { selectedWallet})
    this.reloadBalance()
  }

  walletHash(wallet) {
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
    
  //crypto.createHash('sha256').update(JSON.stringify(cleanWallet)).digest('hex'); for react
    return getSHA256Hash(cleanWallet)

    async function getSHA256Hash(jsonObj) {
      const jsonString = JSON.stringify(jsonObj);
      const hashHex = sha256(jsonString).toString();
      return hashHex;
    }
    
    
  }

  async showModal(modalName){
    this.setState({modal: modalName})
  }

  async submit(index){
    const wallets = this.state.wallets
    const promice = wallets[this.state.selectedWallet].submitTransaction(index)
    this.setState({wallets})
    toast.promise(
      promice,
      {
        pending: 'Submiting Transaction',
        success: 'Transaction Submited'
      }
      )
      promice.then( 
        //add a small delay to allow the transaction to be broadcasted
        () => setTimeout(() => this.reloadBalance(), 5000)
      ).catch(
        (e) => toast.error("Transaction Failed:" + JSON.stringify(e))
      )
  }

   walletsEmpty = () => {
    return (
      <div className="walletsEmpty">
        <h2>No Wallets Found</h2>
        <p>Create a new wallet to start using this APP.</p>
        <button onClick={() => this.setState({modal: "newWallet"})}>Add Wallet</button>
      </div>
    )
  }
  render() {
    return (
      <div className='App'>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          pauseOnHover
          theme="dark"
          />
        <ModalsContainer root={this} modal={this.state.modal} ></ModalsContainer>
        <img src={"./assets/logoFull.png"} alt="Logo" className='MainAppLogo' />
        <br/>
        <React.StrictMode>

         {this.state.loading ? <LoadingIcon className="loadingIcon"> </LoadingIcon> :
        <div className='WalletInner'>
            <MWalletList root={this}  ></MWalletList>
          { this.state.wallets.length === 0 ?  this.walletsEmpty()  : <MWalletMain root={this} wallet={this.state.wallets[this.state.selectedWallet]}></MWalletMain> }
        </div>
    }
        </React.StrictMode>

    <WalletConnector root={this} key={this.state.connectedWallet}></WalletConnector>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));