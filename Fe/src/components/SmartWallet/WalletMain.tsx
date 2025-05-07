import React from 'react';
import WalletCreateTx from "../WalletCreateTx";
import WalletDelegation from '../WalletDelegation';
import WalletOverview from '../Overview';
import TransactionHistory from '../TransactionHistory';
import Receive from '../Receive';
import PendingTxs from '../PendingTxs';
import './WalletMain.css';
import SmartWalletContainer from './SmartWalletContainer';
import { App } from '../../index';
import MultisigContainer from '../Multisig/MultisigContainer';
import WalletInterface from '../../core/WalletInterface';



interface WalletMainProps {
  wallet: WalletInterface;
  root: App;
  moduleRoot: SmartWalletContainer | MultisigContainer;
}


interface WalletMainState {
  showing: string;
}

class WalletMain extends React.Component<WalletMainProps, WalletMainState> {
  state: WalletMainState = {
    showing: "overview"
  }

  mainView() {
    const { wallet, root, moduleRoot } = this.props;
    const key = moduleRoot.state.selectedWallet;

    switch (this.state.showing) {
      case "overview":
        return <WalletOverview key={key} wallet={wallet} moduleRoot={moduleRoot} />;
      case "createTx":
        return <WalletCreateTx key={key} wallet={wallet} root={root} moduleRoot={moduleRoot} />;
      case "delegation":
        return <WalletDelegation key={`${key}delegation`} wallet={wallet} root={root} moduleRoot={moduleRoot} />;
      case "pendingTxs":
        return <PendingTxs key={`${key}pendingTxs`} wallet={wallet} root={root} moduleRoot={moduleRoot} />;
      case "transactions":
        return  <TransactionHistory root={this.props.root}  wallet={this.props.wallet}  moduleRoot={this.props.moduleRoot} key={this.props.moduleRoot.state.selectedWallet} /> 
    case "receive":
        return <Receive wallet={wallet} key={key}  />;
    }
  }

  setShowing(showing: string) {
    this.setState({ showing });
  }

  render() {
    const { wallet, root } = this.props;
    const pendingTxsCount = wallet.getPendingTxs().length;

    return (
      <div className='WalletMain'>
        {wallet.getName()}
        <br />
        {(wallet.getBalance() / 1000000).toFixed(2)}{root.state.settings.network === "Mainnet" ? "₳" : "t₳"}
        <br />
        <button className={`mainTab` + ( this.state.showing === "overview" ? " mainTabSelected" : " " )} value="overview"  onClick={() => this.setShowing("overview")}>Overview</button>
            <button className={`mainTab` + ( this.state.showing === "createTx" ? " mainTabSelected" : " " )}  value="createTx" onClick={() => this.setShowing("createTx")}>Create Tx</button>
            <button className={`mainTab` + ( this.state.showing === "pendingTxs" ? " mainTabSelected" : " " ) + (this.props.wallet.getPendingTxs().length > 0 ? " mainTabPendingTx" : "")} onClick={(event) => this.setShowing("pendingTxs")}> Pending Txs {this.props.wallet.getPendingTxs().length> 0 && <label className='pendingTxNumber'> {this.props.wallet.getPendingTxs().length}</label>  }</button>         
            <button className={`mainTab` + ( this.state.showing === "delegation" ? " mainTabSelected" : " " )}  value="delegation" onClick={() => this.setShowing("delegation")}>Staking Center</button>
            <button className={`mainTab` + ( this.state.showing === "transactions" ? " mainTabSelected" : " " )}  value="transactions" onClick={() => this.setShowing("transactions")}>Tx History</button>
            <button className={`mainTab` + ( this.state.showing === "receive" ? " mainTabSelected" : " " )}  value="receive" onClick={() => this.setShowing("receive")}>Receive</button>


        <br />
        {this.mainView()}
        <br />
      </div>
    );
  }
}

export default WalletMain;