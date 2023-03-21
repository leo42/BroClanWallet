import React from "react";
import "./walletConnector.css";
import WalletPicker from "./WalletPicker";
import SettingsModal from "./SettingsModal";
import WalletImportModal from "./WalletImportModal";
import { ReactComponent as SettingsIcon } from '../html/assets/settings.svg';
import { ReactComponent as ConnectIcon } from '../html/assets/connect.svg';
import { ReactComponent as DisconnectIcon } from '../html/assets/disconnect.svg';
import { ReactComponent as ChangeIcon } from '../html/assets/change.svg';
import { ReactComponent as LoadIcon } from '../html/assets/load.svg';



function WalletConnector(props){
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);
    const [configMenu, openConfigMenu] = React.useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);
    const [walletImportModalOpen, setWalletImportModalOpen] = React.useState(false);


    function connectWallet(walletName){
        props.root.connectWallet(walletName)
        
    }

    function loadWallets(){
        props.root.loadWallets()
    }
    
    
    const connectorSettings = () =>
        <div className="connectorSettings">
        {/* { <button onClick={() => props.root.disconnectWallet()}> disconnect</button> } */
        <div>
        <DisconnectIcon className="disconnectButton" onClick={() => props.root.disconnectWallet()} alt="disconnectIcon" />
        < br/>   
        </div>}
        {/* <button onClick={() => setWalletPickerOpen(true)}>Change Wallet</button> */}
        <div>
        <ChangeIcon className="changeButton" onClick={() => setWalletPickerOpen(true)} alt="changeIcon" />
        < br/>   
        </div>
        {/* <button onClick={() => loadWallets()}>Load Wallets</button> */}
        <div>
        <LoadIcon className="loadButton" onClick={() => loadWallets()} alt="loadIcon" />
        < br/>   
        </div>
        <br/>

        </div>  

    let  content = <div> {walletPickerOpen ? <WalletPicker setOpenModal={setWalletPickerOpen} operation={connectWallet} tx={props.tx}/> : "" }
                { settingsModalOpen ? <SettingsModal setOpenModal={setSettingsModalOpen} key={props.root.state.settings.api} root={props.root}  tx={props.tx}/> : "" }
                { walletImportModalOpen  && Object.keys(props.root.state.pendingWallets).length > 0   ? <WalletImportModal setOpenModal={setWalletImportModalOpen} key={props.root.state.settings.api} root={props.root} /> : "" }
                 <div>
                <SettingsIcon className="settingsButton" onClick={() => setSettingsModalOpen(true)} alt="settingsIcon" />
                < br/>  </div> 
        </div>
    if(props.root.state.connectedWallet.socket === null) {
        return (<div className="WalletConnector">
            <div>
             <ConnectIcon className="connectButton" data-tooltip-id="my-tooltip"  data-tooltip-content="Connect your local wallet to enable Syncing of Transactions, Signitures and Wallets" onClick={() => setWalletPickerOpen(true)} alt="connectIcon" />
            < br/>  </div> 
                {content}
            </div>)
    }else{   
        return (<div className="WalletConnector">
            <button onClick={() => openConfigMenu(!configMenu)}>{props.root.state.connectedWallet.name}</button>
            {props.root.state.pendingWallets && Object.keys(props.root.state.pendingWallets).length > 0  ? <button onClick={() => setWalletImportModalOpen(true)}>{Object.keys(props.root.state.pendingWallets).length} Wallets found</button> : ""}
            {configMenu ? connectorSettings() : ""}

            {content}
        </div>)
    }

}

export default WalletConnector