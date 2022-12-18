import React from 'react';
import MWalletCreateTx from "./MWalletCreateTx"
import MWalletPendingTxs from './MWalletPendingTxs';
class MWalletMain extends React.Component {
    state = {

    }

     render() { 
        return (<div className='WalletMain'>
            {this.props.wallet.getName()}
            <br />
            {(this.props.wallet.getBalance()/1000000).toFixed(2)}tA

   
        <MWalletCreateTx root={this.props.root}></MWalletCreateTx>
        <div>pendingTxs: 
            {this.props.wallet.getPendingTxs().map( (pendingTx, index) => (
              <MWalletPendingTxs root={this.props.root} tx={pendingTx} index={index} key={index}></MWalletPendingTxs>
        ) )}
        </div>
        </div>
        );
        
    }
}
 
export default MWalletMain;