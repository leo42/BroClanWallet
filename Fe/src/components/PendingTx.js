import React, { useEffect }     from "react";
import TokenElement from "./TokenElement";
import {  toast } from 'react-toastify';
import { ReactComponent as SignIcon } from "./../html/assets/sign.svg";
import { ReactComponent as ImportSigIcon } from "./../html/assets/importSig.svg";
import { ReactComponent as ExpandIcon } from "./../html/assets/details.svg";
import copyTextToClipboard from "./../helpers/copyTextToClipboard";
import "./PendingTx.css"

function WalletPendingTx(props) {
    const [ hovering, setHovering] = React.useState("");
    const [importSig, setImportSig] = React.useState(false);
    const [importedTx, setImportedTx] = React.useState("");
    const [showDetails, setShowDetails] = React.useState(false);
    const [inputUtxos, setInputUtxos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [collateralUtXos, setCollateralUtxos] = React.useState([]);
    const [referenceInputsUtxos,    setReferenceInputsUtxos] = React.useState([]);
    const [isMobile, setIsMobile] = React.useState(false);

    useEffect(() => {
      const updateWindowDimensions = () => {
        const newIsMobile = window.innerWidth <= 768;
        if (isMobile !== newIsMobile) {
          setIsMobile(newIsMobile);
        }
      };
      window.addEventListener("resize", updateWindowDimensions);
      updateWindowDimensions();
      return () => window.removeEventListener("resize", updateWindowDimensions);
    }, [isMobile]);
    
    const txDetails =normalizeTxDetails(props.moduleRoot.state.wallets[props.moduleRoot.state.selectedWallet].getPendingTxDetails(props.index))
    
    useEffect(() => {
        // get Utxo for each input
        props.wallet.getUtxosByOutRef(txDetails.inputs).then( (utxos) => {
            setInputUtxos(utxos)
            setLoading(false)
            })

        txDetails.collateral ? props.wallet.getUtxosByOutRef(txDetails.collateral).then( (utxos) => {
            setCollateralUtxos(utxos)
            }) : setCollateralUtxos([])

        txDetails.reference_inputs ? props.wallet.getUtxosByOutRef(txDetails.reference_inputs).then( (utxos) => {
            setReferenceInputsUtxos(utxos)
            }) : setReferenceInputsUtxos([])

    }, [])

    function normalizeTxDetails(txBody){
        if (txBody.outputs) {
            txBody.outputs = txBody.outputs.map((output) => {
              // Check if the output is an object with a single key (format type)
              const formatKeys = Object.keys(output);
              if (formatKeys.length === 1 && typeof output[formatKeys[0]] === 'object') {
                // Return the inner object, which contains the actual output data
                return output[formatKeys[0]];
              }
              return output;
            });
          }
          if (txBody.inputs) {
            txBody.inputs = txBody.inputs.map((input) => {
              // Check if the input is an object with a single key (format type)
              const formatKeys = Object.keys(input);
              if (formatKeys.length === 1 && typeof input[formatKeys[0]] === 'object') {
                // Return the inner object, which contains the actual input data
                return input[formatKeys[0]];
              }
              return input;
            });
          }
          if (txBody.collateral_return) {
            const formatKeys = Object.keys(txBody.collateral_return);
            if (formatKeys.length === 1 && typeof txBody.collateral_return[formatKeys[0]] === 'object') {
              txBody.collateral_return = txBody.collateral_return[formatKeys[0]];
            }
          }
          return txBody
    }

    const signaturesCompleted = props.wallet.checkSigners(txDetails.signatures.map( (signature) => signature.haveSig ? signature.keyHash : "  "))

    function transformAmount(amount) {
        const amountOut = {};
        amountOut["lovelace"] = amount.coin;

        if (amount.multiasset) {

            // Iterate over the multiasset Map
            amount.multiasset.forEach((assetsMap, policy) => {

                // Iterate over the assets Map
                assetsMap.forEach((value, asset) => {
                    amountOut[policy + asset] = BigInt(value);
                });
            });
        }

        return amountOut;
    }

    function transactionBalance(transaction){
        const BalancesOut = {}
        inputUtxos.map( (input, index) => {
           if ( props.wallet.isAddressMine(input.address)) {
           Object.keys( input.assets).map( (asset) => 
                asset in BalancesOut ? BalancesOut[asset] -= BigInt(input.assets[asset]):  BalancesOut[asset] =- BigInt(input.assets[asset])
            )}})

        transaction.outputs.map( (output, index) => {
            if ( props.wallet.isAddressMine(output.address)) {
                const amount = transformAmount(output.amount)
                Object.keys(amount).map( (asset) => 
                asset in BalancesOut ? BalancesOut[asset] += BigInt(amount[asset]) : BalancesOut[asset] = BigInt(amount[asset])
             )}})
        if(transaction.withdrawals) {
             if(transaction.withdrawals.hasOwnProperty(props.wallet.getStakingAddress()) ) {
                BalancesOut["lovelace"] -= BigInt(transaction.withdrawals[props.wallet.getStakingAddress()])
            }
        }

        const lovelace =BalancesOut.lovelace ?  BigInt( BalancesOut.lovelace)  : 0n
        delete BalancesOut["lovelace"]
        Object.keys(BalancesOut).map(item => { if(BalancesOut[item] === 0n) {delete BalancesOut[item]} })
        const tokens = Object.keys(BalancesOut).map((key, index) => ( 
       
                <TokenElement  key={index} className="transactionHistoryTokenBalance"  tokenId={key} amount={Number(BalancesOut[key])}  />
          
            ) );

        
        
        return inputUtxos.length !== 0 ? (
            <div className="transactionHistoryListBalance">
               <span className={ lovelace >= 0n ?  "transactionHistoryAdaBalance" : "transactionHistoryAdaBalanceNegative"}>
                { lovelace >= 0n ?  "+" : ""} {Number(lovelace)/1000000}
                 </span> {props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  }  
                 {tokens}
             </div>
             ) : <div className="transactionHistoryListBalance"> </div>
    }

    function TransactionInput(input){
        return (
<div key={input.txHash+input.outputIndex} className="txDetailsInput">
                         <p > <span className={props.wallet.isAddressMine(input.address) ? "txDetailsAddressMine" : "txDetailsAddressNotMine"}> {input.address ? input.address : "None" }</span> <br/>
                          Transaction ID: {input.txHash} | Index: {input.outputIndex}</p>
                    {Object.keys( input.assets).map( (asset,index) =><TokenElement className="pendingTxTokenContainer"  key={index} tokenId={asset} amount={input.assets[asset]}/> )}
                        
                        {input.datumHash &&  <div className="pendingTxData"> <div > <h4>Datum Hash:</h4><span >  {input.datumHash}</span> </div> </div>}
                         { input.datum &&<div className="pendingTxData"> <div > <h4>Datum:</h4> <span > {JSON.stringify(input.datum,null,2) }</span> </div> </div>}
                        {input.scriptRef &&  <div className="pendingTxData"> <div > <h4>Script Reference:</h4><span >  { JSON.stringify(input.scriptRef,null,2)}</span></div> </div> }
              </div>
        )
    }

    function TransactionOutput(output){
        const amount = transformAmount(output.amount)
        return (
                 
                    <div key={JSON.stringify(output)} className="txDetailsOutput">
                        <p className={props.wallet.isAddressMine(output.address) ? "txDetailsAddressMine" : "txDetailsAddressNotMine"}>{output.address}</p>
                        {Object.keys(amount).map((key, index) => (
                                        <TokenElement className="pendingTxTokenContainer" key={index} tokenId={key} amount={amount[key]}/>
                       ))}
                       {output.datum && <div className="pendingTxData"> <div > <h4>Datum:</h4> <span>{JSON.stringify(output.datum, null, 2)} </span> </div></div>  }
                        {output.script_ref &&<div className="pendingTxData">  <div>  <h4>Script Ref:</h4> <span>{JSON.stringify( output.script_ref, null, 2)}</span> </div></div>}
                    </div>
                    )
    }

    function mintToAssets(mint){
        const assets = {}
        Object.keys(mint).map( (policy) => {
            Object.keys(mint[policy]).map( (asset) => {
                assets[policy+asset] = parseInt(mint[policy][asset])
            })
    })
    return assets
    }


    function TransactionDetails(transaction){
        const mintAssets = transaction.mint ? mintToAssets(transaction.mint) : {};

        return (
            <div>
                <div className="txDetailsInputsOutputs">
                    <div className="txDetailsInputs">
                        <h3>Inputs: </h3>
                        {inputUtxos.map((input, index) => (
                            TransactionInput(input)
                        ))}
                    </div>
                    <div className="txDetailsOutputs">
                        <h3>Outputs:</h3>
                        {transaction.outputs && transaction.outputs.map((output, index) =>
                            TransactionOutput(output)
                        )}
                    </div>
                </div>
                <div className="txDetailsSmall">
                    <div><h3>Fee:</h3> {transaction.fee / 1_000_000}{props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"}</div>
                    {transaction.ttl && <div><h3>TTL:</h3> {transaction.ttl}</div>}
                    {transaction.network_id && <div><h3>Network:</h3> {transaction.network_id}</div>}
                </div>
                <div className="txDetailsMain">
                    {transaction.certs && <div className="pendingTxData"><div><h4>Certificates:</h4><span>{transaction.certs.map((cert, index) => {
                        switch(Object.keys(cert)[0]) {
                            case 'StakeDelegation':
                                return (<div key={index}>Delegation to:{JSON.stringify(cert.StakeDelegation)}</div>);
                            case 'StakeRegistration':
                                return (<div key={index}>Stake Registration {JSON.stringify(cert.StakeRegistration)}</div>);
                            case 'UnregCert':
                                return (<div key={index}>Stake Deregistration {JSON.stringify(cert.UnregCert)}</div>);
                            case 'PoolRegistration':
                                return (<div key={index}>Pool Registration {JSON.stringify(cert.PoolRegistration)}</div>);
                            case 'PoolRetirement':
                                return (<div key={index}>Pool Retirement {JSON.stringify(cert.PoolRetirement)}</div>);
                            case 'GenesisKeyDelegation':
                                return (<div key={index}>Genesis Key Delegation {JSON.stringify(cert.GenesisKeyDelegation)}</div>);
                            case 'MoveInstantaneousRewardsCert':
                                return (<div key={index}>Move Instantaneous Rewards Cert {JSON.stringify(cert.MoveInstantaneousRewardsCert)}</div>);
                            case 'StakeRegDelegCert':
                                return (<div key={index}>Stake Reg Delegation {JSON.stringify(cert.StakeRegDelegCert)}</div>);
                            case 'StakeVoteDelegCert':
                                return (<div key={index}>Stake Vote Delegation {JSON.stringify(cert.StakeVoteDelegCert)}</div>);
                            default:
                                return (<div key={index}>Unknown Certificate Type: {JSON.stringify(cert)}</div>);
                        }

                    })}</span></div></div>}

                    {transaction.withdrawals && <div className="pendingTxData"><div><h4>Withdrawals:</h4><span>{JSON.stringify(transaction.withdrawals)}</span></div></div>}
                    {transaction.update && <div className="pendingTxData"><div><h4>Update:</h4><span>{transaction.update}</span></div></div>}
                    {transaction.auxiliary_data_hash && <div className="pendingTxData"><div><h4>Auxiliary Data Hash:</h4><span>{transaction.auxiliary_data_hash}</span></div></div>}
                    {transaction.validity_interval_start && <div className="pendingTxData"><div><h4>Validity Interval Start:</h4><span>{transaction.validity_interval_start}</span></div></div>}
                    {transaction.script_data_hash && <div className="pendingTxData"><div><h4>Script Data Hash:</h4><span>{transaction.script_data_hash}</span></div></div>}

                    {transaction.collateral_return && <div className="pendingTxData"><div><h4>Collateral Return:</h4><span>{TransactionOutput(transaction.collateral_return)}</span></div></div>}
                    {transaction.total_collateral && <div className="pendingTxData"><div><h4>Total Collateral:</h4><span>{transaction.total_collateral}</span></div></div>}
                    {transaction.invalid_before && <div className="pendingTxData"><div><h4>Invalid Before:</h4><span>{transaction.invalid_before}</span></div></div>}
                    {transaction.invalid_hereafter && <div className="pendingTxData"><div><h4>Invalid Hereafter:</h4><span>{transaction.invalid_hereafter}</span></div></div>}
                    {transaction.required_scripts && <div className="pendingTxData"><div><h4>Required Scripts:</h4><span>{transaction.required_scripts.map((script) => <div key={script}>{script}</div>)}</span></div></div>}

                    {collateralUtXos.length !== 0 && <div className="pendingTxReferenceInputs"><div><h3>Collateral:</h3><span>{collateralUtXos.map((input, index) =>
                        TransactionInput(input)
                    )}</span></div></div>}

                    {transaction.reference_inputs && <div className="pendingTxReferenceInputs"><div><h3>Reference Inputs:</h3><span>{referenceInputsUtxos.map((referenceInput) =>
                        TransactionInput(referenceInput)
                    )}</span></div></div>}
                    {transaction.required_signers && <div className="pendingTxData"><div><h4>Required Signers:</h4><span className="pendingTxsDetailsSigners">{transaction.required_signers.map((signer => <div key={signer}>{signer}</div>))}</span></div></div>}
                    {transaction.mint && <div><div><h4>Mint/Burn:</h4>
                        {Object.keys(mintAssets).map((asset) => <TokenElement key={asset} tokenId={asset} amount={mintAssets[asset]} />)}</div></div>}
                </div>
            </div>
        );
    }

    async function signWithLocalWallet(wallet){
        try{
        const api = await window.cardano[wallet].enable()
        const signature = await api.signTx(props.tx.tx.toCBOR() ,true)
        props.moduleRoot.addSignature(signature)
        }catch(error){
            toast.error("Error signing with local wallet: " + error.info)
        }
      }  
      
    function copySignature(signature){
        copyTextToClipboard(signature)
        toast.info("Signature copied to clipboard")
    }

    function copyTransaction(){
        copyTextToClipboard(props.tx.tx.toString())
        toast.info("Transaction copied to clipboard")
    }

    function importSigniture(){
        try{
            props.moduleRoot.addSignature(importedTx);
            setImportSig(false);
        }catch(error){
            toast.error( error.message);
        }
    }

    function signTransaction(){
      if( props.moduleRoot.state.connectedWallet.name === "" ) 
        props.root.openWalletPicker(signWithLocalWallet)
      else
        signWithLocalWallet(props.moduleRoot.state.connectedWallet.name)
    }

    return (
        <div className="pedningTx">
     <div className='deleteRecipientWrapper'>
            <div   > <button className='deleteRecipient' type="submit" onClick={ ()=> props.moduleRoot.removePendingTx(props.index)}>x</button> </div>
      </div>


            <svg onClick={copyTransaction} className="copyIcon" id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg>
            {txDetails.certs && txDetails.certs.some(obj => "StakeDelegation" in obj)  ? "Delegation Transaction" : "Regular Transaction"} 
             
             <br/>
            {inputUtxos.length !== 0 ? transactionBalance(txDetails) : ""}

            <div className="pendingTx_signers">
            <h4 >Signatures:</h4>
            {txDetails.signatures.map( (item, index) => (
                <div key={index} className={"pendingTx_signer"+ (item.haveSig ? " pendingTx_signer_signed" : "")} >
                   
                    {item.haveSig ? <span className="pendingTxCompletedSig">{props.moduleRoot.getSignerName(item.keyHash)} Signed <svg className="copyIcon" onClick={() => copySignature(props.wallet.getSignature(props.index,item.keyHash))}  id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg> </span> :
                      <span className="pendingTxMissingSig"> Signature missing for: {props.moduleRoot.getSignerName(item.keyHash)}</span> }
                </div>))}


            {showDetails && TransactionDetails(txDetails)}
            </div>
            <div className="pendingTx_buttons">
            { loading == false &&<div  onMouseEnter={() => setHovering("sign")} onMouseLeave={() => setHovering("") } onClick={signTransaction}  className='iconWraper detailsButton'>
                <SignIcon className="icon"  alt="signicon" />
                {  (hovering === "sign" || isMobile) &&  <label className='iconLabel'>Sign</label> }
            </div>  }
                            
            <div  onMouseEnter={() => setHovering("importSig")} onMouseLeave={() => setHovering("") } onClick={()=> setImportSig(!importSig)}  className='iconWraper importSigButton'>
                <ImportSigIcon className="icon"  alt="signicon" />
                {  ( hovering === "importSig" || isMobile)  &&  <label className='iconLabel'>Import Sig</label> }
            </div>  
              
            <div  onMouseEnter={() => setHovering("Details")} onMouseLeave={() => setHovering("") } onClick={() => setShowDetails(!showDetails)}  className='iconWraper txDetailsButton'>
                <ExpandIcon className="icon"  alt="signicon" />
                { ( hovering === "Details" || isMobile)  &&  <label className='iconLabel'>{showDetails ? "Hide" : "Show" } Details</label> }
            </div>  
                </div>
   
            {signaturesCompleted &&  <button className="pendingTx_submit commonBtn" onClick={() => props.moduleRoot.submit(props.index)}>Submit</button> }

            {importSig ? 
            <div>
                <input type="text" defaultValue={importedTx} onChange={(event)=> setImportedTx(event.target.value)} placeholder="Signature Data"></input>
                  <button onClick={importSigniture}>Import</button> 
            </div> : ""      }
        </div>
    )
}

export default WalletPendingTx