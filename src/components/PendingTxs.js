import React from "react";
import WalletPendingTx from "./PendingTx";
import { useState, useEffect } from "react";    
import { toast } from 'react-toastify';

function PendingTxs(props){

    const [importTransaction, setImportTransaction] = useState(false);
    const [importedTx, setImportedTx] = useState("");

    const importTx = (importedTx) =>{
        try{
            props.root.importTransaction(importedTx);
            toast.success("Transaction imported");
            setImportTransaction(false);
        }catch(error){
            toast.error( error.message);
        }

    }
    return(
        <div className="pendingTxs">
             <button onClick={() =>setImportTransaction(!importTransaction)}>Import Transaction</button>
             {importTransaction ? <div>
                   <input type="text" defaultValue={importedTx} onChange={(event)=> setImportedTx(event.target.value)} placeholder="Transaction Data"></input>
                   <button  onClick={ () => importTx(importedTx)}>Import</button></div> : "" }
            <h3>Pending Transactions</h3>
            {props.wallet.getPendingTxs().map( (pendingTx, index) => (
                  <WalletPendingTx root={props.root} tx={pendingTx} index={index}  wallet={props.wallet}  key={props.root.state.selectedWallet + index}></WalletPendingTx>
            ) )}
        </div>
    )
}

export default PendingTxs;