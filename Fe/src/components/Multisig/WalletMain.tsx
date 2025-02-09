import React from 'react';
import WalletCreateTx from "../WalletCreateTx"
import WalletDelegation from '../WalletDelegation';
import WalletOverview from '../Overview'
import TransactionHistory from '../TransactionHistory';
import Receive from '../Receive';
import PendingTxs from '../PendingTxs';
import './WalletMain.css';
import WalletInterface from '../../core/WalletInterface';
import { App } from '../..';
import MultisigContainer from './MultisigContainer';

class WalletMain extends React.Component<{wallet: WalletInterface, root: App, moduleRoot: MultisigContainer}> {
    state = {
        showing: "overview"
    }



    mainView() {
        switch ( this.state.showing){
            case "overview":
                return  <WalletOverview key={this.props.moduleRoot.state.selectedWallet} wallet={this.props.wallet} moduleRoot={this.props.moduleRoot} ></WalletOverview>
            case "createTx":
                return  <WalletCreateTx key={this.props.moduleRoot.state.selectedWallet} wallet={this.props.wallet} root={this.props.root}  moduleRoot={this.props.moduleRoot}></WalletCreateTx>
            case "delegation":
                return  <WalletDelegation key={this.props.moduleRoot.state.selectedWallet+"delegation"} wallet={this.props.wallet} root={this.props.root} moduleRoot={this.props.moduleRoot} ></WalletDelegation>
            case "pendingTxs": 
                return( <PendingTxs key={this.props.moduleRoot.state.selectedWallet+"pendingTxs"} wallet={this.props.wallet} root={this.props.root}  moduleRoot={this.props.moduleRoot}></PendingTxs>)
            case "transactions": 
                return  <TransactionHistory root={this.props.root}  wallet={this.props.wallet}  moduleRoot={this.props.moduleRoot} key={this.props.moduleRoot.state.selectedWallet}  ></TransactionHistory> 
            case "receive": 
                return  <Receive wallet={this.props.wallet} key={this.props.moduleRoot.state.selectedWallet} />
        }
    } 
    setShowing(showing: string){
        const state = this.state
        state.showing = showing
        this.setState(state)
    }


     render() { 


        return (<div className='WalletMain'>
            {this.props.wallet.getName()}
            <br />
            

            {(this.props.wallet.getBalance()/1000000).toFixed(2)}{this.props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  }  
            <br/>
            <button className={`mainTab` + ( this.state.showing === "overview" ? " mainTabSelected" : " " )} value="overview"  onClick={() => this.setShowing("overview")}>Overview</button>
            <button className={`mainTab` + ( this.state.showing === "createTx" ? " mainTabSelected" : " " )}  value="createTx" onClick={() => this.setShowing("createTx")}>Create Tx</button>
            <button className={`mainTab` + ( this.state.showing === "pendingTxs" ? " mainTabSelected" : " " ) + (this.props.wallet.getPendingTxs().length > 0 ? " mainTabPendingTx" : "")} onClick={(event) => this.setShowing("pendingTxs")}> Pending Txs {this.props.wallet.getPendingTxs().length> 0 && <label className='pendingTxNumber'> {this.props.wallet.getPendingTxs().length}</label>  }</button>         
            <button className={`mainTab` + ( this.state.showing === "delegation" ? " mainTabSelected" : " " )}  value="delegation" onClick={() => this.setShowing("delegation")}>Staking Center</button>
            <button className={`mainTab` + ( this.state.showing === "transactions" ? " mainTabSelected" : " " )}  value="transactions" onClick={() => this.setShowing("transactions")}>Tx History</button>
            <button className={`mainTab` + ( this.state.showing === "receive" ? " mainTabSelected" : " " )}  value="receive" onClick={() => this.setShowing("receive")}>Receive</button>



        
        <br/>
        {this.mainView()}
        <br/>
        
     

        </div>
        );
        
    }
}
 
export default WalletMain;