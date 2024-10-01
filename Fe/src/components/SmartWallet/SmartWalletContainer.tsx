import React from 'react';
import { toast } from 'react-toastify';
import MintingModule from './mintingModule';  // Changed to match the actual file name
import UpdateWalletModal from './UpdateWalletModal';
import SmartWallet from './smartWallet';
import MWalletMain from './WalletMain'; 
import './SmartWalletContainer.css';
import { Settings , } from '../../types/app';
import { SmartMultisigJson } from "./types";

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
  dAppConnector: any | null;
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
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  componentDidUpdate(prevProps: SmartWalletContainerProps) {
    if (this.props.settings !== prevProps.settings) {
      this.newSettings(this.props.settings);
    }
  }

  async newSettings(newSettings: any) {
    // Implementation similar to MultisigContainer
  }

  async showModal(modalName: string) {
    this.setState({ modal: modalName });
  }

  async connectWallet(wallet: string) {
    // Implementation similar to MultisigContainer
  }

  disconnectWallet(error: string = "") {
    // Implementation similar to MultisigContainer
  }

  async reloadBalance() {
    // Implementation similar to MultisigContainer
  }

  storeState() {
    // Implementation similar to MultisigContainer`
  }

  
  async loadState() {
    this.loadWallets()
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
    } catch (error: any) {
      toast.error("Error creating transaction: " + error.message)
      console.log("error", error)
    }
  }
  
  async createUpdateTx(signers: string[], newConfig: SmartMultisigJson) {
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    console.log("newConfig", newConfig, signers)
    await wallet.createUpdateTx(signers, newConfig)
    this.setState({wallets: wallets})
    this.storeWallets()
  }
  
  async importTransaction(transaction: any) {
    // Implementation similar to MultisigContainer
  }
  
  async deleteWallet(index: number) {
    try{
      const wallets = [...this.state.wallets]
      wallets.splice(index, 1);
      this.setState({selectedWallet : 0})
      this.setState({wallets: wallets})
      this.storeWallets()
      
    
  }
  catch(error: any){
    toast.error("Error deleting wallet: " + error.message)
    console.log("error", error)
  }
}


  changeWalletName(name: string) {
    // Implementation similar to MultisigContainer
  }
  
  addSignature(signature: string) {
    try{
        const wallets = [...this.state.wallets]
        const wallet = wallets[0]
        wallet.addSignature(signature)
        this.setState({wallets: wallets})
        this.storeWallets()
      }catch(error: any){
        toast.error("Error adding signature: " + error.message)
        console.log("error", error)
    }
  }

  setDefaultAddress(address: string) {
    // Implementation similar to MultisigContainer
  }
  
  changeAddressName(address: string, name: string) {
    // Implementation similar to MultisigContainer
  }
  
  getTransactionHistory(address: string) {
    // Implementation similar to MultisigContainer
  }

  storeWallets() {
    const wallets = this.state.wallets.map((wallet) => { return { id: wallet.getId(), 
                                                                  txs: wallet.getPendingTxs()
      

    }})
    localStorage.setItem("smartWallets", JSON.stringify(wallets))
    console.log("wallets", this.state.wallets)
  }

  removePendingTx(tx: number) {
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    wallet.removePendingTx(tx)
    this.setState({wallets: wallets})
    this.storeWallets()
  }
  
  async loadWallet(id: string) {
    const newWallet = new SmartWallet(id, this.props.settings)
    await newWallet.initializeLucid()
    this.setState({wallets: [...this.state.wallets, newWallet]})
  }

  async addWallet(id: any) {
    await this.loadWallet(id)
    this.storeWallets()
  }

  async loadWallets() {
    const wallets = JSON.parse(localStorage.getItem("smartWallets") || "[]")
    wallets.forEach(async (wallet: any) => {
      const newWallet = new SmartWallet(wallet.id, this.props.settings)
      await newWallet.initializeLucid()
      wallet.txs.forEach((tx: any) => {
        newWallet.addPendingTx(tx)
      })
      this.setState({wallets: [...this.state.wallets, newWallet]})
    })
  }

  async createDelegationTx(pool: string, signers: string[]) {
    try{
    const wallets = [...this.state.wallets]
    const wallet = wallets[this.state.selectedWallet]
    wallet.createDelegationTx(pool, signers)
    this.setState({wallets: wallets})
    this.storeWallets()
  }
  catch(error: any){
    toast.error("Error creating delegation transaction: " + error.message)
    console.log("error", error)
  }
  }


  transmitTransaction(transaction: any, sigAdded: any) {
    // Implementation similar to MultisigContainer
  }

  transmitWallet(script: any) {
    // Implementation similar to MultisigContainer
  }

  async loadTransaction(transaction: any, walletIndex: number) {
    // Implementation similar to MultisigContainer
  }

  selectWallet(key: number) {
    this.setState({selectedWallet: key})
  }

  async submit(index: number) {
    try{
      const wallets = [...this.state.wallets]
      const wallet = wallets[index]
      const txSub =wallet.submitTransaction(index)
      toast.promise(txSub, {
        pending: "Submitting transaction...",
        success: "Transaction submitted successfully!",
      })
      await txSub
      this.setState({wallets: wallets})
      this.storeWallets()
    }
    catch(error: any){
      toast.error("Error submitting transaction: " + error.message)
      console.log("error", error)
    }
  }

  walletsEmpty() {
    return (
     <div className="walletsEmpty">
        <h2>No Smart Wallets Found</h2>
        <p>Create or Import a new smart wallet to start using this APP.</p>
        <button className="commonBtn" onClick={() => this.setState({modal: "newWallet"})}>Add Smart Wallet</button>
        <button className="commonBtn" onClick={() => this.setState({modal: "importWallet"})}>Import Smart Wallet</button>
      </div>
    );
  }

  WalletList () {

    return (
    <div className='WalletListContainer multisigWalletListContainer'>
        <select className="MWalletList" value={this.state.selectedWallet} onChange={(event) => this.selectWallet(parseInt(event.target.value))}>

        {this.state.wallets.map( (item, index) => (
               <option key={index} value={index}> {item.getName()}-{String((item.getBalance()/1000000).toFixed(2))}{this.props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  } </option>
        ))}

    </select>


    <button className={"addWalletButton" + ( this.state.wallets.length === 0 ? " addWalletButtonHighlight" : " ") } onClick={ () => this.showModal("newWallet")}>+</button>

    </div>
    );
    
}
  
  render() {
    return (
      <div className="SmartWalletContainer"> 
      {this.WalletList()}
      { this.state.modal === "updateWallet" && this.state.wallets[this.state.selectedWallet] &&<UpdateWalletModal root={this.props.root} moduleRoot={this} wallet={this.state.wallets[this.state.selectedWallet]} setOpenModal={() => this.setState({modal: ""})} hostModal={() => this.setState({modal: ""})} /> }
      {this.state.modal === "newWallet" && < MintingModule root={this.props.root} moduleRoot={this} showModal={() => this.setState({modal: ""})} /> }
        {this.state.wallets.length === 0 ? this.walletsEmpty() : (
          <MWalletMain wallet={this.state.wallets[this.state.selectedWallet]} root={this.props.root} moduleRoot={this} />
        )}
      </div>
    );
  }
  
}

export default SmartWalletContainer;
