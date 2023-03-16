import React, { useState, useEffect } from "react";
import "./TransactionHistory.css"
import  getTransactionHistory  from "../helpers/TransactionHistory.js";
import { toast } from "react-toastify";
import TokenElement from "./TokenElement";

function TransactionHistory (props) {
    const [transactions, setTransactions] = useState([]);
    const [address, setAddress] = useState(props.wallet.getDefaultAddress() === ""? props.wallet.getFundedAddress()[0] :props.wallet.getDefaultAddress() )
    const [page, setPage] = useState(0);
    const [loadMore , setLoadMore] = useState(true);

    useEffect(() => {
    
                      let TxH = getTransactionHistory(address, props.root.state.settings)
          TxH.then(transactionHistory => {setTransactions(transactionHistory)
            if (transactionHistory.length < 10) {
                setLoadMore(false)
            }else{
                setLoadMore(true)
            }}
            )
          toast.promise(TxH, {
            pending: "Loading Transaction History",
            error: "Error Loading Transaction History"
            })  }
        
    , [address, props.root.state.settings]);

    function handleChangeFrom(event) {
        setAddress(event.target.value)

    }

    function transactionBalance(transaction){
        const BalancesOut = {}
        transaction.utxos.inputs.map( (input, index) => {
           if ( input.address === address) {
            input.amount.map( (asset) => 
                asset.unit in BalancesOut ? BalancesOut[asset.unit] -= parseInt(asset.quantity) :  BalancesOut[asset.unit] = -parseInt(asset.quantity)
            )}})
        transaction.utxos.outputs.map( (input, index) => {
            if ( input.address === address) {
             input.amount.map( (asset) => 
                 asset.unit in BalancesOut ? BalancesOut[asset.unit] += parseInt(asset.quantity) : BalancesOut[asset.unit] = parseInt(asset.quantity)
             )}})
        const lovelace = BalancesOut.lovelace
        delete BalancesOut["lovelace"]
        Object.keys(BalancesOut).map(item => { if(BalancesOut[item] === 0) {delete BalancesOut[item]} })
        const tokens = Object.keys(BalancesOut).map((key, index) => ( 
            <div key={index} className="transactionHistoryTokenBalance">
                <TokenElement tokenId={key} amount={BalancesOut[key]}/>
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

        const date = new Date(transaction.block_time* 1000)
        return (<div className="transactionHistoryItem"> 
                     {transaction.tx_hash}<br/>
                     <span className="TransactionHistoryListTime">{date.toString()}</span>
                     <br/>
                     {transactionBalance(transaction)}
                </div>  )
    }

    function loadMoreTransactions(){
        setPage(page + 1)
        let TxH = getTransactionHistory(address, props.root.state.settings, page )
        TxH.then(transactionHistory => {setTransactions(transactions.concat(transactionHistory))
            if (transactionHistory.length < 10) setLoadMore(false)}
            )
        toast.promise(TxH, {
            pending: "Loading Transaction History",
            error: "Error Loading Transaction History"
            })
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
            { props.root.state.settings.metadataProvider === "None" ? <div className="TransactionHistoryNoMetadata">No Metadata Provider Selected</div> :
             transactions.map((transaction, index) => (<div className="TransactionHistoryListItem" key={index}> {TransactionListing(transaction)}</div>))
        }
        {loadMore && <div className="TransactionHistoryLoadMore" onClick={loadMoreTransactions}>Load More</div> }

            </div>
    </div>);
    
}
 
export default TransactionHistory;