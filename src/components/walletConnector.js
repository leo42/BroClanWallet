import React from "react";
import "./walletConnector.css"
import WalletPicker from "./WalletPicker"
import SettingsModal from "./SettingsModal"


function WalletConnector(props){
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);
    const [configMenu, openConfigMenu] = React.useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);

    async function  connectWallet(wallet){
        const api = await window.cardano[wallet].enable()
        console.log(api)
        if(api.status !== false){
                props.root.connectWallet(wallet)
        }
    }  
    
    const connectorSettings = () =>
        <div className="connectorSettings">
        { <button onClick={() => props.root.disconnectWallet()}> disconnect</button> }
        <br/>

        </div>

    let  content = <div> {walletPickerOpen ? <WalletPicker setOpenModal={setWalletPickerOpen} operation={connectWallet} tx={props.tx}/> : "" }
                { settingsModalOpen ? <SettingsModal setOpenModal={setSettingsModalOpen} key={props.root.state.settings.api} root={props.root} operation={connectWallet} tx={props.tx}/> : "" }
                <button onClick={() => setSettingsModalOpen(true)}>Settings </button>  
        </div>
    if(props.root.state.connectedWallet === "") {
        return (<div className="WalletConnector"><button onClick={() => setWalletPickerOpen(true)}>Connect Wallet </button>
                {content}
            </div>)
    }else{   
        return (<div className="WalletConnector">
            <button onClick={() => openConfigMenu(!configMenu)}>{props.root.state.connectedWallet}</button>

            {configMenu ? connectorSettings() : ""}

            {content}
        </div>)
    }

}

export default WalletConnector