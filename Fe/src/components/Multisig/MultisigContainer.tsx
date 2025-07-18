import MWalletList from "./WalletList";
import MWalletMain from './WalletMain'; 
import WalletConnector from '../walletConnector';
import connectSocket from  '../../helpers/SyncService';
import  { ReactComponent as LoadingIcon } from '../../html/assets/loading.svg';
import React from 'react';
import { toast } from 'react-toastify';
import "./MultisigContainer.css"
import ModalsContainer from './ModalsContainer';
import Messaging from '../../helpers/Messaging';
import MultisigWallet from '../../core/multisigWallet';
import { Socket } from 'socket.io-client';
import { Settings } from '../..';
import { Native } from './AddWalletModal';
import { App } from '../..';

type MultisigContainerProps = {
  settings: Settings;
  root: App;
};



type MultisigContainerState = {
  modal: string;
  expectingWallets: boolean;
  wallets: MultisigWallet[];
  pendingWallets: Record<string, any>;
  selectedWallet: number;
  connectedWallet: { name: string; socket: Socket | null };
  loading: boolean;
  dAppConnector: Messaging | null;

};



class MultisigContainer extends React.Component<MultisigContainerProps, MultisigContainerState> {
 private interval: NodeJS.Timeout | null  = null


  state : MultisigContainerState =  {
    expectingWallets: false,
    modal: "",
    wallets: [],
    pendingWallets: {},
    selectedWallet: 0,
    connectedWallet: {name: "", socket: null},
    loading : true,
    dAppConnector: null,
}


componentDidUpdate(prevProps: MultisigContainerProps) { 

  if (this.props.settings !== prevProps.settings) {
    this.newSettings(this.props.settings)
    
  }
}

async newSettings(newSettings : Settings){
  const wallets=[...this.state.wallets]
  for(let index = 0 ; index < this.state.wallets.length ; index++){
    try{
     await wallets[index].changeSettings(newSettings)
    }catch(e){
    }
  }
  const state = this.state
  state.wallets = wallets
  this.setState(state)
  this.reloadBalance()

}


async showModal(modalName: string){
  const state = this.state
  state.modal = modalName
  this.setState(state)
  }



async setState(state: MultisigContainerState){
    super.setState(state)
    this.storeState()
    this.storeWallets()
  }

  componentDidMount() {
    this.loadState()

  //  let port = chrome.runtime.connect("jfjmokidpopgdhcilhkoanmjcimijgng");
  //  port.onMessage.addListener((message) => {
  //      console.log("Received message from background script:", message);
  //  }
  //  );
 //  this.setState({port})

    this.interval = setInterval(() => {
        this.reloadBalance()
    }, 7000);
  }

  

  componentWillUnmount() {
    console.log("unmounting", this.state.dAppConnector)
    this.state.dAppConnector ? this.state.dAppConnector.disconnect() : null
    const state = this.state
    state.dAppConnector = null
    this.setState(state)
    if (this.interval) {
      clearInterval(this.interval);
    }

  }
  


  async connectWallet(wallet: string){
    try{

        if (this.state.connectedWallet) {
            const connectedWallet = this.state.connectedWallet
  
            if (connectedWallet.socket) {
                connectedWallet.socket.close()
            }
        }

      const socket =  await connectSocket(wallet, this, this.props.root.state.syncService, this.props.settings) 
      let connectedWallet = {  name :wallet , socket: socket}
      const state = this.state
      state.connectedWallet = connectedWallet
      this.setState(state)

    }
    catch(e: any){
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
    const state = this.state
    state.connectedWallet = connectedWallet
    this.setState(state)
  }
  
  
  async reloadAllBalance(){
    try {
      if (this.state.wallets.length > 0){
        const wallets = this.state.wallets
        for(let index = 0 ; index < this.state.wallets.length ; index++){
          await wallets[index].loadUtxos()
        }
        const state = this.state
        state.wallets = wallets
        this.setState(state)
      }
    }

    catch(e: any) {
      toast.error(e.message);
    } 

  }

  async reloadBalance(){
      try {
        if (this.state.wallets.length > 0){
          const wallets = this.state.wallets
          await wallets[this.state.selectedWallet].loadUtxos()
          const state = this.state
          state.wallets = wallets
          this.setState(state)
        }
      }

      catch(e: any) {
        toast.error(e.message);
      }
    

  }

  storeState(){

    localStorage.setItem("connectedWallet", JSON.stringify(this.state.connectedWallet.name ))
    localStorage.setItem("pendingWallets", JSON.stringify(this.state.pendingWallets))
  }

  storeWallets()  {
    if (this.state.loading) return

     const dataPack = this.state.wallets.map( (wallet,index)=> ({json: wallet.getJson(),
                                                                name :wallet.getName(),
                                                               defaultAddress: wallet.getDefaultAddress(),
                                                               addressNames: wallet.getAddressNames(),
                                                               collateralDonor: wallet.getCollateralDonor(),
                                                               pendingTxs: wallet.getPendingTxs().map( tx => ( {tx: tx.tx.toCBOR(), signatures: tx.signatures } ) ), 
                                                                defaultSigners: wallet.getDefaultSigners()
                                                              }) )
    localStorage.setItem("wallets", JSON.stringify(dataPack))
  }

  async loadState(){
    const wallets = JSON.parse(localStorage.getItem('wallets') || "[]");
    
    let state = this.state
    state.wallets = [];

    // Process wallets sequentially to maintain order
    for (const wallet of wallets) {
      const myWallet = new MultisigWallet(wallet.json, wallet.name);
      await myWallet.initialize(this.props.root.state.settings);
      await myWallet.setCollateralDonor(wallet.collateralDonor)
      await myWallet.setDefaultSigners(wallet.defaultSigners)
      await myWallet.setAddressNames(wallet.addressNames)
      await myWallet.setDefaultAddress(wallet.defaultAddress)
      myWallet.setPendingTxs(wallet.pendingTxs)

      wallet.pendingTxs.forEach((tx: any) => {
        myWallet.loadTransaction(tx);
      });
      
      state.wallets.push(myWallet);
    }

    state.pendingWallets = JSON.parse(localStorage.getItem('pendingWallets') || "{}")    
    if (localStorage.getItem('connectedWallet') && JSON.parse(localStorage.getItem('connectedWallet') || "") !== ""){
      this.connectWallet(JSON.parse(localStorage.getItem('connectedWallet') || ""))
    }

    state.selectedWallet =  Number(localStorage.getItem("selectedMultisigWallet")) || 0
    if (state.selectedWallet >= state.wallets.length) state.selectedWallet = 0
    
    const dAppConnector = new Messaging(this.state.wallets[this.state.selectedWallet], this)
    state.dAppConnector = dAppConnector
    state.loading = false
    this.setState(state)
  }
  
  modalType(){
    return "multisig"
  }

  async createTx(recipients: any[],signers: string[],sendFrom: string, sendAll: number | null){
    try{
    const state = this.state
    const wallets = state.wallets
    // this is the recipient shape (recipients: {amount: Record<string, bigint> , manipulate the input and convert numvers to bigInts
    recipients.map( (recipient) => {

      recipient.amount = Object.fromEntries(
        Object.entries(recipient.amount).map(([key, value]) => [key, BigInt(value as string)])
      );
    });
    await wallets[state.selectedWallet].createTx(recipients,signers,sendFrom,sendAll, false)
    this.setState(state)

    toast.info('Transaction created');

    }catch(e: any){
      if (e ==="InputsExhaustedError")
        toast.error("Insuficient Funds");
      else
        {
          toast.error(e.message);

          toast.error(e);
        }
    }
  }

  async setCollateralDonor(keyHash: string){
    try{
    const wallets = this.state.wallets 
    console.log(wallets)
    await wallets[this.state.selectedWallet].setCollateralDonor(keyHash)
    const state = this.state
    state.wallets = wallets
    this.setState(state)
    toast.info('Collateral Donor Set');
    }catch(e: any){
      toast.error(e.message);
    }

  }


  async importTransaction(transaction: string){
    try{
    const wallets = this.state.wallets
    const txHash = await this.state.wallets[this.state.selectedWallet].importTransaction(transaction)
    const state = this.state
    state.wallets = wallets
    this.setState(state)
    
   


    toast.success("Transaction imported");
    return txHash
    }catch(e: any){
      toast.error("Could not import transaction: " + e.message);
      

      return {"code": 1, "error": "Could not import transaction: " + e.message}

    }
  }
  getSigners(){
    const wallets = this.state.wallets
    return wallets[this.state.selectedWallet].getSigners()
  }

  getSignerName(keyHash: string){
    const wallets = this.state.wallets
    return wallets[this.state.selectedWallet].getSignerName(keyHash)
  }
  
  async createDelegationTx(pool: string, dRepId: string, signers: string[]){
    try{
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createDelegationTx(pool, dRepId, signers)
     const state = this.state
     state.wallets = wallets
     this.setState(state)
    toast.info('Delegation Transaction created');

    }catch(e: any){
      toast.error(e.message);
    }

    
  }

  async createStakeUnregistrationTx(signers: string[]){
    try{
    const wallets = this.state.wallets
      await this.state.wallets[this.state.selectedWallet].createStakeUnregistrationTx(signers)
    const state = this.state
    state.wallets = wallets
    this.setState(state)
    toast.info('Stake Unregistration Transaction created');
    }catch(e: any){
      toast.error(e.message);
    }

  }

  async deleteWallet(index: number){
    const wallets = this.state.wallets
    const confirmation =  window.confirm("Are you sure you want to delete this wallet?");
    if (confirmation === false){
      return
    }
    const state = this.state
    if (index === this.state.selectedWallet){
      state.selectedWallet = 0
    }
    state.modal = ""
    wallets.splice(index,1)
    state.wallets = wallets
    this.setState(state)
    this.connectWallet(this.state.connectedWallet.name)
  }

  async removePendingTx(index: number){
    const wallets = this.state.wallets
    await wallets[this.state.selectedWallet].removePendingTx(index)
    const state = this.state
    state.wallets = wallets
    this.setState(state)
  }


  changeWalletName(name: string){
    const wallets = this.state.wallets
    wallets[this.state.selectedWallet].setName(name)
    const state = this.state
    state.wallets = wallets
    this.setState(state)
  }



  addSignature(signature: string){ 
    try {
    const wallets = this.state.wallets
    const index = wallets[this.state.selectedWallet].addSignature(signature)
    const transaction = wallets[this.state.selectedWallet].getPendingTx(index!)
    this.transmitTransaction(transaction, signature)
    const state = this.state
    state.wallets = wallets
    this.setState(state)
    if(wallets[this.state.selectedWallet].signersCompleted(index!)){
      this.submit(index!)
    }
    toast.info('Signature Added');
    }
    catch(e: any) {
      toast.error(e.message);
    }

  }

  setDefaultAddress(address: string){
    try {
      const wallets = this.state.wallets
      wallets[this.state.selectedWallet].setDefaultAddress(address)
      const state = this.state
      state.wallets = wallets
      this.setState(state)
      toast.info('Default Account Changed');


      }
      catch(e: any) {
        toast.error(e.message);
      }

  }


  updateSignerName(keyHash: string, name: string){
    const wallets = this.state.wallets
    wallets[this.state.selectedWallet].updateSignerName(keyHash, name)
    const state = this.state
    state.wallets = wallets
    this.setState(state)
  }


  changeAddressName(address: string, name: string){
    try {
      
      const wallets = this.state.wallets
      wallets[this.state.selectedWallet].changeAddressName(address,name)
      const state = this.state
      state.wallets = wallets
      this.setState(state)
      }
      catch(e: any) {
        toast.error(e.message);
      }

  }

  // getTransactionHistory(address: string){

  //   const wallets = this.state.wallets
  //   const resault = wallets[this.state.selectedWallet].getTransactionHistory(address)
  //   const state = this.state
  //   state.wallets = wallets
  //   this.setState(state)
  //   toast.promise(

  //     resault,
  //     {
  //       pending: 'Getting Transaction History',
  //       error: 'Failed Retriving Transaction History'
  //     }
  // )
  //   return resault
  // }

  deleteImportedWallet(key: string){
    const pendingWallets = this.state.pendingWallets
    delete pendingWallets[key]
    const state = this.state
    state.pendingWallets = pendingWallets
    this.setState(state)
  }


  deleteAllPendingWallets(){
    const pendingWallets = this.state.pendingWallets
    for (var key in pendingWallets) {
      delete pendingWallets[key]
    }
    const state = this.state
    state.pendingWallets = pendingWallets
    this.setState(state)
  }


  async importPendingWallet(key: string){
    try{
      const pendingWallets = this.state.pendingWallets
      const wallets = this.state.wallets
      const pendingWallet = pendingWallets[key]
      const myWallet = new MultisigWallet(pendingWallet.json,"");
      const walletHash = await myWallet.getId()
      const walletsHashes = wallets.map(wallet =>  wallet.getId())
      // resole promices in walletHashes
      const res = await Promise.all(walletsHashes)
      if (! res.includes(walletHash)) {
        await myWallet.initialize(this.props.root.state.settings);
        myWallet.resetDefaultSigners()
        wallets.push(myWallet)
        const state = this.state
        state.wallets = wallets
        //remove pending wallet
        delete pendingWallets[key]
        state.pendingWallets = pendingWallets
        this.setState(state)
        this.selectWallet(wallets.length - 1)
        if (this.state.connectedWallet.socket) {
          this.state.connectedWallet.socket.emit('subscribe' , pendingWallet.json)}

          this.state.dAppConnector?.changeWallet(myWallet)
          toast.success("Wallet Imported");
          
      }else{
        toast.error("Wallet already exists")
      }
      }catch(e: any){
        toast.error(e.message);
      }
  }




  async addWallet(script: Native,name: string){
    const wallets = this.state.wallets
    const walletsHashes = wallets.map(wallet =>  wallet.getId())
    const res = await Promise.all(walletsHashes)
    const myWallet = new MultisigWallet(script,name);
    await myWallet.initialize(this.props.root.state.settings);
    myWallet.resetDefaultSigners()
    const walletHash = await myWallet.getId()

    if (! res.includes(walletHash)) {
      
      this.transmitWallet(script)
      wallets.push(myWallet)
      const state = this.state
      state.wallets = wallets
      
      this.setState(state)
      this.selectWallet(wallets.length - 1)

      if (this.state.connectedWallet.socket) {
         this.state.connectedWallet.socket.emit('subscribe' , script)}
      if(this.state.wallets.length === 1)
        this.state.dAppConnector?.changeWallet(myWallet)
    }else{
      
      toast.error("Wallet already exists")
    }
  }

  loadWallets(){
    if(this.state.connectedWallet.socket) {
        this.state.connectedWallet.socket.emit('loadWallets')
        this.setExpectingWallets(true)
    }else{
      toast.error("Not Connected to a SyncService")
    }
  }
  

  stopExpectingWallets(){
    const state = this.state
    state.expectingWallets = false
    this.setState(state)
  }

  setPendingWallets(pendingWallets: Record<string, any>){
    const state = this.state
    state.pendingWallets = pendingWallets
    this.setState(state)
  }

  setExpectingWallets(expecting: boolean){
    const state = this.state
    state.expectingWallets = expecting
    this.setState(state)
  }

  setDefaultSigners(signers: any){
    const wallets = this.state.wallets
    wallets[this.state.selectedWallet].setDefaultSigners(signers)
    const state = this.state
    state.wallets = wallets
    this.setState(state)
  }


  transmitTransaction(transaction: any, sigAdded: any) {
    if(this.props.root.state.settings.disableSync) return
    try{
    fetch(this.props.root.state.syncService+'/api/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({tx: transaction.tx.toCBOR() ,sigAdded: sigAdded ,  signatures: transaction.signatures , wallet:  this.state.wallets[this.state.selectedWallet].getJson()}),
      }).catch(e => toast.error("Could not transmit transaction: " + e.message));
    }catch(e: any){
      toast.error("Could not transmit transaction: " + e.message);
    }
  }


  async syncTransaction(transaction: any){
    for(let walletIndex = 0; walletIndex < this.state.wallets.length; walletIndex++){
        this.loadTransaction(transaction, walletIndex)
      }
  }

  transmitWallet(script: Native) {
    try{  
    if(this.props.root.state.settings.disableSync) return
     fetch(this.props.root.state.syncService+'/api/wallet', {
      method: 'POST',


      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(script),
      }).catch(e => toast.error("Could not transmit wallet: " + e.message));
    }catch(e: any){
      toast.error("Could not transmit wallet: " + e.message);
    }
  }


  async loadTransaction(transaction: any, walletIndex: number){
    const wallets = this.state.wallets
    await wallets[walletIndex].loadTransaction(transaction)
    const state = this.state
    state.wallets = wallets
    this.setState(state)
  }


  selectWallet(key: number){
    if(this.state.connectedWallet) {
      const dAppConnector = this.state.dAppConnector
      if (dAppConnector) {
        dAppConnector.changeWallet(this.state.wallets[key])
      }
      const state = this.state
      state.dAppConnector = dAppConnector
      this.setState(state)

    }
    const selectedWallet = key
    const state = this.state
    state.selectedWallet = selectedWallet
    localStorage.setItem("selectedMultisigWallet", selectedWallet.toString())
    this.setState(state)
    this.reloadBalance()

  }



  async submit(index : number){
   
    const wallets = this.state.wallets
    const promice = wallets[this.state.selectedWallet].submitTransaction(index)
    const state = this.state
    state.wallets = wallets
    this.setState(state)

    toast.promise(
      promice,
      {
        pending: 'Submiting Transaction',
        success: 'Transaction Submited'
      }
      )
      promice.then( 
        //add a small delay to allow the transaction to be broadcasted
        () => setTimeout(() => this.reloadBalance(), 2000)
      ).catch(
        (e) => {
          if(e.message.includes("Insuficient Funds")){
            toast.error("Insuficient Funds")
          }else if(e.message.includes("(ValueNotConservedUTxO (Mismatch {mismatchSupplied = MaryValue (Coin 0)")){
            toast.error("Tx Already Submitted")
          }else{
            console.log(e.message)
            toast.error("Transaction Failed:" + JSON.stringify(e.message))
          }
        }
      )
    
  }
  openNewWalletModal(){
    const state = this.state
    state.modal = "newWallet"
    this.setState(state)
  }


   walletsEmpty = () => {
    return (

      <div className="walletsEmpty">
        <h2>No Multisig Wallets Found</h2>
        <p>Create a new multisig wallet to start using this APP.</p>
        <button className="commonBtn" onClick={() => this.openNewWalletModal()}>Add Multisig Wallet</button>
      </div>

    )
  }


  render() {  
  return(
    <div className="MultisigContainer">
        <React.StrictMode>
        <ModalsContainer moduleRoot={this} root={this.props.root} modal={this.state.modal} ></ModalsContainer>
        <div className="ContainerHeader" >
          <MWalletList root={this.props.root} moduleRoot={this}  ></MWalletList>

          <WalletConnector  moduleRoot={this} openWalletPicker={(wallet) => this.props.root.openWalletPicker(wallet)}  key={this.state.connectedWallet.name}></WalletConnector>
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