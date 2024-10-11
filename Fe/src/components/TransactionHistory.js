import React, { useState, useEffect } from "react";
import "./TransactionHistory.css"
import  getTransactionHistory  from "../helpers/TransactionHistory.js";
import { toast } from "react-toastify";
import TokenElement from "./TokenElement";
import AddressSelect from "./AddressSelect";

function TransactionHistory (props) {
    const [transactions, setTransactions] = useState([]);
    const [address, setAddress] = useState(props.wallet.getDefaultAddress() === ""? props.wallet.getFundedAddress()[0] :props.wallet.getDefaultAddress() )
    const [page, setPage] = useState(0);
    const [loadMore , setLoadMore] = useState(true);

    useEffect(() => {
    
        let TxH = getTransactionHistory(address, props.root.state.settings)
          TxH.then(transactionHistory => {
            setTransactions(transactionHistory)
            if (transactionHistory.length < 10) {
                setLoadMore(false)
            }else{
                setLoadMore(true)
            }}
            ).catch(e => {
                setLoadMore(false)
                toast.error("Error loading transaction history"+ e.message)
            })

          toast.promise(TxH, {
            pending: "Loading Transaction History",
            })  }
        
    , [address, props.root.state.settings]);

    function handleChangeFrom(event) {
        setAddress(event.target.value)

    }

    function transactionBalance(transaction){
        const BalancesOut = {}
        transaction.utxos.inputs.map( (input, index) => {
           if ( input.address === address && !input.collateral ) {
               input.amount.map( (asset) => 
                asset.unit in BalancesOut ? BalancesOut[asset.unit] -= parseInt(asset.quantity) :  BalancesOut[asset.unit] = -parseInt(asset.quantity)
            )}})
        transaction.utxos.outputs.map( (output, index) => {
            if ( output.address === address  && !output.collateral)  {
                output.amount.map( (asset) => 
                 asset.unit in BalancesOut ? BalancesOut[asset.unit] += parseInt(asset.quantity) : BalancesOut[asset.unit] = parseInt(asset.quantity)
             )}})
        const withdraw = transaction.withdrawals? transaction.withdrawals.amount : 0
        const lovelace = BalancesOut.lovelace - withdraw
        delete BalancesOut["lovelace"]
        Object.keys(BalancesOut).map(item => { if(BalancesOut[item] === 0) {delete BalancesOut[item]} })
        const tokens = Object.keys(BalancesOut).map((key, index) => ( 
           
                <TokenElement  key={index} className="transactionHistoryTokenBalance" tokenId={key} amount={BalancesOut[key]} expanded={false} />
            
            ) );

        return (
            <div className="transactionHistoryListBalance">
                <span className={ lovelace >= 0 ?  "transactionHistoryAdaBalance" : "transactionHistoryAdaBalanceNegative"}>
                { lovelace >= 0 ?  "+" : ""} {lovelace/1000000}
                 </span>{props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  }  
                 {tokens}
             </div>
             )
    }

    function TransactionListing(transaction){
        const urlPrefix = props.root.state.settings.network === "Mainnet" ?   "https://cexplorer.io/tx/" : `https://${props.root.state.settings.network}.cexplorer.io/tx/`
        const date = new Date(transaction.block_time* 1000)
        return (<div className="transactionHistoryItem"> 
                   <a  href={`${urlPrefix}${transaction.tx_hash}`} target="_blank"> {transaction.tx_hash}<br/></a>
                     <span className="TransactionHistoryListTime">{date.toLocaleString()}</span>
                     <br/>
                     {transactionBalance(transaction)}
                </div>  )
    }

    function loadMoreTransactions(){
        const newPage = page + 1
        setPage(newPage)
        let TxH = getTransactionHistory(address, props.root.state.settings, newPage )
        TxH.then(transactionHistory => {setTransactions(transactions.concat(transactionHistory))
            if (transactionHistory.length < 10) setLoadMore(false)}
            )
        toast.promise(TxH, {
            pending: "Loading Transaction History",
            error: "Error Loading Transaction History"
            })
    }

    



    return (
       <div className="TransactionHistory"> 
        {props.wallet.getFundedAddress().length === 0 && <h1>No funds in this wallet</h1>}
        {props.wallet.getFundedAddress().length > 1 && <div className="TransactionHistorySelectAddress">
      <AddressSelect
          wallet={props.wallet}
          moduleRoot={props.moduleRoot}
          selectedAddress={address}
          onAddressChange={setAddress}
          showAll={false}
        />
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