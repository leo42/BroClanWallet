import React, { useState, useEffect } from "react";
import "./TransactionHistory.css"
import  getTransactionHistory  from "../helpers/TransactionHistory";
import { toast } from "react-toastify";
import TokenElement from "./TokenElement";
import AddressSelect from "./AddressSelect";
import { App } from "..";
import MultisigContainer from "./Multisig/MultisigContainer";
import SmartWalletContainer from "./SmartWallet/SmartWalletContainer";
import WalletInterface from "../core/WalletInterface";

type TransactionHistoryProps = {
    wallet : WalletInterface
    root : App
    moduleRoot : MultisigContainer | SmartWalletContainer
}

function TransactionHistory (props : TransactionHistoryProps) {
    const [transactions, setTransactions] = useState([]);
    const [address, setAddress] = useState(props.wallet.getDefaultAddress() === ""? props.wallet.getAddress() : props.wallet.getDefaultAddress() )
    const [page, setPage] = useState(0);
    const [loadMore , setLoadMore] = useState(true);
    const [hasHistory, setHasHistory] = useState(true);
    useEffect(() => {
    
        let TxH = getTransactionHistory(address, props.root.state.settings)
          TxH.then((transactionHistory : any) => {
            setTransactions(transactionHistory)
            if (transactionHistory.length === 0) {
                setHasHistory(false)
            }
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

    function handleChangeFrom(event : any) {
        setAddress(event.target.value)

    }

    function transactionBalance(transaction : any){
        const BalancesOut : any = {}
        transaction.utxos.inputs.map( (input : any, index : any) => {
           if ( input.address === address && !input.collateral ) {
               input.amount.map( (asset : any   ) => 
                asset.unit in BalancesOut ? BalancesOut[asset.unit] -= parseInt(asset.quantity) :  BalancesOut[asset.unit] = -parseInt(asset.quantity)
            )}})
        transaction.utxos.outputs.map( (output : any, index : any) => {
            if ( output.address === address  && !output.collateral)  {
                output.amount.map( (asset : any) => 
                 asset.unit in BalancesOut ? BalancesOut[asset.unit] += parseInt(asset.quantity) : BalancesOut[asset.unit] = parseInt(asset.quantity)
             )}})
        const withdraw = transaction.withdrawals? transaction.withdrawals.amount : 0
        const lovelace = BalancesOut.lovelace - withdraw
        delete BalancesOut["lovelace"]
        Object.keys(BalancesOut).map((item : any) => { if(BalancesOut[item] === 0) {delete BalancesOut[item]} })
        const tokens = Object.keys(BalancesOut).map((key : any, index : any) => ( 
           
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

    function TransactionListing(transaction : any){
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
        TxH.then((transactionHistory : any) => {setTransactions(transactions.concat(transactionHistory))
            if (transactionHistory!.length < 10) setLoadMore(false)}
            )
        toast.promise(TxH, {
            pending: "Loading Transaction History",
            error: "Error Loading Transaction History"
            })
    }

    



    return (
       <div className="TransactionHistory"> 
        {!hasHistory && <h1>No funds in this wallet</h1>}
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