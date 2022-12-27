import React from 'react';
import MWalletCreateTx from "./MWalletCreateTx"
import MWalletPendingTxs from './MWalletPendingTxs';
import MWalletDelegation from './MWalletDelegation';
import MWalletOverview from './MWalletOverview'

class MWalletMain extends React.Component {
    state = {
        showing: "overview"
    }


    mainView() {
        switch ( this.state.showing){
            case "overview":
                return  <MWalletOverview key={this.props.root.state.selectedWallet} wallet={this.props.wallet} root={this.props.root}  ></MWalletOverview>
            case "createTx":
                return  <MWalletCreateTx key={this.props.root.state.selectedWallet} wallet={this.props.wallet} root={this.props.root}  ></MWalletCreateTx>
            case "delegation":
                return  <MWalletDelegation key={this.props.root.state.selectedWallet+"delegation"} wallet={this.props.wallet} root={this.props.root}  ></MWalletDelegation>
            case "pendingTxs": 
                return(  this.props.wallet.getPendingTxs().map( (pendingTx, index) => (
                  <MWalletPendingTxs root={this.props.root} tx={pendingTx} index={index} key={this.props.root.state.selectedWallet + index}></MWalletPendingTxs>
            ) ))
          

        }

    } 

     render() { 
        return (<div className='WalletMain'>
            {this.props.wallet.getName()}
            <br />


            {(this.props.wallet.getBalance()/1000000).toFixed(2)}tA
            <br/>
            <button value="overview" onClick={(event) => this.setState({showing: event.target.value })}>Overview</button>
            <button value="createTx" onClick={(event) => this.setState({showing: event.target.value })}>Create Transaction</button>
            <button value="delegation" onClick={(event) => this.setState({showing: event.target.value })}> Delegation</button>
            <button  value="pendingTxs" onClick={(event) => this.setState({showing: event.target.value })}>Pending Txs</button>

        
        <br/>
        {this.mainView()}
        <br/>
        
     

        </div>
        );
        
    }
}
 
export default MWalletMain;