import { Lucid } from 'lucid-cardano';
import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Wallet from './Wallet';
import MWalletList from "./components/MWalletList";

const script1 = `{
  "ScriptAll": {
    "native_scripts": [
      {
        "ScriptPubkey": {
          "addr_keyhash": "487b9485cf18d99e875e7aef9b80c4d3a89cccddefbc2641c87da293"
        }
      },
      {
        "ScriptPubkey": {
          "addr_keyhash": "7190ae1c26a87ed572e8d72049454ddc874d360293c1eb43aef490e3"
        }
      }
    ]
  }
}`

const myWallet = new Wallet(script1);
await myWallet.initialize();
let tx 
class App extends React.Component {
  state= {
    wallets: [myWallet]
  }


  async renderUtxos(){
    
    console.log( myWallet.getAddress())
    myWallet.getUtxos()
    
  }
  
  async createTx(){
    myWallet.createTx(500000000000,"addr_test1qpy8h9y9euvdn858teawlxuqcnf638xvmhhmcfjpep769y60t75myaxudjacwd6q6knggt2lwesvc7x4jw4dr8nmmcdsfq4ccf")
  }

  async addSignature(){
    console.log(window.cardano)
    const api = await window.cardano.lace.enable()
    const wallets = this.state.wallets
    let signature = await api.signTx(wallets[0].tx.toString(),true)
    wallets[0].addSignature(signature)
    this.setState({wallets})
  }

  async addWallet(){
    const wallets = this.state.wallets
    const myWallet = new Wallet(script1);
    await myWallet.initialize();
    wallets.push(myWallet)
    this.setState(wallets)
  }

  async submit(){
    myWallet.submitTransaction()
  }

  render() {
    return (
      <div className='App'>
        <button onClick={this.renderUtxos}>render</button>
        <button onClick={this.createTx}>Create Tx</button>
        <button onClick={ () => this.addSignature()}>Add Signiture</button>
        
        <button onClick={ () => this.addWallet()}>Add Wallet</button>
        
        <button onClick={this.submit}>Submit</button>

        <h1>MWallet</h1>
        <MWalletList wallets={this.state.wallets}></MWalletList>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));