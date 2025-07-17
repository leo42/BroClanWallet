import React from 'react';
import { toast } from 'react-toastify';
import MintingModule from './mintingModule';  
import ImportModule from './importModule';
import NewWalletModal from './NewWalletModal';
import UpdateWalletModal from './UpdateWalletModal';
import SmartWallet from '../../core/smartWallet';
import MWalletMain from './WalletMain'; 
import  { ReactComponent as LoadingIcon } from '../../html/assets/loading.svg';
import './SmartWalletContainer.css';
import { Settings , } from '../../index';
import { SmartMultisigJson } from "./types";
import {getAddressDetails} from "@lucid-evolution/lucid";
import WalletSettings from './walletSettings';
import { ReactComponent as ExpandIcon } from '../../html/assets/settings.svg';
import Messaging from '../../helpers/Messaging';
import getTokenInfo from "../../helpers/tokenInfo"
import WalletConnector from '../walletConnector';
import connectSocket from '../../helpers/SyncService';
import WalletImportModal from '../WalletImportModal';


interface SmartWalletContainerProps {
  settings: Settings;
  root: any;
}

interface SmartWalletContainerState {
  modal: string;
  wallets: SmartWallet[];
  selectedWallet: number;
  connectedWallet: { name: string; socket: any };
  loading: boolean;
  dAppConnector: Messaging | null;
  walletSettingsOpen: boolean;
  expectingWallets: boolean;
  pendingWallets: Record<string, any>;  
}


class SmartWalletContainer extends React.Component<SmartWalletContainerProps, SmartWalletContainerState> {
  private interval: NodeJS.Timeout | null = null;

  state: SmartWalletContainerState = {
    modal: "",
    wallets: [],
    selectedWallet: 0,
    connectedWallet: { name: "", socket: null },
    loading: true,
    dAppConnector: null,
    walletSettingsOpen: false,
    expectingWallets: false,
    pendingWallets: {},
  };
  

  componentDidMount() {
    setTimeout(() => {
      this.loadState();
    }, 50);
    this.interval = setInterval(() => {
      this.reloadBalance();
    }, 15000);
  }

  

  componentWillUnmount() {
    if (this.state.dAppConnector) {
      this.state.dAppConnector.disconnect();
      const state = this.state
      state.dAppConnector = null
      this.setState(state)

    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  componentDidUpdate(prevProps: SmartWalletContainerProps) {
    if (this.props.settings !== prevProps.settings) {
      this.newSettings(this.props.settings);
      
      // Check if the network has changed
      if (this.props.settings.network !== prevProps.settings.network) {
        this.importWallets();
      }
    }
  }

  setExpectingWallets(expecting: boolean){
    this.setState({expectingWallets: expecting})
  }

  async newSettings(newSettings: any) {
    // Implementation similar to MultisigContainer
  }

  async showModal(modalName: string) {
    this.setState({ modal: modalName });
  }

  async connectWallet(wallet: string){
    try{

        if (this.state.connectedWallet) {
            const connectedWallet = this.state.connectedWallet
  
            if (connectedWallet.socket) {
                connectedWallet.socket.close()
            }
        }

      const socket =  await connectSocket(wallet, this, this.props.root.state.smartSyncService, this.props.settings) 
      let connectedWallet = {  name :wallet , socket: socket}
      const state = this.state
      state.connectedWallet = connectedWallet
      localStorage.setItem("smartConnectedWallet", wallet)
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
    localStorage.removeItem("smartConnectedWallet")
    this.setState(state)
  }
  

  stopExpectingWallets(){
    this.setState({expectingWallets: false})
  }

  setPendingWallets(pendingWallets: Record<string, any>){
    this.setState({pendingWallets: pendingWallets})
  }

  syncTransaction(transaction: any){
    console.log("syncTransaction", transaction)
    for(let walletIndex = 0; walletIndex < this.state.wallets.length; walletIndex++){
      console.log("walletIndex", walletIndex, this.state.wallets[walletIndex].getId(), transaction.wallet)
      if ( this.state.wallets[walletIndex].getId() === transaction.wallet){
        this.loadTransaction(transaction, walletIndex)
      }
  }
  }

  async loadTransaction(transaction: any, walletIndex: number){
    console.log("loadTransaction", transaction)
    const wallets = this.state.wallets
    const wallet = wallets[walletIndex]
    const state = this.state
    state.wallets = wallets

    try{
      await wallet.addPendingTx({tx: transaction.transaction, signatures: {}})
    }catch(e){

    }
    Object.keys(transaction.signatures).map( (key) => {
      try{
        wallet.addSignature(transaction.signatures[key])
        toast.info("Transaction update for wallet:" + wallet.getName());
      }catch(e){
      }
        
  })
    this.setState(state)
  }



  async reloadBalance() {
    if (this.state.wallets.length > 0){
      const wallets = [...this.state.wallets]
      const wallet = wallets[this.state.selectedWallet]
      const result = await wallet.loadUtxos()
      this.setState({wallets: wallets})
      if (result){
        this.storeWallets()
      }
    }
  }

  storeState() {
    // Implementation similar to MultisigContainer`
  }

  
  async loadState() {
    await this.importWallets()
    this.setState({loading: false})
    const dAppConnector = new Messaging(this.state.wallets[this.state.selectedWallet], this)
    this.setState({dAppConnector: dAppConnector})
    const connectedWallet = localStorage.getItem("smartConnectedWallet")
    if(connectedWallet){
      this.connectWallet(connectedWallet)
    }
  }
  

  modalType() {
    return "smart";
  }
  
  async createTx(recipients: any[], signers: any[], sendFrom: string = "", sendAll: number | null = null, withdraw: boolean = true) {
    try {
      const wallets = [...this.state.wallets]
      const wallet = wallets[this.state.selectedWallet]
      await wallet.createTx(recipients, signers, sendFrom, sendAll, withdraw)
      this.setState({wallets: wallets})
      this.storeWallets()
      toast.info("Transaction created successfully!")
    } catch (error: any) {
      toast.error("Error creating transaction: " + error.message)
      console.log("error", error)
    }
  }
  
  async createUpdateTx(signers: string[], newConfig: SmartMultisigJson) {
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    if(signers.length === 0){
      throw new Error("No signers provided")
    }
    if(wallet.checkSigners(signers) === false){
      throw new Error("Invalid signers")
    }
    console.log("newConfig", newConfig, signers)
    await wallet.createUpdateTx(signers, newConfig)
    this.setState({wallets: wallets})
    this.storeWallets()
    toast.info("Wallet update transaction created successfully!")
  }
  
  async importTransaction(transaction: any) {
    try{
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    const txHash = await wallet.addPendingTx({tx: transaction, signatures: {}})
    this.setState({wallets: wallets})



    toast.success("Transaction imported");
    return txHash
    }catch(e: any){
      toast.error("Could not import transaction: " + e.message);
      

      return {"code": 1, "error": "Could not import transaction: " + e.message}

    }
  }
  
  async deleteWallet(index: number) {
    try{
      if (window.confirm('Are you sure you want to delete this wallet?')) {
        const wallets = [...this.state.wallets]
        wallets.splice(index, 1);
        this.setState({selectedWallet : 0})
        this.setState({wallets: wallets})
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      this.storeWallets()    
      this.setState({walletSettingsOpen: false})

  }
  catch(error: any){
    toast.error("Error deleting wallet: " + error.message)
    console.log("error", error)
  }
}


  changeWalletName(name: string) {
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    wallet.setName(name)
    this.setState({wallets: wallets})
    this.storeWallets()
  }

  transmitTransaction(transaction: any, sigAdded: any) {
    if(this.props.root.state.settings.disableSync) return
    try{
    fetch(this.props.root.state.smartSyncService+'/api/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({tx: transaction.tx.toCBOR() ,sigAdded: sigAdded , network: this.props.settings.network,  signatures: transaction.signatures , wallet:  this.state.wallets[this.state.selectedWallet].getId()})
      }).catch(e => toast.error("Could not transmit transaction: " + e.message));
    }catch(e: any){
      toast.error("Could not transmit transaction: " + e.message);
    }
  }
  
  addSignature(signature: string) {
    try{
        const wallets = [...this.state.wallets]
        const wallet = wallets[this.state.selectedWallet]
        const index = wallet.addSignature(signature)
        this.transmitTransaction(wallet.getPendingTxs()[index], signature)
        this.setState({wallets: wallets})
        this.storeWallets()
        if(wallet.signersCompleted(index)){
          this.submit(index)
        }
        
      }catch(error: any){
        toast.error("Error adding signature: " + error.message)
        console.log("error", error)
    }
  }

  setDefaultSigners (signers: string[]) {
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    wallet.setDefaultSigners(signers)
    this.setState({wallets: wallets})
    this.storeWallets()
  }

  setDefaultAddress(address: string) {
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    wallet.setDefaultAddress(address)
    this.setState({wallets: wallets})
    this.storeWallets()
  }
  

  storeWallets() {
    const wallets = this.state.wallets.map((wallet) => { return { id: wallet.getId(), 
                                                                  txs: wallet.getPendingTxs().map(tx => ({ tx: tx.tx.toCBOR({canonical: true}), signatures: tx.signatures })),
                                                                  defaultAddress: wallet.getDefaultAddress(),
                                                                  addressNames: wallet.getAddressNames(),
                                                                  defaultSigners: wallet.getDefaultSigners(),
                                                                  name: wallet.getName()
      

    }})
    localStorage.setItem(this.props.settings.network + "smartWallets", JSON.stringify(wallets))
    localStorage.setItem(this.props.settings.network + "selectedWallet", JSON.stringify(this.state.selectedWallet))
  }


  getSigners(): { name: string; hash: string; isDefault: boolean }[] {
    const wallets = [...this.state.wallets];
    const wallet = wallets[this.state.selectedWallet];
    const signers = wallet.getSigners();
    
    const storedSignerNames = JSON.parse(localStorage.getItem('signerNames') || '{}');
    
    const result = signers.map((signer) => {
      const name = storedSignerNames[signer.hash] || signer.hash;
      return { name, hash: signer.hash, isDefault: signer.isDefault };
    });
    
    return result;
  }
  
  getSignerName(keyHash: string): string {
    const storedSignerNames = JSON.parse(localStorage.getItem('signerNames') || '{}');

    try{
          const details = getAddressDetails(keyHash)
      if (details && details.paymentCredential) {
          return storedSignerNames[details.paymentCredential.hash] === undefined ? keyHash : storedSignerNames[details.paymentCredential.hash];
      }else {
        return keyHash;
      }
  }
  catch(error: any){
    if(keyHash === ""){
      return "Empty" ;
    }
    if (!/^[0-9a-fA-F]{56}$/.test(keyHash)) {
      return "Invalid keyHash/address";
    }
    return storedSignerNames[keyHash] ;
  }
  }

  updateSignerName(hash: string, name: string) {
    console.log("updateSignerName", hash, name, hash.length)
    const isValidHex = /^[0-9a-fA-F]+$/.test(hash);
    if (!isValidHex || hash.length !== 56 ) {
      return;
    }
    const storedSignerNames = JSON.parse(localStorage.getItem('signerNames') || '{}');
    storedSignerNames[hash] = name;
    localStorage.setItem('signerNames', JSON.stringify(storedSignerNames));
    
    this.forceUpdate();
  }
  
  removePendingTx(tx: number) {
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    wallet.removePendingTx(tx)
    this.setState({wallets: wallets})
    this.storeWallets()
  }

  async addWallet(id: any, name?: string, promice?: Promise<any>) {
    try{
    const newWallet = new SmartWallet(id, this.props.settings)
    if(this.state.wallets.length === 1){
      const dAppConnector = new Messaging(newWallet, this)
      this.setState({dAppConnector: dAppConnector})
    }
  
    await newWallet.initializeLucid()
    const wallets =[...this.state.wallets, newWallet]
    this.setState({wallets: wallets})
    this.storeWallets()

    if(promice){
      await promice
      while(!await newWallet.loadConfig()){
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if(name){
      newWallet.setName(name)
    }else{
      // const ConfigName = await getTokenInfo(newWallet.configTokenId())
      // console.log("ConfigName", ConfigName)
      newWallet.setName(id) //todo Update after blockfrost api is fixed
    }
    
    newWallet.initilizeSigners()
    this.setState({wallets: wallets})
    this.storeWallets()
    toast.info(`Wallet ${name} successfully created!`)
    }catch(error: any){
      toast.error("Error creating wallet: " + error.message)
      console.log("error", error)
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
  

  async reloadWallets(){
    await this.importWallets()
    this.setState({loading: false})
  }

  setCollateralDonor (address: string) {
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    wallet.setCollateralDonor(address)
    this.setState({wallets: wallets})
    this.storeWallets()
  }

  async importWallets() {

    const wallets = JSON.parse(localStorage.getItem(this.props.settings.network + "smartWallets") || "[]");
    const loadedWallets = await Promise.all(wallets.map(async (wallet: any) => {
      const newWallet = new SmartWallet(wallet.id, this.props.settings);
      await newWallet.initializeLucid();
      wallet.txs.forEach((tx: any) => {
        newWallet.addPendingTx(tx);
      });
      newWallet.setDefaultAddress(wallet.defaultAddress)
      newWallet.setAddressNames(wallet.addressNames)
       newWallet.setDefaultSigners(wallet.defaultSigners || [])
       newWallet.setName(wallet.name || "New Wallet")
      await newWallet.checkTransactions()
      return newWallet;
    }));

    this.setState({ wallets: loadedWallets });
    const selectedWallet = JSON.parse(localStorage.getItem(this.props.settings.network + "selectedWallet") || "0");
    
    this.setState({selectedWallet: selectedWallet > this.state.wallets.length ? 0 : selectedWallet })
  }

  async createDelegationTx(pool: string, dRepId: string,signers: string[]) {
    try{
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    await wallet.createDelegationTx(pool, dRepId, signers)
    this.setState({wallets: wallets})
    this.storeWallets()
    toast.info("Delegation transaction created successfully!")
  }
  catch(error: any){
    if(error.message.includes("EMPTY_UTXO: UTxO array is empty")){
      toast.warning("Wallet is empty")
    }
    else{
      toast.error("Error creating delegation transaction: " + error.message)
      console.log("error", error)
    }
  }
  }

  changeAddressName (address: string, name: string) {
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    wallet.changeAddressName(address, name)
    this.setState({wallets: wallets})
    this.storeWallets()
  }

  async createStakeUnregistrationTx ( signers: string[]) {
    try{
      const wallets = [...this.state.wallets]
      const wallet = wallets[this.state.selectedWallet]
      await wallet.createStakeUnregistrationTx(signers)
      this.setState({wallets: wallets})
      this.storeWallets()
      toast.info("Stake unregistration transaction created successfully!")
    }
    catch(error: any){
      toast.error("Error creating stake unregistration transaction: " + error.message)
      console.log("error", error)
    }
  }


  selectWallet(key: number) {
    console.log("selectWallet", key)
    const state = this.state
    state.selectedWallet = key
    this.setState(state)
    localStorage.setItem(this.props.settings.network + "selectedWallet", JSON.stringify(key))

    if(this.state.dAppConnector){
      this.state.dAppConnector.changeWallet(this.state.wallets[key])
      state.dAppConnector = this.state.dAppConnector
      this.setState(state)
    }
  }



  async submit(index: number) {
    try{
      const wallets = [...this.state.wallets]
      const wallet = wallets[this.state.selectedWallet]
      const [txSub, txHash] = await wallet.submitTransaction(index)
      toast.promise(txSub, {
        pending: "Submitting transaction...",
        success: "Transaction submitted successfully!",
      })
      await txSub
      wallet.removePendingTxByHash(txHash)
      this.setState({wallets: wallets})
      this.storeWallets()
    }
    catch(error: any){
      if(error.message.includes("MaryValue (Coin 0)") || error.toString().includes("(MaryValue (Coin 0)")){
        toast.warning("Transaction already submitted")
        console.log("error", error)
      }
      else{
        toast.error("Error submitting transaction: " + error.message)
        console.log("error", error)
      }
    }
  }

  walletsEmpty() {
    return (
     <div className="walletsEmpty">
        <h2>No Smart Wallets Found</h2>
        <p>Create or Import a new smart wallet to start using this APP.</p>
        <button className="commonBtn" onClick={() => this.setState({modal: "newWallet"})}>Add Smart Wallet</button>
      </div>
    );
  }

  WalletList () {

    return (
    <div className='WalletListContainer multisigWalletListContainer'>
        <button className={"addWalletButton" + ( this.state.wallets.length === 0 ? " addWalletButtonHighlight" : " ") } onClick={ () => this.showModal("newWallet")}>+</button>
        <select className="MWalletList" value={this.state.selectedWallet} onChange={(event) => this.selectWallet(parseInt(event.target.value))}>

        {this.state.wallets.map( (item, index) => (
               <option key={index} value={index}> {item.getName()}-{String((item.getBalance()/1000000).toFixed(2))}{this.props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  } </option>
        ))}

    </select>
    {this.state.wallets.length > 0 && <button className={"addNewWalletButton" }>
             <ExpandIcon className="walletSettingsIcon" onClick={() => this.setState({walletSettingsOpen: !this.state.walletSettingsOpen})}/> 
         </button>}

    </div>
    );
    
}

deleteAllPendingWallets(){
  this.setState({pendingWallets: {}})
}

deleteImportedWallet(id: string){
  const pendingWallets = {...this.state.pendingWallets}
  delete pendingWallets[id]
  this.setState({pendingWallets: pendingWallets})
}

importPendingWallet(id: string){
  const pendingWallets = {...this.state.pendingWallets}
  const wallet = pendingWallets[id]
  delete pendingWallets[id]
  this.setState({pendingWallets: pendingWallets})
  if(wallet){
    this.addWallet(wallet.walletId, wallet.walletName)
  }
}
closeModal(){
  const state = this.state
  state.modal = ""
  this.setState(state)
}
  

  render() {
    return (

      <div className="SmartWalletContainer"> 

      <div className="ContainerHeader" style={{ top: "-14px"}}>
        {this.WalletList()}
        <WalletConnector  moduleRoot={this} openWalletPicker={(wallet) => this.props.root.openWalletPicker(wallet)}  key={this.state.connectedWallet.name}></WalletConnector>
      </div>
      {this.state.walletSettingsOpen && this.state.wallets.length > 0 && <WalletSettings moduleRoot={this} wallet={this.state.wallets[this.state.selectedWallet]} closeSettings={() => this.setState({walletSettingsOpen: false})} />}
            
      {this.state.modal === "pendingWallets" && <WalletImportModal setOpenModal={() => this.setState({modal: ""})}  moduleRoot={this} />}
      { this.state.modal === "updateWallet" && this.state.wallets[this.state.selectedWallet] &&<UpdateWalletModal root={this.props.root} moduleRoot={this} wallet={this.state.wallets[this.state.selectedWallet]} setOpenModal={() => this.closeModal()} hostModal={() => this.setState({walletSettingsOpen: false})} /> }
      { this.state.modal === "newWallet" && < NewWalletModal  moduleRoot={this} showModal={() => this.closeModal()} /> }
      { this.state.modal === "minting" && < MintingModule root={this.props.root} moduleRoot={this}  /> }
      { this.state.modal === "importWallet" && < ImportModule root={this.props.root} moduleRoot={this}  /> }
       
      {  this.state.loading ?<div className="loadingIconContainer"><LoadingIcon className="loadingIcon"> </LoadingIcon></div> :
         this.state.wallets.length === 0 ? this.walletsEmpty() : (
          <MWalletMain wallet={this.state.wallets[this.state.selectedWallet]} root={this.props.root} moduleRoot={this} />
        )}
      </div>
    );
  }
  
}

export default SmartWalletContainer;
