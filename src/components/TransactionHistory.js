import React, { useState, useEffect } from "react";
import "./TransactionHistory.css"


function TransactionHistory (props) {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
         props.root.getTransactionHistory()
         .then(transactionHistory => setTransactions(transactionHistory))
    }, []);


    function transactionBalance(transaction){
        const BalancesOut = {}
        transaction.utxos.inputs.map( (input, index) => {
           if ( props.wallet.isAddressMine(input.address)) {
            input.amount.map( (asset) => 
                asset.unit in BalancesOut ? BalancesOut[asset.unit] -= parseInt(asset.quantity) :  BalancesOut[asset.unit] = -parseInt(asset.quantity)
            )}})
        transaction.utxos.outputs.map( (input, index) => {
            if ( props.wallet.isAddressMine(input.address)) {
             input.amount.map( (asset) => 
                 asset.unit in BalancesOut ? BalancesOut[asset.unit] += parseInt(asset.quantity) : BalancesOut[asset.unit] = parseInt(asset.quantity)
             )}})
        const tokens = Object.keys(BalancesOut).map((key, index) => ( 
            <div key={index} className="transactionHistoryTokenBalance">
               <span className="transactionHistoryTokenName"> {key}</span>:{BalancesOut[key]} 
             </div>
            ) );

        return (
            <div className="transactionHistoryListBalance">
                <div className="transactionHistoryAdaBalance">
                     {BalancesOut.lovelace/1000000}tA
                 </div>
                 {tokens}
             </div>
             )
    }

    function TransactionListing(transaction){
        console.log(transaction)
        return (<div className="transactionHistoryItem"> 
                     {transaction.hash}<br/>
                     {transactionBalance(transaction)}
                </div>  )

    }
    



    return (
        <div className="TransactionHistoryList">

            {transactions.map((transaction, index) => (<div className="TransactionHistoryListItem" key={index}> {TransactionListing(transaction)}</div>))}


    </div>);
    
}
 
export default TransactionHistory;