import React, { useState, useEffect } from "react";
import "./TransactionHistory.css"


function TransactionHistory (props) {
    const [transactions, setTransactions] = useState([]);
    const [address, setAddress] = useState(props.wallet.getDefaultAddress() === ""? props.wallet.getFundedAddress()[0] :props.wallet.getDefaultAddress() )


    useEffect(() => {
        if (props.root.state.settings.provider === "Kupmios"){
            
        }else{
         props.root.getTransactionHistory(address)
         .then(transactionHistory => setTransactions(transactionHistory))
    }}, [address]);

    function handleChangeFrom(event) {
        console.log()
        setAddress(event.target.value)

    }

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
       <div>
        {props.wallet.getFundedAddress().length === 0 && <div className="TransactionHistoryNoFunds">No funds in this wallet</div>}
        {props.wallet.getFundedAddress().length > 1 && <div className="TransactionHistorySelectAddress">
      <select defaultValue={props.wallet.getDefaultAddress()} onChange={handleChangeFrom} >
                 {props.wallet.getFundedAddress().map( (item, index) => (
                  <option key={index} value={item} >{props.wallet.getAddressName(item)}</option>
            ))}
      </select>
      </div>}
         <div className="TransactionHistoryList">
            {props.root.state.settings.provider === "Kupmios" ? <div> Transaction History not availbale when using kupmios</div> : 
            transactions.map((transaction, index) => (<div className="TransactionHistoryListItem" key={index}> {TransactionListing(transaction)}</div>))}

            </div>
    </div>);
    
}
 
export default TransactionHistory;