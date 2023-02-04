import React from "react";
import "./walletConnector.css"
import WalletPicker from "./WalletPicker"
import SettingsModal from "./SettingsModal"
import io from 'socket.io-client'
import {  Lucid } from "../lucid/src/mod.ts";

function stringToHex(str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
      hex += '' + str.charCodeAt(i).toString(16);
    }
    return hex;
  }

function WalletConnector(props){
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);
    const [configMenu, openConfigMenu] = React.useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);

    async function  connectWallet(wallet){
        const api = await window.cardano[wallet].enable()
        console.log(api)
        const lucid = await Lucid.new(
          );
          lucid.selectWallet(api);

        const socket = io(window.location.origin);

        socket.on('disconnect', () => {
            console.log("disconnected")
            props.root.connectWallet( {socket: null, name: ""})
        });

        socket.on("authentication_challenge", (data) => {
            console.log("authentication_challenge")
            console.log()
            const signed = lucid.wallet.signMessage( "addr_test1qpceptsuy658a4tjartjqj29fhwgwnfkq2fur66r4m6fpc73h7m9jt9q7mt0k3heg2c6sckzqy2pvjtrzt3wts5nnw2q9z6p9m",stringToHex(data.challenge) );
            signed.then((signature) => {
                socket.emit("authentication_response", {signature: signature})   
            }).catch((error) => {
                console.log(error)
            })

    });

        socket.emit("authentication_start", {token: "RandomToken"});
        
        if(api.status !== false){
                props.root.connectWallet({name: wallet, socket: socket})
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
    if(props.root.state.connectedWallet.socket === null) {
        return (<div className="WalletConnector"><button onClick={() => setWalletPickerOpen(true)}>Connect Wallet </button>
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