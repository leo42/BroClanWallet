import React from "react";
import WalletPicker from "./WalletPicker"
import {  toast } from 'react-toastify';


function WalletPendingTx(props) {
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);
    const [importTransaction, setImportTransaction] = React.useState(false);
    const [importedTx, setImportedTx] = React.useState("");

    async function signWithLocalWallet(wallet){
        const api = await window.cardano[wallet].enable()
        const signature = await api.signTx(props.tx.tx.toString() ,true)
        props.root.addSignature(signature)
        
      }  
      
    function copySignature(signature){
        navigator.clipboard.writeText(signature)
        toast.info("Signature copied to clipboard")
    }

    function copyTransaction(){
        navigator.clipboard.writeText(props.tx.tx.toString())
        toast.info("Transaction copied to clipboard")
    }
    const txDetails = props.root.state.wallets[props.root.state.selectedWallet].getPendingTxDetails(props.index)

    function importSigniture(){
        try{
            props.root.addSignature(importedTx);
            toast.success("Transaction imported");
            setImportTransaction(false);
        }catch(error){
            toast.error( error.message);
        }
    }

    return (
        <div className="pedningTx">
            <svg onClick={copyTransaction} className="copyIcon" id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg>
             Fee:{txDetails.fee/1000000}<br/>


             {walletPickerOpen && <WalletPicker setOpenModal={setWalletPickerOpen} operation={signWithLocalWallet} tx={props.tx}/>}
            {txDetails.signatures.map( (item, index) => (
                <div key={index} className={"pendingTx_signer"+ (item.haveSig ? " pendingTx_signer_signed" : "")} >
                    { item.name}
                    { item.haveSig ? <span className="">Signed  <svg onClick={() => copySignature(props.wallet.getSignature(props.index,item.keyHash))} className="copyIcon" id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg> </span> : ""}
                </div>
            )

             )}
            
            <button onClick={() => setWalletPickerOpen(true)} >add signature</button>
        
            <button onClick={() => props.root.submit(props.index)} >Submit</button>
            
            <button onClick={()=> setImportTransaction(true)} >Import Signature</button>

            <button onClick={()=> props.root.removePendingTx(props.index)} >Remove</button>
            {importTransaction ? 
            <div>
                <input type="text" defaultValue={importedTx} onChange={(event)=> setImportedTx(event.target.value)} placeholder="Signature Data"></input>
                  <button onClick={importSigniture}>Import</button> 
            </div> : ""      }
        </div>
    )
}

export default WalletPendingTx