import React, { useState , useRef, useEffect } from 'react';
import NewWalletModal   from './NewWalletModal';
import WalletImportModal from "../WalletImportModal";
import AddWalletModal from "./AddWalletModal";
import MultisigContainer from './MultisigContainer';
import { App } from '../..';
function ModalsContainer(props: { modal: string, moduleRoot: MultisigContainer, root: App }){
    return (
    <div className="modalsContainer"> 

        { props.modal === "pendingWallets"  && Object.keys(props.moduleRoot.state.pendingWallets).length > 0   ? <WalletImportModal setOpenModal={() => props.moduleRoot.showModal("")}  moduleRoot={props.moduleRoot} /> : "" }
        { props.modal === "newWallet" && <NewWalletModal setOpenModal={() => props.moduleRoot.showModal("")}  moduleRoot={props.moduleRoot}/>}
        { props.modal === "createWallet" && <AddWalletModal hostModal={() => props.moduleRoot.showModal("")} setOpenModal={() => props.moduleRoot.showModal("newWallet")} root={props.root} moduleRoot={props.moduleRoot} />}

    </div>
    )
}

 export default ModalsContainer;