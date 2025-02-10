import { Assets, UTxO } from "@lucid-evolution/lucid/dist";
import React, { useEffect } from "react";
import TokenElement from "./TokenElement";

function TransactionInput(input: UTxO, isAddressMine : (address: string) => boolean){
    return (
 <div key={input.txHash+input.outputIndex} className="txDetailsInput">
                     <p > <span className={isAddressMine(input.address) ? "txDetailsAddressMine" : "txDetailsAddressNotMine"}> {input.address ? input.address : "None" }</span> <br/>

                      Transaction ID: {input.txHash} | Index: {input.outputIndex}</p>

                {Object.keys( input.assets).map( (asset,index) =><TokenElement className="pendingTxTokenContainer"  key={index} tokenId={asset} amount={Number(input.assets[asset])}/> )}
                    

                    {input.datumHash &&  <div className="pendingTxData"> <div > <h4>Datum Hash:</h4><span >  {input.datumHash}</span> </div> </div>}
                     { input.datum &&<div className="pendingTxData"> <div > <h4>Datum:</h4> <span > {JSON.stringify(input.datum,null,2) }</span> </div> </div>}
                    {input.scriptRef &&  <div className="pendingTxData"> <div > <h4>Script Reference:</h4><span >  { JSON.stringify(input.scriptRef,null,2)}</span></div> </div> }
          </div>
    )
}

function transformAmount(amount: any): { [key: string]: bigint } {
    const amountOut: { [key: string]: bigint } = {};
    amountOut["lovelace"] = BigInt(amount.coin);

    if (amount.multiasset && amount.multiasset.size > 0) {
        // Iterate over the multiasset Map
        amount.multiasset.forEach((assetsMap: Map<string, bigint>, policy: string) => {
            // Iterate over the assets Map
            assetsMap.forEach((value: bigint, asset: string) => {
                amountOut[policy + asset] = value;
            });
        });
    }
    return amountOut;
}

function TransactionOutput(output: { amount: { [key: string]: string }; address: string; datum: any; script_ref: any; }, isAddressMine : (address: string) => boolean){
    const amount = transformAmount(output.amount)
    return (

                <div key={JSON.stringify(output)} className="txDetailsOutput">
                    <p className={isAddressMine(output.address ) ? "txDetailsAddressMine" : "txDetailsAddressNotMine"}>{output.address}</p>
                    {Object.keys(amount).map((key, index) => (
                                    <TokenElement className="pendingTxTokenContainer" key={index} tokenId={key} amount={Number(amount[key])}/>
                   ))}
                   {output.datum && <div className="pendingTxData"> <div > <h4>Datum:</h4> <span>{JSON.stringify(output.datum, null, 2)} </span> </div></div>  }
                    {output.script_ref &&<div className="pendingTxData">  <div>  <h4>Script Ref:</h4> <span>{JSON.stringify( output.script_ref, null, 2)}</span> </div></div>}
                </div>
                )
}

function mintToAssets(mint: any) : Assets{
    const assets = {} as Assets
    Object.keys(mint).forEach((policy: string) => {
        Object.keys(mint[policy]).forEach((asset: string) => {
            (assets as {[key: string]: bigint})[policy + asset] = BigInt(mint[policy][asset])


        })
    })
    return assets
    }


 function TransactionDetails( utxos : {inputUtxos : UTxO[], collateralUtxos : UTxO[], referenceInputsUtxos : UTxO[]}, isAddressMine : (address: string) => boolean, transaction: { mint: any; outputs: any[]; fee: number; ttl: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; network_id: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; certs: any[]; withdrawals: any; update: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; auxiliary_data_hash: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; validity_interval_start: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; script_data_hash: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; collateral_return: any; total_collateral: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; invalid_before: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; invalid_hereafter: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; required_scripts: any[]; reference_inputs: any; required_signers: any[]; }){
    

    const { inputUtxos, collateralUtxos, referenceInputsUtxos } = utxos;


    const mintAssets = transaction.mint ? mintToAssets(transaction.mint) : {};

    return (
        <div>
            <div className="txDetailsInputsOutputs">
                <div className="txDetailsInputs">
                    <h3>Inputs: </h3>
                    {inputUtxos.map((input, index) => (
                        TransactionInput(input, isAddressMine)
                    ))}
                </div>
                <div className="txDetailsOutputs">
                    <h3>Outputs:</h3>
                    {transaction.outputs && transaction.outputs.map((output: any, index: any) =>
                        TransactionOutput(output, isAddressMine)
                    )}
                </div>
            </div>
            <div className="txDetailsSmall">

                <div><h3>Fee:</h3> {transaction.fee / 1_000_000}{transaction.network_id === 1 ? "₳" : "t₳"}</div>
                {transaction.ttl && <div><h3>TTL:</h3> {transaction.ttl}</div>}
                {transaction.network_id && <div><h3>Network:</h3> {transaction.network_id}</div>}

            </div>
            <div className="txDetailsMain">
                {transaction.certs && <div className="pendingTxData"><div><h4>Certificates:</h4><span>{transaction.certs.map((cert: { StakeDelegation?: any; StakeRegistration?: any; UnregCert?: any; PoolRegistration?: any; PoolRetirement?: any; GenesisKeyDelegation?: any; MoveInstantaneousRewardsCert?: any; StakeRegDelegCert?: any; StakeVoteDelegCert?: any; }, index: React.Key | null | undefined) => {
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

                {transaction.collateral_return && <div className="pendingTxData"><div><h4>Collateral Return:</h4><span>{TransactionOutput(transaction.collateral_return, isAddressMine)}</span></div></div>}
                {transaction.total_collateral && <div className="pendingTxData"><div><h4>Total Collateral:</h4><span>{transaction.total_collateral}</span></div></div>}

                {transaction.invalid_before && <div className="pendingTxData"><div><h4>Invalid Before:</h4><span>{transaction.invalid_before}</span></div></div>}
                {transaction.invalid_hereafter && <div className="pendingTxData"><div><h4>Invalid Hereafter:</h4><span>{transaction.invalid_hereafter}</span></div></div>}
                {transaction.required_scripts && <div className="pendingTxData"><div><h4>Required Scripts:</h4><span>{transaction.required_scripts.map((script: any) => <div key={script}>{script}</div>)}</span></div></div>}


                {collateralUtxos.length !== 0 && <div className="pendingTxReferenceInputs"><div><h3>Collateral:</h3><span>{collateralUtxos.map((input, index) =>
                    TransactionInput(input, isAddressMine)
                )}</span></div></div>}


                {transaction.reference_inputs && <div className="pendingTxReferenceInputs"><div><h3>Reference Inputs:</h3><span>{referenceInputsUtxos.map((referenceInput) =>
                    TransactionInput(referenceInput, isAddressMine)
                )}</span></div></div>}
                {transaction.required_signers && <div className="pendingTxData"><div><h4>Required Signers:</h4><span className="pendingTxsDetailsSigners">{transaction.required_signers.map((signer: any) => <div key={signer}>{signer}</div>)}</span></div></div>}
                {transaction.mint && <div><div><h4>Mint/Burn:</h4>

                    {Object.keys(mintAssets).map((asset: any) => <TokenElement key={asset} tokenId={asset} amount={Number(mintAssets[asset])} />)}</div></div>}
            </div>
        </div>
    );



}

export {TransactionDetails, transformAmount}