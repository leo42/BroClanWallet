
import Wallet from '../../Wallet';
import MWalletList from "./WalletList";
import MWalletMain from './WalletMain'; 
import WalletConnector from './walletConnector';
import connectSocket from  '../../helpers/SyncService';
import sha256 from 'crypto-js/sha256';
import  { ReactComponent as LoadingIcon } from '../../html/assets/loading.svg';
import React from 'react';
import { toast } from 'react-toastify';
import "./MultisigContainer.css"
import ModalsContainer from './ModalsContainer';
import Messaging from '../../helpers/Messaging';


class MultisigContainer extends React.Component {
state= {
    modal: "",
    wallets: [],
    pendingWallets: {},
    selectedWallet: 0,
    connectedWallet: {name: "", socket: null},
    loading : true,
    dAppConnector: null,
}

componentDidUpdate(prevProps) { 

  if (this.props.settings !== prevProps.settings) {
    this.newSettings(this.props.settings)
    
  }
}

async newSettings(newSettings){
  const wallets=[...this.state.wallets]
  for(let index = 0 ; index < this.state.wallets.length ; index++){
    try{
     await wallets[index].changeSettings(newSettings)
    }catch(e){
    }
  }
  this.reloadBalance()

}


async showModal(modalName){
    this.setState({modal: modalName})
  }

async setState(state){
    await super.setState(state)
    this.storeState()
    this.storeWallets()
  }

  componentDidMount() {
    this.loadState()
    console.log(this.state.wallets[this.state.selectedWallet])

  //  let port = chrome.runtime.connect("jfjmokidpopgdhcilhkoanmjcimijgng");
  //  port.onMessage.addListener((message) => {
  //      console.log("Received message from background script:", message);
  //  }
  //  );
 //  this.setState({port})

    this.interval = setInterval(() => {
        this.reloadBalance()
    }, 15000);
  }

  

  componentWillUnmount() {
    console.log("unmounting", this.state.dAppConnector)
    this.state.dAppConnector ? this.state.dAppConnector.disconnect() : null
    this.setState({dAppConnector: null})
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
    localStorage.setItem("pendingWallets", JSON.stringify(this.state.pendingWallets))
    localStorage.setItem("acceptedTerms", this.state.acceptedTerms)

  }

  storeWallets()  {
    if (this.state.loading) return

     const dataPack = this.state.wallets.map( (wallet,index)=> ({json: wallet.getJson(),
                                                                name :wallet.getName(),
                                                               defaultAddress: wallet.getDefaultAddress(),
                                                               addressNames: wallet.getAddressNames(),
                                                               collateralDonor: wallet.getCollateralDonor(),
                                                               pendingTxs: wallet.getPendingTxs().map( tx => ( {tx: tx.tx.toString(), signatures: tx.signatures } ) ), 
                                                                defaultSigners: wallet.getDefaultSigners()
                                                              }) )
    localStorage.setItem("wallets", JSON.stringify(dataPack))
  }

  async loadState(){
    const wallets = JSON.parse(localStorage.getItem('wallets'));
    let state = this.state
    state.pendingWallets = JSON.parse(localStorage.getItem('pendingWallets'))
    state.acceptedTerms = localStorage.getItem('acceptedTerms')
    super.setState(state) 

    if (wallets) for(let index = 0 ; index < wallets.length ; index++){
      const myWallet = wallets[index].json.type === "tokenVault" ? new TokenWallet(wallets[index].json.token,wallets[index].name) : new Wallet(wallets[index].json,wallets[index].name);
      await myWallet.initialize(localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : this.props.root.state.settings  );
      myWallet.setDefaultAddress(wallets[index].defaultAddress)
      myWallet.setAddressNamess(wallets[index].addressNames)
      myWallet.setDefaultSigners(wallets[index].defaultSigners)
      myWallet.setPendingTxs(wallets[index].pendingTxs)
      await myWallet.loadUtxos()
      await myWallet.setCollateralDonor(wallets[index].collateralDonor)
      state.wallets.push(myWallet)
    }
    
    if (localStorage.getItem('connectedWallet') && JSON.parse(localStorage.getItem('connectedWallet')) !== ""){
      this.connectWallet(JSON.parse(localStorage.getItem('connectedWallet')))
    }

    state.selectedWallet =  Number(localStorage.getItem("selectedMultisigWallet"))
    
    super.setState(state) 
    const dAppConnector = new Messaging(this.state.wallets[this.state.selectedWallet], this)
    this.setState({dAppConnector})
    this.setState({loading : false})

  }
  
  modalType(){
    return "multisig"
  }

  async createTx(recipients,signers,sendFrom, sendAll=null){
    try{
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createTx(recipients,signers,sendFrom,sendAll, false)
    
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

  async setCollateralDonor(keyHash){
    try{
    const wallets = this.state.wallets 
    console.log(wallets)
    await wallets[this.state.selectedWallet].setCollateralDonor(keyHash)
    this.setState({wallets})
    toast.info('Collateral Donor Set');
    }catch(e){
      toast.error(e.message);
    }
  }


  async importTransaction(transaction){
    try{
    const wallets = this.state.wallets
    const txHash = await this.state.wallets[this.state.selectedWallet].importTransaction(transaction)
    
    this.setState({wallets})
   
    if(txHash.error){
      toast.error(txHash.error);
      if(txHash.tx){
        return(txHash.tx)
      }else{
        return {"code": 2, "error": txHash.error}
      }
    }
    toast.success("Transaction imported");
    return txHash
    }catch(e){
      toast.error("Could not import transaction: " + e.message);
      
      return {"code": 1, "error": "Could not import transaction: " + e.message}

    }
  }
  getSigners(){
    const wallets = this.state.wallets
    return wallets[this.state.selectedWallet].getSigners()
  }

  getSignerName(keyHash){
    const wallets = this.state.wallets
    return wallets[this.state.selectedWallet].getSignerName(keyHash)
  }
  
  async createDelegationTx(pool, dRepId, signers){
    try{
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createDelegationTx(pool, dRepId, signers)
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

    this.transmitTransaction(transaction, signature)
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


  updateSignerName(keyHash, name){
    const wallets = this.state.wallets
    wallets[this.state.selectedWallet].updateSignerName(keyHash, name)
    this.setState({wallets})
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
        await myWallet.initialize(this.props.root.state.settings);
        myWallet.resetDefaultSigners()
        wallets.push(myWallet)
        this.setState({wallets})
        //remove pending wallet
        delete pendingWallets[key]
        
        this.setState({pendingWallets})
        if (this.state.connectedWallet.socket) {
          this.state.connectedWallet.socket.emit('subscribe' , pendingWallet.json)}
        if(this.state.wallets.length === 1)
          this.state.dAppConnector.changeWallet(myWallet)
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
    const res = await Promise.all(walletsHashes)
    const myWallet = new Wallet(script,name);
    await myWallet.initialize(this.props.root.state.settings);
    myWallet.resetDefaultSigners()
    const walletHash = await this.walletHash(myWallet.getJson())

    if (! res.includes(walletHash)) {
      
      this.transmitWallet(script)
      wallets.push(myWallet)
      this.setState(wallets)
      
      if (this.state.connectedWallet.socket) {
         this.state.connectedWallet.socket.emit('subscribe' , script)}
      if(this.state.wallets.length === 1)
            this.state.dAppConnector.changeWallet(myWallet)
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

  setDefaultSigners(signers){
    const wallets = this.state.wallets
    wallets[this.state.selectedWallet].setDefaultSigners(signers)
    this.setState({wallets})
  }

  transmitTransaction(transaction, sigAdded) {
    if(this.props.root.state.settings.disableSync) return
    try{
    fetch(this.props.root.state.syncService+'/api/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({tx: transaction.tx.toString() ,sigAdded: sigAdded ,  signatures: transaction.signatures , wallet:  this.state.wallets[this.state.selectedWallet].getJson()}),
      }).catch(e => toast.error("Could not transmit transaction: " + e.message));
    }catch(e){
      toast.error("Could not transmit transaction: " + e.message);
    }
  }


  transmitWallet(script) {
    if(this.props.root.state.settings.disableSync) return
    fetch(this.props.root.state.syncService+'/api/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(script),
      })
  }

  async loadTransaction(transaction, walletIndex){
    const wallets = this.state.wallets
    await wallets[walletIndex].loadTransaction(transaction)
    this.setState({wallets})
  }

  selectWallet(key){
    if(this.state.connectedWallet) {
      const dAppConnector = this.state.dAppConnector
      dAppConnector.changeWallet(this.state.wallets[key])
      this.setState({dAppConnector})
    }
    const selectedWallet = key
    localStorage.setItem("selectedMultisigWallet", selectedWallet)
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
        (e) => toast.error("Transaction Failed:" + JSON.stringify(e.message))
      )
    
  }

   walletsEmpty = () => {
    return (
      <div className="walletsEmpty">
        <h2>No Multisig Wallets Found</h2>
        <p>Create a new multisig wallet to start using this APP.</p>
        <button className="commonBtn" onClick={() => this.setState({modal: "newWallet"})}>Add Multisig Wallet</button>
      </div>
    )
  }


  render() {  
  return(
    <div className="MultisigContainer">
        <React.StrictMode>
        <ModalsContainer moduleRoot={this} root={this.props.root} modal={this.state.modal} ></ModalsContainer>
        <div className="TokenVaultsContainerHeader" >
          <MWalletList root={this.props.root} moduleRoot={this}  ></MWalletList>
          <WalletConnector  moduleRoot={this} root={this.props.root}  key={this.state.connectedWallet}></WalletConnector>
         </div>

         {this.state.loading ? <LoadingIcon className="loadingIcon"> </LoadingIcon> :
        <div className='WalletInner' >
          { this.state.wallets.length === 0 ?  this.walletsEmpty()  : <MWalletMain root={this.props.root} moduleRoot={this}  wallet={this.state.wallets[this.state.selectedWallet]}></MWalletMain> }
        </div>
    }
        </React.StrictMode>
    </div>
  )  
}
}

export default MultisigContainer