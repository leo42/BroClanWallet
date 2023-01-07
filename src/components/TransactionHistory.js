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
        const lovelace = BalancesOut.lovelace
        delete BalancesOut["lovelace"]
        Object.keys(BalancesOut).map(item => { if(BalancesOut[item] === 0) {delete BalancesOut[item]} })
        const tokens = Object.keys(BalancesOut).map((key, index) => ( 
            <div key={index} className="transactionHistoryTokenBalance">
               <span className="transactionHistoryTokenName"> {key}</span >:<span className={BalancesOut[key] >= 0 ? "transactionHistoryTokenBalancePositive" : "transactionHistoryTokenBalanceNegative"}>{BalancesOut[key]}</span> 
             </div>
            ) );

        return (
            <div className="transactionHistoryListBalance">
                <span className={ lovelace >= 0 ?  "transactionHistoryAdaBalance" : "transactionHistoryAdaBalanceNegative"}>
                { lovelace >= 0 ?  "+" : ""} {lovelace/1000000}
                 </span>tA 
                 {tokens}
             </div>
             )
    }

    function TransactionListing(transaction){
        console.log(transaction)
        const date = new Date(transaction.block_time* 1000)
        return (<div className="transactionHistoryItem"> 
                     {transaction.tx_hash}<br/>
                     <span className="transactionHistoryListTime">{date.toString()}</span>
                     <br/>
                     {transactionBalance(transaction)}
                </div>  )
    }
    



    return (
        <div className="TransactionHistoryList">

            {transactions.map((transaction, index) => (<div className="TransactionHistoryListItem" key={index}> {TransactionListing(transaction)}</div>))}


    </div>);
    
}
 
export default TransactionHistory;