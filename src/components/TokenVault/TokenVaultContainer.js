
import React from 'react';
import WalletConnector from './walletConnector';
import wallet from "../../TokenWallet.js"
import "./TokenVaultContainer.css"
import MWalletList from './WalletList';
class TokenVaultsContainer extends React.Component {
    state= {
      connectedWallet: "none"
    }

    connectWallet(walletName){
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
    }

render() {  
    return(
      <div className="TokenVaultsContainer">
          <React.StrictMode>
          {this.state.connectedWallet !== "none" && <MWalletList wallet={this.state.connectedWallet} root={this.props.root} moduleRoot={this}  ></MWalletList> }
  
          <WalletConnector  moduleRoot={this}   key={this.state.connectedWallet}></WalletConnector>
          <div className='WalletInner'>
            TokenVault placeholder
            {/* <MWalletList root={this.props.root} moduleRoot={this}  ></MWalletList> */}
          </div>
          </React.StrictMode>
      </div>
    )  
  }
  }

    export default TokenVaultsContainer;