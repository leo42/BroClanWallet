import React from 'react';
import WalletCreateTx from "../WalletCreateTx"
import WalletDelegation from '../WalletDelegation';
import WalletOverview from '../Overview'
import TransactionHistory from '../TransactionHistory';
import Deposit from './Deposit';
import './WalletMain.css';

class WalletMain extends React.Component {
    state = {
        showing: "delegation"
    }



    mainView() {
        switch ( this.state.showing){
            case "overview":
                return  <WalletOverview key={this.props.moduleRoot.state.selectedWallet} wallet={this.props.wallet} root={this.props.root} moduleRoot={this.props.moduleRoot} ></WalletOverview>
            case "send":
                return  <WalletCreateTx key={this.props.moduleRoot.state.selectedWallet} wallet={this.props.wallet} root={this.props.root}  moduleRoot={this.props.moduleRoot}></WalletCreateTx>
            case "delegation":
                return  <WalletDelegation key={this.props.moduleRoot.state.selectedWallet+"delegation"} wallet={this.props.wallet} root={this.props.root} moduleRoot={this.props.moduleRoot} ></WalletDelegation>
            case "transactions": 
                return  <TransactionHistory root={this.props.root}  wallet={this.props.wallet}   key={this.props.moduleRoot.state.selectedWallet}>  moduleRoot={this.props.moduleRoot} </TransactionHistory> 
            case "receive": 
                return  <Deposit root={this.props.root}  wallet={this.props.wallet}  key={this.props.moduleRoot.state.selectedWallet} moduleRoot={this.props.moduleRoot}> </Deposit> 
        }
    } 

     render() { 

        return (<div className='WalletMain' key={this.props.wallet.getBalance()} >
            {this.props.wallet.getName()}
            <br />
            

            {(this.props.wallet.getBalance()/1000000).toFixed(2)}{this.props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  }  
            <br/>
            <button className={`mainTab` + ( this.state.showing === "overview" ? " mainTabSelected" : " " )} value="overview"  onClick={(event) => this.setState({showing: event.target.value })}>Overview</button>
            <button className={`mainTab` + ( this.state.showing === "send" ? " mainTabSelected" : " " )}  value="send" onClick={(event) => this.setState({showing: event.target.value })}>Send</button>
            <button className={`mainTab` + ( this.state.showing === "delegation" ? " mainTabSelected" : " " )}  value="delegation" onClick={(event) => this.setState({showing: event.target.value })}>Staking Center</button>
            <button className={`mainTab` + ( this.state.showing === "transactions" ? " mainTabSelected" : " " )}  value="transactions" onClick={(event) => this.setState({showing: event.target.value })}>Tx History</button>
            <button className={`mainTab` + ( this.state.showing === "receive" ? " mainTabSelected" : " " )}  value="receive" onClick={(event) => this.setState({showing: event.target.value })}>Deposit</button>       
        <br/>
        {this.mainView()}
        <br/>
        
     

        </div>
        );
        
    }
}
 
export default WalletMain;