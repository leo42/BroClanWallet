import React, { useEffect }     from "react";
import WalletPicker from "./WalletPicker"
import TokenElement from "./TokenElement";
import {  toast } from 'react-toastify';
import { proposalSyntaxPlugins } from "@babel/preset-env/lib/shipped-proposals";


function WalletPendingTx(props) {
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);
    const [importSig, setImportSig] = React.useState(false);
    const [importedTx, setImportedTx] = React.useState("");
    const [showDetails, setShowDetails] = React.useState(true);
    const [inputUtxos, setInputUtxos] = React.useState([]);
    const txDetails = props.root.state.wallets[props.root.state.selectedWallet].getPendingTxDetails(props.index)
    console.log(txDetails)
    useEffect(() => {
        // get Utxo for each input
        props.wallet.getUtxosByOutRef(txDetails.inputs).then( (utxos) => {
            setInputUtxos(utxos)
            })
    }, [])


    function transformAmount(amount){
        const amountOut = {}
        amountOut["lovelace"] = amount.coin
        if(amount.multiasset) { 
            Object.keys(amount.multiasset).map( (policy) => {
                Object.keys(amount.multiasset[policy]).map( (asset) => {
                    amountOut[policy+asset] = parseInt(amount.multiasset[policy][asset])
                })
        })}
        return amountOut
    }

    function transactionBalance(transaction){
        const BalancesOut = {}
        transaction.inputs.map( (input, index) => {
           const utxo = props.wallet.getutxo(input.transaction_id)
           Object.keys( utxo.assets).map( (asset) => 
                asset in BalancesOut ? BalancesOut[asset] -= parseInt(utxo.assets[asset]) :  BalancesOut[asset] = -parseInt(utxo.assets[asset])
            )})

        transaction.outputs.map( (output, index) => {
            if ( props.wallet.isAddressMine(output.address)) {
                const amount = transformAmount(output.amount)
                Object.keys(amount).map( (asset) => 
                asset in BalancesOut ? BalancesOut[asset] += parseInt(amount[asset]) : BalancesOut[asset] = parseInt(amount[asset])
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

    function TransactionDetails(transaction){
    
        return (
            <div>
                <p>Transaction ID: {transaction.transaction_id}</p>
                <p>Index: {transaction.index}</p>
                <div className="txDetailsOutputs">
                <h3>Outputs:</h3>
                {transaction.outputs.map((output, index) =>{ 
                   const amount = transformAmount(output.amount)
                   return (
                    <div key={index}>
                        <p>Address: {output.address}</p>
                        {Object.keys(amount).map((key, index) => (
                            <div key={index}>
                               <TokenElement tokenId={key} amount={amount[key]}/>
                            </div>
                        ))}
                        <p>Amount: {output.amount.coin}</p>
                        <p>Datum: {output.datum}</p>
                        <p>Script Ref: {output.script_ref}</p>
                    </div>
              )})}
              </div>
              <div className="txDetailsInputs">
                <h3>Inputs: </h3>
                {inputUtxos.map( (input, index) => (
                    <div key={index} className="txDetailsInput">
                        <p>Transaction ID: {input.txHash}</p>
                        <p>Index: {input.outputIndex}</p>
                        <p>Address: {input.address ? input.address : "None" }</p>
                        <p>datumHash: {input.datumHash ? input.datumHash : "None"}</p>
                        <p>datum: { input.datum ? input.datum : "None" }</p>
                        <p>Script Ref: {input.scriptRef === null ? "None" : input.scriptRef}</p>
                        
                    {Object.keys( input.assets).map( (asset) => <div  key={asset}> <TokenElement key={index} tokenId={asset} amount={input.assets[asset]}/></div> )}
                    
                    </div>
                        ))}
                    
                </div>
                <p>Fee: {transaction.fee}</p>
                <p>TTL: {transaction.ttl}</p>
                <p>Certs: {transaction.certs}</p>
                <p>Withdrawals: {transaction.withdrawals}</p>
                <p>Update: {transaction.update}</p>
                <p>Auxiliary Data Hash: {transaction.auxiliary_data_hash}</p>
                <p>Validity Start Interval: {transaction.validity_start_interval}</p>
                <p>Mint:               
                   {transaction.mint ? transaction.mint.map( (asset) => <div  key={asset}> <TokenElement key={index} tokenId={asset} amount={input.assets[asset]}/></div> ) : "None"}

                    {transaction.mint}</p>
                <p>Script Data Hash: {transaction.script_data_hash}</p>
                <p>Collateral: {transaction.collateral}</p>
                <p>Collateral Return: {transaction.collateral_return}</p>
                <p>Total Collateral: {transaction.total_collateral}</p>
                <p>Reference Inputs: {transaction.reference_inputs}</p>

            </div>
            );
    }

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
    function importSigniture(){
        try{
            props.root.addSignature(importedTx);
            setImportSig(false);
        }catch(error){
            toast.error( error.message);
        }
    }

    return (
        <div className="pedningTx">
            <svg onClick={copyTransaction} className="copyIcon" id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg>
             Fee:{txDetails.fee/1000000}<br/>
            {transactionBalance(txDetails)}
            {showDetails && TransactionDetails(txDetails)}
             {walletPickerOpen && <WalletPicker setOpenModal={setWalletPickerOpen} operation={signWithLocalWallet} tx={props.tx}/>}
            {txDetails.signatures.map( (item, index) => (
                <div key={index} className={"pendingTx_signer"+ (item.haveSig ? " pendingTx_signer_signed" : "")} >
                    { item.name}
                    { item.haveSig ? <span className="">Signed  <svg onClick={() => copySignature(props.wallet.getSignature(props.index,item.keyHash))} className="copyIcon" id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg> </span> : ""}
                </div>
            )

             )}
            
            <button onClick={ props.root.state.connectedWallet === "" ?  () => setWalletPickerOpen(true) : () => signWithLocalWallet(props.root.state.connectedWallet) } >add signature</button>
        
            <button onClick={() => props.root.submit(props.index)} >Submit</button>
            
            <button onClick={()=> setImportSig(!importSig)} >Import Signature</button>

            <button onClick={()=> props.root.removePendingTx(props.index)} >Remove</button>
            <button onClick= { () => setShowDetails(!showDetails)} >{showDetails ? "Hide" : "Show" } Details</button>
            {importSig ? 
            <div>
                <input type="text" defaultValue={importedTx} onChange={(event)=> setImportedTx(event.target.value)} placeholder="Signature Data"></input>
                  <button onClick={importSigniture}>Import</button> 
            </div> : ""      }
        </div>
    )
}

export default WalletPendingTx