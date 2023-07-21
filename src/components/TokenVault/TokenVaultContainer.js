
import React from 'react';
import WalletConnector from './walletConnector';
import Wallet from "../../TokenWallet.js"
import "./TokenVaultContainer.css"
import MWalletList from './WalletList';
import WalletMain from './WalletMain';
class TokenVaultsContainer extends React.Component {
    state= {
      connectedWallet: "none",
      wallet : "none"
    }
    selectWallet(token){
      const wallet = new Wallet(token,"testing")    
      wallet.initialize(this.props.root.state.settings)
      this.setState({wallet: wallet})
     }

    connectWallet(walletName){
      this.setState({connectedWallet: "none"})
      const connection = window.cardano[walletName].enable();
      connection.then("ready", () => {
        console.log("Wallet connected");

        // Do something with the wallet
        // connection.wallet.getBalance().then((balance) => {
        //   console.log("Balance:", balance);
        // });
      });
        this.setState({connectedWallet: walletName})
    }

    disconnectWallet(){
      this.setState({connectedWallet: "none"})
      this.setState({wallet: "none"})
    }

render() {  
    return(
      <div className={ this.state.wallet !== "none" ? "TokenVaultsContainer TokenVaultsContainerActive" :  "TokenVaultsContainer"} >
          <React.StrictMode>
          {this.state.connectedWallet !== "none" && <MWalletList wallet={this.state.connectedWallet} root={this.props.root} moduleRoot={this}  ></MWalletList> }
  
          <WalletConnector  moduleRoot={this}   key={this.state.connectedWallet}></WalletConnector>
          <div className='WalletInner'>

          {this.state.wallet !== "none" && <WalletMain wallet={this.state.wallet} root={this.props.root} moduleRoot={this}  ></WalletMain>}
          </div>
          </React.StrictMode>
      </div>
    )  
  }
  }

    export default TokenVaultsContainer;