import { Lucid } from 'lucid-cardano';
import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Wallet from './Wallet';
import MWalletList from "./components/MWalletList";
import MWalletMain from './components/MWalletMain';

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
    wallets: [myWallet,myWallet2 , myWallet3],
    selectedWallet: 0
  }


  
  async createTx(amount,address,signers){
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createTx(amount,address,signers)
    this.setState({wallets})
  }


  async createDelegationTx(pool,signers){
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createDelegationTx(pool,signers)
    this.setState({wallets})
  }


  addSignature(signature){ 
    const wallets = this.state.wallets
    wallets[this.state.selectedWallet].addSignature(signature)
    this.setState({wallets})
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
    console.log("Click")
    this.setState( { selectedWallet})
  }

  async submit(index){
    const wallets = this.state.wallets
    wallets[this.state.selectedWallet].submitTransaction(index)
    this.setState({wallets})
  }

  render() {
    return (
      <div className='App'>
        <h1>MWallet</h1>
        <React.StrictMode>

        <div className='WalletInner'>
            <MWalletList root={this}  ></MWalletList>
            <MWalletMain root={this} wallet={this.state.wallets[this.state.selectedWallet]}></MWalletMain>
        </div>
        </React.StrictMode>

      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));