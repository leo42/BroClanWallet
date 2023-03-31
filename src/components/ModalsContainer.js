import React, { useState , useRef, useEffect } from 'react';
import NewWalletModal   from './NewWalletModal';
import SettingsModal from "./SettingsModal";
import WalletImportModal from "./WalletImportModal";
import AddWalletModal from "./AddWalletModal";

function ModalsContainer(props){
    return (
    <div className="modalsContainer"> 
        { props.modal === "settings" ? <SettingsModal setOpenModal={() => props.root.showModal()} root={props.root} /> : "" }
        { props.modal === "pendingWallets"  && Object.keys(props.root.state.pendingWallets).length > 0   ? <WalletImportModal setOpenModal={() => props.root.showModal()} root={props.root} /> : "" }
        { props.modal === "newWallet" && <NewWalletModal setOpenModal={() => props.root.showModal()} root={props.root} />}
        {props.modal === "createWallet" && <AddWalletModal hostModal={() => props.root.showModal()} setOpenModal={() => props.root.showModal()} root={props.root} />}

    </div>
    )
}

 export default ModalsContainer;