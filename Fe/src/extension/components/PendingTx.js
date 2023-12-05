import React, { useEffect }     from "react";
import TokenElement from "../../components/TokenElement";
import { ReactComponent as ExpandIcon } from "../../html/assets/details.svg";
import copyTextToClipboard from "../../helpers/copyTextToClipboard";
import "../../components/Multisig/PendingTx.css"
import "./PendingTx.css"
import {   C, Lucid } from "lucid-cardano";
import { Buffer } from "buffer";


function PendingTx(props) {

    let lucid
    const [showDetails, setShowDetails] = React.useState(false);
    const [inputUtxos, setInputUtxos] = React.useState([]);
    const [txDetails, setTxDetails] = React.useState(undefined);
    const [collateralUtXos, setCollateralUtxos] = React.useState([]);
    const [referenceInputsUtxos,    setReferenceInputsUtxos] = React.useState([]);
    const [isMobile, setIsMobile] = React.useState(false);
    const [address , setAddress] = React.useState({})
    async function getUtxosByOutRef(outRefs){
        return JSON.parse(await  chrome.runtime.sendMessage({ action: 'getUtxoByOutRef', outRefs: JSON.stringify(outRefs) }))
    }

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

    
    const isAddressMine = (addressCheck) => {
        if(Object.keys(address).includes(addressCheck)){
            return address[addressCheck]
        }else{
            return false
        }
    }

    const checkAddress = async (newAddress) => {
            //remove duplicates
            newAddress = [...new Set(newAddress)]

            const addressMine = await chrome.runtime.sendMessage({ action: 'isAddressMine', address: JSON.stringify(newAddress) }) 

        
            console.log(addressMine)
            setAddress(JSON.parse(addressMine)) 
    
    }

    useEffect(async () => {

        const txDetails =JSON.parse(await  chrome.runtime.sendMessage({ action: 'decodeTx', tx: JSON.stringify(props.tx) }))
        setTxDetails(txDetails)
        const addressFound = []
        await getUtxosByOutRef(txDetails.inputs).then( (utxos) => {
            console.log(utxos)
            setInputUtxos(utxos)
            utxos.map( (utxo) => {
                addressFound.push(utxo.address)
            })
        })

        await txDetails.collateral ? getUtxosByOutRef(txDetails.collateral).then( (utxos) => {
            setCollateralUtxos(utxos)
            utxos.map( (utxo) => {
                addressFound.push(utxo.address)
            })
        }) : setCollateralUtxos([])
        
        await txDetails.reference_inputs ? getUtxosByOutRef(txDetails.reference_inputs).then( (utxos) => {
            setReferenceInputsUtxos(utxos)
            utxos.map( (utxo) => {
                addressFound.push(utxo.address)
            })
        }) : setReferenceInputsUtxos([])
        
        await txDetails.outputs.map( (output) => {
            addressFound.push(output.address)
        })
    
        checkAddress(addressFound)

        setShowDetails(true)
    }, [])

    
 

    function transformAmount(amount){
        const amountOut = {}
        amountOut["lovelace"] = amount.coin
        if(amount.multiasset) { 
            Object.keys(amount.multiasset).map( (policy) => {
                Object.keys(amount.multiasset[policy]).map( (asset) => {
                    amountOut[policy+asset] = BigInt(amount.multiasset[policy][asset])
                })
        })}
        return amountOut
    }

    function transactionBalance(transaction){
        const BalancesOut = {}
        inputUtxos.map( (input, index) => {
           if ( isAddressMine(input.address)) {
           Object.keys( input.assets).map( (asset) => 
                asset in BalancesOut ? BalancesOut[asset] -= BigInt(input.assets[asset]):  BalancesOut[asset] =- BigInt(input.assets[asset])
            )}})

        transaction.outputs.map( (output, index) => {
            if ( isAddressMine(output.address)) {
                const amount = transformAmount(output.amount)
                Object.keys(amount).map( (asset) => 
                asset in BalancesOut ? BalancesOut[asset] += BigInt(amount[asset]) : BalancesOut[asset] = BigInt(amount[asset])
             )}})
        if(transaction.withdrawals) {
             if(transaction.withdrawals.hasOwnProperty(getStakingAddress()) ) {
                BalancesOut["lovelace"] -= BigInt(transaction.withdrawals[getStakingAddress()])
            }
        }

        const lovelace =BalancesOut.lovelace ?  BigInt( BalancesOut.lovelace)  : 0n
        delete BalancesOut["lovelace"]
        Object.keys(BalancesOut).map(item => { if(BalancesOut[item] === 0n) {delete BalancesOut[item]} })
        const tokens = Object.keys(BalancesOut).map((key, index) => ( 
       
                <TokenElement  key={index} className="transactionHistoryTokenBalance"  tokenId={key} amount={Number(BalancesOut[key])}  />
          
            ) );

        
        
        return inputUtxos.length !== 0 ? (
            <div className="transactionBallance">
               <span className={ lovelace >= 0n ?  "transactionBallancePositive" : "transactionBallanceNegative"}>
                { lovelace >= 0n ?  "+" : ""} {Number(lovelace)/1000000}
                 </span>  ₳
                 {tokens}
             </div>
             ) : <div className=""> </div>
    }

    function TransactionInput(input){
        return (
<div key={input.txHash+input.outputIndex} className="txDetailsInput">
                         <p > <span className={isAddressMine(input.address) ? "txDetailsAddressMine" : "txDetailsAddressNotMine"}> {input.address ? input.address : "None" }</span> <br/>
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
                        <p className={isAddressMine(output.address) ? "txDetailsAddressMine" : "txDetailsAddressNotMine"}>{output.address}</p>
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
        const mintAssets =  transaction.mint ? mintToAssets(transaction.mint) : {}

        return (
            <div>
                <div className="txDetailsInputsOutputs">
              <div className="txDetailsInputs">
                <h3>Inputs: </h3>
                {inputUtxos.map( (input, index) => (
                    TransactionInput(input)
                        ))}
                    
                </div>
                <div className="txDetailsOutputs">
                <h3>Outputs:</h3>
                {transaction.outputs.map((output, index) => 

                    TransactionOutput(output))}
              </div>
                </div>
                    <div className="txDetailsSmall">
                <div><h3>Fee:</h3> {transaction.fee / 1_000_000} ₳    </div>
                { transaction.ttl && <div><h3>TTL:</h3> {transaction.ttl}</div>}
                {transaction.network_id &&  <div> <h3>Network:</h3> {transaction.network_id}</div> }
                    </div>
                <div className="txDetailsMain">
             {transaction.certs  ?   <div className="pendingTxData"> <div > <h4>Certificates:</h4> <span> {transaction.certs.map((cert, index) => {
                if (cert.StakeDelegation) {
                    return( <div key={index}>Delegation to:{JSON.stringify(cert.StakeDelegation)}</div> )
                }if (cert.StakeRegistration) {
                    return( <div key={index}>Stake Registration {JSON.stringify(cert.StakeRegistration)}</div> )
                }if (cert.StakeDeregistration) {
                    return( <div key={index}>Stake Deregistration  {JSON.stringify(cert.StakeDeregistration)}</div> )
                }if (cert.PoolRegistration) {
                    return( <div key={index}>Pool Registration {JSON.stringify(cert.PoolRegistration)}</div> )
                }if (cert.PoolRetirement) {
                    return( <div key={index}>Pool Retirement {JSON.stringify(cert.PoolRetirement)}</div> )
                }if (cert.GenesisKeyDelegation) {
                    return( <div key={index}>Genesis Key Delegation {JSON.stringify(cert.GenesisKeyDelegation)}</div> )
                }if (cert.MoveInstantaneousRewardsCert) {
                    return( <div key={index}>Move Instantaneous Rewards Cert {JSON.stringify(cert.MoveInstantaneousRewardsCert)}</div> )
             }   

                            })}</span></div></div> : ""}

               {transaction.withdrawals && <div className="pendingTxData"> <div > <h4>Withdrawals: </h4> <span> {JSON.stringify( transaction.withdrawals)} </span></div> </div>}
               {transaction.update &&  <div className="pendingTxData"> <div > <h4> Update:</h4> <span>  {transaction.update} </span></div> </div> }
               {transaction.auxiliary_data_hash && <div className="pendingTxData"> <div > <h4>Auxiliary Data Hash:</h4> <span>  {transaction.auxiliary_data_hash} </span></div> </div>}
                {transaction.validity_start_interval &&  <div className="pendingTxData"> <div > <h4>Validity Start Interval: </h4> <span>  {transaction.validity_start_interval} </span></div> </div>}

              {transaction.script_data_hash &&  <div className="pendingTxData"> <div > <h4>Script Data Hash: </h4> <span>  {transaction.script_data_hash} </span></div> </div>}

              {transaction.collateral && <div key={collateralUtXos}> <div > <span>  {collateralUtXos.map((input, index) =>{ TransactionInput(input)})} </span></div> </div>}
              
              {transaction.collateral_return && <div className="pendingTxData"> <div > <h4>Collateral Return: </h4> <span>  {TransactionOutput(transaction.collateral_return)} </span></div> </div>}
              { transaction.total_collateral &&   <div className="pendingTxData"> <div > <h4>Total Collateral: </h4> <span>  {transaction.total_collateral} </span></div> </div> } 
              {transaction.invalid_before &&  <div className="pendingTxData"> <div > <h4>Invalid Before:</h4> <span>  {transaction.invalid_before} </span></div> </div>}
              {transaction.invalid_hereafter &&  <div className="pendingTxData"> <div > <h4>Invalid Hereafter:  </h4> <span> {transaction.invalid_hereafter} </span></div> </div>}
              {transaction.required_scripts &&  <div className="pendingTxData"> <div > <h4>Required Scripts: </h4> <span>  {transaction.required_scripts.map((script) => <div key={script}> {script}</div>)} </span></div> </div>}                         

              {collateralUtXos.length !== 0  && <div  className="pendingTxReferenceInputs"> <div > <h3>Collateral: </h3> <span> {collateralUtXos.map((input, index) =>
                         TransactionInput(input)
                         )} </span></div> </div>}
              

              { transaction.reference_inputs !== null &&  <div className="pendingTxReferenceInputs"> <div > <h3>Reference Inputs: </h3> <span >  {referenceInputsUtxos.map((referenceInput) =>
                       TransactionInput(referenceInput)  
                    )} </span></div> </div>}
            {transaction.required_signers &&  <div className="pendingTxData"> <div > <h4>Required Signers: </h4> <span className="pendingTxsDetailsSigners">   {transaction.required_signers.map((signer => <div key={signer}>{signer} </div>))} </span></div> </div>}
            {transaction.mint && <div > <div > <h4> Mint/Burn: </h4>                
                    {Object.keys(mintAssets).map( (asset) => <TokenElement key={asset} tokenId={asset} amount={mintAssets[asset]}/>) } </div> </div>}
                    
       
            </div>
            </div>
            );
    }


    return (
        <div className="pedningTx">

             <br/>
            {inputUtxos.length !== 0 ? "" /*transactionBalance(txDetails)*/ : ""}

            <div className="pendingTx_signers">
            
            {showDetails && transactionBalance(txDetails)}
            {showDetails && TransactionDetails(txDetails)}
            </div>
                </div>
    )
}

export default PendingTx