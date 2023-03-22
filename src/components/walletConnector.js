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
import { useEffect } from "react/cjs/react.production.min";



function WalletConnector(props){
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);
    const [configMenu, openConfigMenu] = React.useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);
    const [walletImportModalOpen, setWalletImportModalOpen] = React.useState(false);
    const [hovering, setHovering] = React.useState("");


    function connectWallet(walletName){
        props.root.connectWallet(walletName)
        
    }

    function loadWallets(){
        props.root.loadWallets()
        setWalletImportModalOpen(true)
    }
    
 {/* <div  onMouseEnter={() => setHovering("delete")} onMouseLeave={() => setHovering("") } onClick={() => props.root.deleteWallet(props.root.state.selectedWallet)}  className='iconWraper deleteButton'>
             <DeleteIcon className="icon"  alt="deleteIcon" />
             {  hovering === "delete" &&  <label className='iconLabel'>Delete</label> }
            < br/>   
          </div> */}

    const connectorSettings = () =>
        <div className="connectorSettings">
        {/* { <button onClick={() => props.root.disconnectWallet()}> disconnect</button> } */
        <div onMouseEnter={() => setHovering("disconnect")} onMouseLeave={() => setHovering("") } onClick={() => props.root.disconnectWallet()} className='iconWraper disconnectButton'>
        <DisconnectIcon className="icon" alt="disconnectIcon" />
        {  hovering === "disconnect" &&  <label className='iconLabel'>Disconnect</label> }
        < br/>   
        </div>}
        {/* <button onClick={() => setWalletPickerOpen(true)}>Change Wallet</button> */}
        <div onMouseEnter={() => setHovering("change")} onMouseLeave={() => setHovering("") } onClick={() => setWalletPickerOpen(true)} className='iconWraper changeButton'>
        <ChangeIcon className="icon" alt="changeIcon" />
        {  hovering === "change" &&  <label className='iconLabel'>Change</label> }
        < br/>   
        </div>
        {/* <button onClick={() => loadWallets()}>Load Wallets</button> */}
        <div onMouseEnter={() => setHovering("load")} onMouseLeave={() => setHovering("") } onClick={() => loadWallets()} className='iconWraper loadButton'>
        <LoadIcon className="icon" alt="loadIcon" />
        {  hovering === "load" &&  <label className='iconLabel'>Load</label> }
        < br/>   
        </div>
        <br/>

        </div>  

    let  content = <div> {walletPickerOpen ? <WalletPicker setOpenModal={setWalletPickerOpen} operation={connectWallet} tx={props.tx}/> : "" }
                { settingsModalOpen ? <SettingsModal setOpenModal={setSettingsModalOpen} key={props.root.state.settings.api} root={props.root}  tx={props.tx}/> : "" }

                { walletImportModalOpen  && Object.keys(props.root.state.pendingWallets).length > 0   ? <WalletImportModal setOpenModal={setWalletImportModalOpen} key={props.root.state.settings.api} root={props.root} /> : "" }
                {/* <div className="WalletConnector"> */}
                <div onMouseEnter={() => setHovering("settings")} onMouseLeave={() => setHovering("")} onClick={() => setSettingsModalOpen(true)} className='iconWraper settingsButton'>
                <SettingsIcon className="icon" alt="settingsIcon" />
                {  hovering === "settings" &&  <label className='iconLabel'>Settings</label> }
                < br/>  </div>
                {/* </div>  */}

        </div>
        

    if(props.root.state.connectedWallet.socket === null) {
        return (<div className="WalletConnector">
            {/* <div>
             <ConnectIcon className="connectButton" data-tooltip-id="my-tooltip"  data-tooltip-content="Connect your local wallet to enable Syncing of Transactions, Signitures and Wallets" onClick={() => setWalletPickerOpen(true)} alt="connectIcon" />
            < br/>  </div>  */}
            <div  onMouseEnter={() => setHovering("connect")} onMouseLeave={() => setHovering("") } onClick={() => setWalletPickerOpen(true)}  className='iconWraper connectButton'>
             <ConnectIcon className="icon"  alt="connectIcon" />
             {  hovering === "connect" &&  <label className='iconLabel'>Connect</label> }
            < br/>   
          </div>

                {content}
            </div>)
    }else{   
        return (<div className="WalletConnector">
            <button onClick={() => openConfigMenu(!configMenu)}>{props.root.state.connectedWallet.name}</button>
            { props.root.state.pendingWallets && Object.keys(props.root.state.pendingWallets).length > 0  && <button onClick={() => setWalletImportModalOpen(true)}>{Object.keys(props.root.state.pendingWallets).length} Wallets found</button> }
            {configMenu ? connectorSettings() : ""}

            {content}
        </div>)
    }

}

export default WalletConnector