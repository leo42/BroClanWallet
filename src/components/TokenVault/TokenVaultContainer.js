
import React from 'react';
import "./TokenVaultContainer.css"
class TokenVaultsContainer extends React.Component {
    state= {}



render() {  
    return(
      <div className="TokenVaultsContainer">
          <React.StrictMode>
  
          {/* <WalletConnector  moduleRoot={this} root={this.props.root}  key={this.state.connectedWallet}></WalletConnector> */}
  
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