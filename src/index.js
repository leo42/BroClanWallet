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

class App extends React.Component {
  state= {
    wallets: [myWallet ],
    selectedWallet: 0
  }


  
  async createTx(amount,address,signers){
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createTx(amount,address,signers)
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

  async submit(tx){
    myWallet.submitTransaction(tx)
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