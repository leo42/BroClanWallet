import React, { useState , useRef, useEffect } from 'react';
import NewWalletModal   from './NewWalletModal';
import WalletImportModal from "./WalletImportModal";
import AddWalletModal from "./AddWalletModal";

function ModalsContainer(props){
    return (
    <div className="modalsContainer"> 
        { props.modal === "pendingWallets"  && Object.keys(props.root.state.pendingWallets).length > 0   ? <WalletImportModal setOpenModal={() => props.modalRoot.showModal()} root={props.root} /> : "" }
        { props.modal === "newWallet" && <NewWalletModal setOpenModal={() => props.modalRoot.showModal()} root={props.root} modalRoot={props.modalRoot}/>}
        { props.modal === "createWallet" && <AddWalletModal hostModal={() => props.modalRoot.showModal()} setOpenModal={() => props.modalRoot.showModal()} root={props.root} modalRoot={props.modalRoot} />}
    </div>
    )
}

 export default ModalsContainer;