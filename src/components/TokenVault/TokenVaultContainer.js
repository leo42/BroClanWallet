
import React from 'react';
import WalletConnector from './walletConnector';
import Wallet from "../../TokenWallet.js"
import "./TokenVaultContainer.css"
import MWalletList from './WalletList';
import WalletMain from './WalletMain';
import { Lucid } from 'lucid-cardano';

class TokenVaultsContainer extends React.Component {
    state= {
      connectedWallet: "none",
      wallet : "none"
    }

    async componentDidMount(){
      const connectedWallet = JSON.parse( localStorage.getItem("TokenVaultsConnectedWallet") )
      console.log(connectedWallet)
      if(connectedWallet){
        await  this.connectWallet(connectedWallet)
        const selectedWallet = JSON.parse( localStorage.getItem("TokenVaultsSelectedWallet") )
        if(selectedWallet){
          await this.selectWallet(selectedWallet )
        }
      }
      setInterval(() => {
        this.reloadUtXOs()
      }
      , 15000);
    }

    async selectWallet(token){
      console.log("selecting wallet")
      const wallet = new Wallet(token, this.state.connectedWallet.api)    
      await wallet.initialize(this.props.root.state.settings)
      localStorage.setItem("TokenVaultsSelectedWallet", JSON.stringify(token))
      this.setState({wallet: wallet})
      
     }

   async connectWallet(walletName){
    try{
      console.log(window.cardano)
      const connection =  await window.cardano[walletName].enable();
      const lucid = await Lucid.new( );
      lucid.selectWallet(connection)
      localStorage.setItem("TokenVaultsConnectedWallet", JSON.stringify(walletName))
      this.setState({connectedWallet: { name: walletName, api : connection , lucid : lucid}})
    }catch(e){
      console.log(e)
    }
    }

    disconnectWallet(){
      this.setState({connectedWallet: "none"})
      this.setState({wallet: "none"})
      localStorage.removeItem("TokenVaultsConnectedWallet")
      localStorage.removeItem("TokenVaultsSelectedWallet")
    }

    async createTx(recipients,signers,sendFrom, sendAll=null){
      try{
       const tx = await this.state.wallet.createTx(recipients,signers,sendFrom,sendAll)
        const signature = await this.state.connectedWallet.api.signTx(tx.toString(), true)
        const signedTx = await tx.assemble([signature]).complete()
        const txHash = await this.state.connectedWallet.api.submitTx(signedTx.toString())
        console.log(txHash)
      }catch(e){
        console.log(e)
        console.log(e.message)
      }
    }

    async createDelegationTx(poolId){
      try{
        const tx = await this.state.wallet.createDelegationTx(poolId)
        console.log(tx)

        const signature = await this.state.connectedWallet.api.signTx(tx.toString(), true)
        const signedTx = await tx.assemble([signature]).complete()
        const txHash = await this.state.connectedWallet.api.submitTx(signedTx.toString())
        console.log(txHash)
      }catch(e){
        console.log(e)
        console.log(e.message)
      }
      
    }

    reloadUtXOs(){
      const wallet = this.state.wallet
      wallet.loadUtxos()
      this.setState({wallet: wallet})
    }

render() {  
    return(
      <div className={ this.state.wallet !== "none" ? "TokenVaultsContainer TokenVaultsContainerActive" :  "TokenVaultsContainer"} >
          <React.StrictMode>
          {this.state.connectedWallet !== "none" && <MWalletList wallet={this.state.connectedWallet} root={this.props.root} moduleRoot={this}  ></MWalletList> }
  
          <WalletConnector  moduleRoot={this}   key={this.state.connectedWallet}></WalletConnector>
          <div className='WalletInner'>

          {this.state.wallet !== "none" && <WalletMain key={this.state.wallet} wallet={this.state.wallet} root={this.props.root} moduleRoot={this}  ></WalletMain>}
          </div>
          </React.StrictMode>
      </div>
    )  
  }
  }

    export default TokenVaultsContainer;