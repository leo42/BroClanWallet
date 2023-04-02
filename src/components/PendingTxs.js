import React from "react";
import WalletPendingTx from "./PendingTx";
import { useState, useEffect } from "react";    
import { toast } from 'react-toastify';

function PendingTxs(props){

    const [importTransaction, setImportTransaction] = useState(false);
    const [importedTx, setImportedTx] = useState("");

    const  importTx = (importedTx) =>{
        try{
            props.root.importTransaction(importedTx);
            setImportTransaction(false);
        }catch(error){
            toast.error("Error importing transaction: " + error.message);
        }

    }

    const pending = props.wallet.getPendingTxs().length;
    return(
        <div className="pendingTxs"  key={pending}>
            <h3>Pending Transactions</h3>
            {props.wallet.getPendingTxs().map( (pendingTx, index) => (
                <WalletPendingTx root={props.root} tx={pendingTx} index={index}  wallet={props.wallet}  key={pendingTx.tx.toString()}></WalletPendingTx>
                ) )}
            <button className="commonBtn" onClick={() =>setImportTransaction(!importTransaction)}>Import Transaction</button>
            {importTransaction ? <div>
                    <input type="text" defaultValue={importedTx} onChange={(event)=> setImportedTx(event.target.value)} placeholder="Transaction Data"></input>
                    <button  className="commonBtn" onClick={ () => importTx(importedTx)}>Import</button></div> : "" }
        </div>
    )
}

export default PendingTxs;