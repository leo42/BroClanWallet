import React from 'react';
import MWalletCreateTx from "./MWalletCreateTx"
import MWalletPendingTxs from './MWalletPendingTxs';
import MWalletDelegation
 from './MWalletDelegation';
class MWalletMain extends React.Component {
    state = {
        showing: "summary"
    }


    mainView() {
        switch ( this.state.showing){
            case "createTx":
                return  <MWalletCreateTx key={this.props.root.state.selectedWallet} wallet={this.props.wallet} root={this.props.root}  ></MWalletCreateTx>
            case "delegation":
                return  <MWalletDelegation key={this.props.root.state.selectedWallet+"delegation"} wallet={this.props.wallet} root={this.props.root}  ></MWalletDelegation>
            case "pendingTxs": 
                return(  this.props.wallet.getPendingTxs().map( (pendingTx, index) => (
                  <MWalletPendingTxs root={this.props.root} tx={pendingTx} index={index} key={index}></MWalletPendingTxs>
            ) ))
          

        }

    } 

     render() { 
        return (<div className='WalletMain'>
            {this.props.wallet.getName()}
            <br />


            {(this.props.wallet.getBalance()/1000000).toFixed(2)}tA
            <br/>

            <button type="submit" value="createTx" onClick={(event) => this.setState({showing: event.target.value })}>Create Transaction</button>
            <button type="submit" value="delegation" onClick={(event) => this.setState({showing: event.target.value })}> Delegation</button>
            <button type="pendingTxs" value="pendingTxs" onClick={(event) => this.setState({showing: event.target.value })}>Pending Txs</button>

        
        <br/>
        {this.mainView()}
        <br/>
        
     

        </div>
        );
        
    }
}
 
export default MWalletMain;