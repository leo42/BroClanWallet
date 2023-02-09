import React from "react";
import "./walletConnector.css"
import WalletPicker from "./WalletPicker"
import SettingsModal from "./SettingsModal"
import io from 'socket.io-client'
import {  Lucid } from "../lucid/dist/esm/mod.js";
import { useEffect } from "react/cjs/react.production.min";



function WalletConnector(props){
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);
    const [configMenu, openConfigMenu] = React.useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);


    async function  connectWallet(wallet){
        const api = await window.cardano[wallet].enable()
        const lucid = await Lucid.new(
            );
            lucid.selectWallet(api);
            const address = await lucid.wallet.address();
            console.log(address)
        const socket = io(window.location.origin);
        

        socket.on('disconnect', () => {
            console.log("disconnected")
            props.root.connectWallet( {socket: null, name: ""})
            socket.close()
        });
        //a function to decode CBOR address to base 68

        socket.on("authentication_challenge", (data) => {
            console.log("authentication_challenge")
            console.log()
            
            const signed = lucid.wallet.signMessage( address,data.challenge );
            signed.then((signature) => {
                socket.emit("authentication_response", {address : address  ,signature: signature})   
            }).catch((error) => {
                console.log(error)
            })

              });
     socket.on("authentication_success", (data) => {
            console.log("authentication_success")
            localStorage.setItem("token_"+address, data.authenticationToken)
            console.log(data)
            });

        const token = localStorage.getItem("token_"+address) ? localStorage.getItem("settings") : null;
        socket.emit("authentication_start", {token: token});
        
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