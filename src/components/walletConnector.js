import React from "react";
import "./walletConnector.css"
import WalletPicker from "./WalletPicker"
import SettingsModal from "./SettingsModal"
import WalletImportModal from "./WalletImportModal"
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
        { <button onClick={() => props.root.disconnectWallet()}> disconnect</button> }
        <button onClick={() => setWalletPickerOpen(true)}>Change Wallet</button>
        <button onClick={() => loadWallets()}>Load Wallets</button>
        <br/>

        </div>

    let  content = <div> {walletPickerOpen ? <WalletPicker setOpenModal={setWalletPickerOpen} operation={connectWallet} tx={props.tx}/> : "" }
                { settingsModalOpen ? <SettingsModal setOpenModal={setSettingsModalOpen} key={props.root.state.settings.api} root={props.root}  tx={props.tx}/> : "" }
                { walletImportModalOpen ? <WalletImportModal setOpenModal={setWalletImportModalOpen} key={props.root.state.settings.api} root={props.root} /> : "" }
                <button onClick={() => setSettingsModalOpen(true)}>Settings </button>  
        </div>
    if(props.root.state.connectedWallet.socket === null) {
        return (<div className="WalletConnector"><button data-tooltip-id="my-tooltip"  data-tooltip-content="Connect your local wallet to enable Syncing of Transactions, Signitures and Wallets" onClick={() => setWalletPickerOpen(true)}>Connect Wallet </button>
                {content}
            </div>)
    }else{   
        return (<div className="WalletConnector">
            <button onClick={() => openConfigMenu(!configMenu)}>{props.root.state.connectedWallet.name}</button>

            {configMenu ? connectorSettings() : ""}

            {content}
        </div>)
    }

}

export default WalletConnector