import React, { useEffect }     from "react";
import TokenElement from "./TokenElement";
import { TxOutput , UTxO , TxSignBuilder, Assets } from "@lucid-evolution/lucid";
import {  toast } from 'react-toastify';
import { ReactComponent as SignIcon } from "./../html/assets/sign.svg";
import { ReactComponent as ImportSigIcon } from "./../html/assets/importSig.svg";
import { ReactComponent as ExpandIcon } from "./../html/assets/details.svg";
import copyTextToClipboard from "../helpers/copyTextToClipboard";
import "./PendingTx.css"
import WalletInterface from "../core/WalletInterface";
import {TransactionDetails, transformAmount} from "./TxDetails";
import normalizeTxDetails from "../helpers/normalizeTxDetails";
import SmartWalletContainer from "./SmartWallet/SmartWalletContainer";
import MultiWalletContainer from "./Multisig/MultisigContainer";

interface WalletPendingTxProps {
  moduleRoot: MultiWalletContainer | SmartWalletContainer;
  wallet: WalletInterface;
  tx: { tx: TxSignBuilder, signatures: Record<string, string> };
  index: number;
  root: any;

}

function WalletPendingTx(props: WalletPendingTxProps) {
    const [ hovering, setHovering] = React.useState("");
    const [importSig, setImportSig] = React.useState(false);
    const [importedTx, setImportedTx] = React.useState("");
    const [showDetails, setShowDetails] = React.useState(false);
    const [inputUtxos, setInputUtxos] = React.useState<UTxO[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [collateralUtxos, setCollateralUtxos] = React.useState<UTxO[]>([]);
    const [referenceInputsUtxos,    setReferenceInputsUtxos] = React.useState<UTxO[]>([]);

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
    const txId = props.moduleRoot.state.wallets[props.moduleRoot.state.selectedWallet].getPendingTxId(props.index)
    useEffect(() => {
        // get Utxo for each input
        props.wallet.getUtxosByOutRef(txDetails.inputs).then( (utxos : UTxO[]) => {
            setInputUtxos(utxos)
            setLoading(false)
        })

        txDetails.collateral ? props.wallet.getUtxosByOutRef(txDetails.collateral).then( (utxos : UTxO[]) => {
            setCollateralUtxos(utxos)
            }) : setCollateralUtxos([])

        txDetails.reference_inputs ? props.wallet.getUtxosByOutRef(txDetails.reference_inputs).then( (utxos) => {
            setReferenceInputsUtxos(utxos)
            }) : setReferenceInputsUtxos([])

    }, [])


    const signaturesCompleted : boolean= txDetails.signatures.every((signature: any) => signature.haveSig === true);



    function transactionBalance(transaction: { outputs: any[]; withdrawals: {[key: string]: bigint} }){
        const BalancesOut = {} as {[key: string]: bigint}
        inputUtxos.map( (input, index) => {
           if ( props.wallet.isAddressMine(input.address)) {
           Object.keys( input.assets).map( (asset: string) => 
                asset in BalancesOut ? BalancesOut[asset] -= BigInt(input.assets[asset]) :  BalancesOut[asset] =- BigInt(input.assets[asset])
            )}})

        transaction.outputs.map( (output: { address: string; amount: any; }, index: any) => {
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






    async function signWithLocalWallet(wallet: string | number){
        try{
        const api = await window.cardano[wallet].enable()
        const signature = await api.signTx(props.tx.tx.toCBOR() ,true)
        props.moduleRoot.addSignature(signature)
        }catch(error: any){
            if(error.message){
                toast.warning(error.message);
            }else{
                toast.warning(error.toString());
            }
        }


      }  
      
    function copySignature(signature: string){
        copyTextToClipboard(signature)
        toast.info("Signature copied to clipboard")
    }

    function copyTransaction(){
        copyTextToClipboard(props.tx.tx.toCBOR())
        toast.info("Transaction copied to clipboard")
    }


    function importSigniture(){
        try{
            props.moduleRoot.addSignature(importedTx);
            setImportSig(false);
        }catch(error : any){
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
             {props.wallet.getTransactionType(txDetails)}
             <br/>
             <br/>
             <span className="txId" style={{fontWeight: "bold" }}>TxId: </span>{txId}

            {inputUtxos.length !== 0 ? transactionBalance(txDetails) : ""}

            <div className="pendingTx_signers">
            <h4 >Signatures:</h4>
            {txDetails.signatures.map( (item: { haveSig: any; keyHash: string; }, index: React.Key | null | undefined) => (
                <div key={index} className={"pendingTx_signer"+ (item.haveSig ? " pendingTx_signer_signed" : "")} >
                   
                    {item.haveSig ? <span className="pendingTxCompletedSig">{props.moduleRoot.getSignerName(item.keyHash)} Signed <svg className="copyIcon" onClick={() => copySignature(props.wallet.getSignature(props.index,item.keyHash))}  id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg> </span> :
                      <span className="pendingTxMissingSig"> Signature missing for: {props.moduleRoot.getSignerName(item.keyHash)}</span> }
                </div>))}


            {showDetails && TransactionDetails({inputUtxos, collateralUtxos, referenceInputsUtxos}, (address: string) => props.wallet.isAddressMine(address), txDetails)}
            </div>
            <div className="pendingTx_buttons">


            { loading === false &&<div  onMouseEnter={() => setHovering("sign")} onMouseLeave={() => setHovering("") } onClick={signTransaction}  className='iconWraper detailsButton'>
                <SignIcon className="icon"  />
                {  (hovering === "sign" || isMobile) &&  <label className='iconLabel'>Sign</label> }
            </div>  }
                            

            <div  onMouseEnter={() => setHovering("importSig")} onMouseLeave={() => setHovering("") } onClick={()=> setImportSig(!importSig)}  className='iconWraper importSigButton'>
                <ImportSigIcon className="icon"  />
                {  ( hovering === "importSig" || isMobile)  &&  <label className='iconLabel'>Import Sig</label> }
            </div>  
              

            <div  onMouseEnter={() => setHovering("Details")} onMouseLeave={() => setHovering("") } onClick={() => setShowDetails(!showDetails)}  className='iconWraper txDetailsButton'>
                <ExpandIcon className="icon"  />
                { ( hovering === "Details" || isMobile)  &&  <label className='iconLabel'>Details</label> }
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