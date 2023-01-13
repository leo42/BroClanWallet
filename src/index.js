import { Lucid } from 'lucid-cardano';
import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Wallet from './Wallet';
import MWalletList from "./components/WalletList";
import MWalletMain from './components/WalletMain';
import { ToastContainer, toast } from 'react-toastify';
import './components/ReactToastify.css';
import WalletConnector from './components/walletConnector';
const script1 = {
  "type": "all",
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

console.log(JSON.stringify(script1))
const myWallet = new Wallet(script1,"Leos Wallet");
await myWallet.initialize();

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



console.log(JSON.stringify(script2))
const myWallet2 = new Wallet(script2,"Leos2 Wallet");
await myWallet2.initialize();


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

console.log(JSON.stringify(script3))
const myWallet3 = new Wallet(script3,"Leos 2 out of 3");
await myWallet3.initialize();

//myWallet.addSignature("a1008182582024a97c7d033acb4292cacac9e6de546b9a02e1492d7f76226c8e5ed5be5aa13358408b2318f6834a057e383738614e37cfefb630d7fb7f56a97163bc54b39d26a4aa7a2934a55535fd40995cce1adce976f3d2e7deb06fbcb5abaff19a306bf39f00")


class App extends React.Component {
  state= {
    wallets: [],
    selectedWallet: 0,
    connectedWallet: ""
  }

  async setState(state){
    console.log(this.state)
    await super.setState(state)
    this.storeState()
  }

  componentDidMount() {
    this.loadState()
  }

  connectWallet(wallet){
    let connectedWallet = wallet
    this.setState({connectedWallet})

  }

  disconnectWallet(){
    let connectedWallet = ""
    console.log("Leooooooo")
    this.setState({connectedWallet})

  }

  storeState(){
    const dataPack = this.state.wallets.map( (wallet,index)=> ({json: wallet.getJson(),
                                                                name :wallet.getName(),
                                                               defaultAddress: wallet.getDefaultAddress(),
                                                               addressNames: wallet.getAddressNames()}) )
   
    localStorage.setItem("connectedWallet", JSON.stringify(this.state.connectedWallet ))
    localStorage.setItem("wallets", JSON.stringify(dataPack))
  }

  async loadState(){
    const wallets = JSON.parse(localStorage.getItem('wallets'));
    let state = this.state
    for(let index = 0 ; index < wallets.length ; index++){
      console.log
      const myWallet = new Wallet(wallets[index].json,wallets[index].name);
      await myWallet.initialize()
      myWallet.setDefaultAddress(wallets[index].defaultAddress)
      myWallet.setAddressNamess(wallets[index].addressNames)
        state.wallets.push(myWallet)

    }
    state.connectedWallet = JSON.parse(localStorage.getItem('connectedWallet')) === null ? "" : JSON.parse(localStorage.getItem('connectedWallet'));
    super.setState(state)  
  }


  

  
  async createTx(recipients,signers,sendFrom){
    try{
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createTx(recipients,signers,sendFrom)
    
    this.setState({wallets})
    toast.info('Transaction created');
    }catch(e){
      toast.error(e.message);
    }
  }


  async createDelegationTx(pool,signers){
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createDelegationTx(pool,signers)
    this.setState({wallets})
  }


  addSignature(signature){ 
    try {
    const wallets = this.state.wallets
    wallets[this.state.selectedWallet].addSignature(signature)
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
      toast.info('Default Send Address Updated');
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

  async addWallet(script,name){
    const wallets = this.state.wallets
    const myWallet = new Wallet(script,name);
    await myWallet.initialize();
    wallets.push(myWallet)
    this.setState(wallets)
  }

  selectWallet(key){
    const selectedWallet = key
    console.log(key)
    this.setState( { selectedWallet})
  }

  async submit(index){
    const wallets = this.state.wallets
    const promice = wallets[this.state.selectedWallet].submitTransaction(index)
    this.setState({wallets})
    toast.promise(
      promice,
      {
        pending: 'Submiting Transaction',
        success: 'Transaction Submited',
        error: 'Failed Submiting Transaction'
      }
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
        <h1>MWallet</h1>
        <React.StrictMode>

        <div className='WalletInner'>
            <WalletConnector root={this} key={this.state.connectedWallet}></WalletConnector>
            <MWalletList root={this}  ></MWalletList>
          { this.state.wallets.length ===0 ? "" : <MWalletMain root={this} wallet={this.state.wallets[this.state.selectedWallet]}></MWalletMain> }
        </div>
        </React.StrictMode>

      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));