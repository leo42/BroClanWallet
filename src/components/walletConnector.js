import React from "react";
import "./walletConnector.css";
import WalletPicker from "./WalletPicker";
import { ReactComponent as SettingsIcon } from '../html/assets/settings.svg';
import { ReactComponent as ConnectIcon } from '../html/assets/connect.svg';
import { ReactComponent as DisconnectIcon } from '../html/assets/disconnect.svg';
import { ReactComponent as ChangeIcon } from '../html/assets/change.svg';
import { ReactComponent as LoadIcon } from '../html/assets/load.svg';
import { ReactComponent as WalletsFoundIcon } from '../html/assets/walletsFound.svg';
import { useEffect } from "react/cjs/react.production.min";



function WalletConnector(props){
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);
    const [configMenu, openConfigMenu] = React.useState(false);
    const [hovering, setHovering] = React.useState("");


    function connectWallet(walletName){
        props.root.connectWallet(walletName)
        
    }

    function loadWallets(){
        props.root.loadWallets()
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
        { props.root.state.pendingWallets && Object.keys(props.root.state.pendingWallets).length > 0  && 
                <div  onMouseEnter={() => setHovering("walletsFound")} onMouseLeave={() => setHovering("") } onClick={() => props.root.showModal("pendingWallets")}  className='iconWraper walletsFoundIcon'>
                    <WalletsFoundIcon className="icon"  alt="connectIcon" />
                    <label className='walletsFoundAmountLabel'>{Object.keys(props.root.state.pendingWallets).length}</label>
                    {/* {  hovering === "walletsFound" &&   <label className='iconLabel'>Wallets Found</label> } */}
                < br/>   
                </div>
        }
        <br/>

        </div>  

    let  content = <div> {walletPickerOpen ? <WalletPicker setOpenModal={setWalletPickerOpen} operation={connectWallet} tx={props.tx}/> : "" }
                {/* <div className="WalletConnector"> */}
                <div onMouseEnter={() => setHovering("settings")} onMouseLeave={() => setHovering("")} onClick={() => props.root.showModal("settings")} className='iconWraper settingsButton'>
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
             {  hovering === "connect" &&   <label className='iconLabel'>Connect</label> }
            < br/>   
          </div>

                {content}
            </div>)
    }else{   
        return (<div className="WalletConnector">
            { (props.root.state.connectedWallet.name==="nami") ? <img onClick={() => openConfigMenu(!configMenu)} className="connectedWalletImg" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0ODYuMTcgNDk5Ljg2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzM0OWVhMzt9PC9zdHlsZT48L2RlZnM+PGcgaWQ9IkxheWVyXzIiIGRhdGEtbmFtZT0iTGF5ZXIgMiI+PGcgaWQ9IkxheWVyXzEtMiIgZGF0YS1uYW1lPSJMYXllciAxIj48cGF0aCBpZD0icGF0aDE2IiBjbGFzcz0iY2xzLTEiIGQ9Ik03My44Nyw1Mi4xNSw2Mi4xMSw0MC4wN0EyMy45MywyMy45MywwLDAsMSw0MS45LDYxLjg3TDU0LDczLjA5LDQ4Ni4xNyw0NzZaTTEwMi40LDE2OC45M1Y0MDkuNDdhMjMuNzYsMjMuNzYsMCwwLDEsMzIuMTMtMi4xNFYyNDUuOTRMMzk1LDQ5OS44Nmg0NC44N1ptMzAzLjM2LTU1LjU4YTIzLjg0LDIzLjg0LDAsMCwxLTE2LjY0LTYuNjh2MTYyLjhMMTMzLjQ2LDE1LjU3SDg0TDQyMS4yOCwzNDUuNzlWMTA3LjZBMjMuNzIsMjMuNzIsMCwwLDEsNDA1Ljc2LDExMy4zNVoiLz48cGF0aCBpZD0icGF0aDE4IiBjbGFzcz0iY2xzLTEiIGQ9Ik0zOC4yNywwQTM4LjI1LDM4LjI1LDAsMSwwLDc2LjQ5LDM4LjI3djBBMzguMjgsMzguMjgsMCwwLDAsMzguMjcsMFpNNDEuOSw2MS44YTIyLDIyLDAsMCwxLTMuNjMuMjhBMjMuOTQsMjMuOTQsMCwxLDEsNjIuMTgsMzguMTNWNDBBMjMuOTQsMjMuOTQsMCwwLDEsNDEuOSw2MS44WiIvPjxwYXRoIGlkPSJwYXRoMjAiIGNsYXNzPSJjbHMtMSIgZD0iTTQwNS43Niw1MS4yYTM4LjI0LDM4LjI0LDAsMCwwLDAsNzYuNDYsMzcuNTcsMzcuNTcsMCwwLDAsMTUuNTItMy4zQTM4LjIyLDM4LjIyLDAsMCwwLDQwNS43Niw1MS4yWm0xNS41Miw1Ni40YTIzLjkxLDIzLjkxLDAsMSwxLDguMzktMTguMThBMjMuOTEsMjMuOTEsMCwwLDEsNDIxLjI4LDEwNy42WiIvPjxwYXRoIGlkPSJwYXRoMjIiIGNsYXNzPSJjbHMtMSIgZD0iTTEzNC41OCwzOTAuODFBMzguMjUsMzguMjUsMCwxLDAsMTU3LjkyLDQyNmEzOC4yNCwzOC4yNCwwLDAsMC0yMy4zNC0zNS4yMlptLTE1LDU5LjEzQTIzLjkxLDIzLjkxLDAsMSwxLDE0My41NCw0MjZhMjMuOSwyMy45LDAsMCwxLTIzLjk0LDIzLjkxWiIvPjwvZz48L2c+PC9zdmc+" /> 
             : <img onClick={() => openConfigMenu(!configMenu)} className="connectedWalletImg" src={window.cardano[props.root.state.connectedWallet.name].icon.replace(/\s/g, ';')} />}   
            
            {configMenu ? connectorSettings() : ""}

            {content}
        </div>)
    }

}

export default WalletConnector