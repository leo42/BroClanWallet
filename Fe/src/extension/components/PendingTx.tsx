import React, { useEffect }     from "react";
import TokenElement from "../../components/TokenElement";
import "../../components/PendingTx.css"
import "./PendingTx.css"
import "../../App.css"
import "../../components/TokenElement.css"
import { TransactionDetails, transformAmount } from "../../components/TxDetails";
import normalizeTxDetails from "../../helpers/normalizeTxDetails";


function PendingTx(props : {tx: any}) {
    const [showDetails, setShowDetails] = React.useState(false);
    const [inputUtxos, setInputUtxos] = React.useState([]);
    const [txDetails, setTxDetails] = React.useState<any>({});
    const [collateralUtxos, setCollateralUtxos] = React.useState([]);
    const [referenceInputsUtxos,    setReferenceInputsUtxos] = React.useState([]);
    const [isMobile, setIsMobile] = React.useState(false);
    const [stakingAddress, setStakingAddress] = React.useState<string>("");
    const [address , setAddress] = React.useState({ } as {[key: string]: boolean})
    const [loading, setLoading] = React.useState(true);

    async function getUtxosByOutRef(outRefs: any){


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

    
    const isAddressMine = (addressCheck: string) => {
        if(Object.keys(address).includes(addressCheck)){
            return address[addressCheck]
        }else{
            return false
        }
    }

    const checkAddress = async (newAddress: string[]) => {
            //remove duplicates
            newAddress = [...new Set(newAddress)]

            const addressMine = await chrome.runtime.sendMessage({ action: 'isAddressMine', address: JSON.stringify(newAddress) }) 
            
        
            setAddress(JSON.parse(addressMine)) 
    
    }

    useEffect(() => {

        async function getTxDetails(){
            const txDetails = normalizeTxDetails(JSON.parse(await  chrome.runtime.sendMessage({ action: 'decodeTx', tx: JSON.stringify(props.tx) })))
            setTxDetails(txDetails)
            const addressFound: string[] = []
            await getUtxosByOutRef(txDetails.inputs).then( (utxos: any) => {


                setInputUtxos(utxos)
                utxos.map( (utxo: any) => {
                    addressFound.push(utxo.address)
                })
            })


            await txDetails.collateral ? getUtxosByOutRef(txDetails.collateral).then( (utxos) => {
                setCollateralUtxos(utxos)
                utxos.map( (utxo: any) => {
                    addressFound.push(utxo.address)
                })

            }) : setCollateralUtxos([])
            
            await txDetails.reference_inputs ? getUtxosByOutRef(txDetails.reference_inputs).then( (utxos) => {
                setReferenceInputsUtxos(utxos)
                utxos.map( (utxo: any) => {
                    addressFound.push(utxo.address)
                })

            }) : setReferenceInputsUtxos([])
            
            await txDetails.outputs.map( (output: any) => {
                addressFound.push(output.address)
            })
           // const stakingAddress =JSON.parse(await  chrome.runtime.sendMessage({ action: 'getRewardAddresses'}))


            setStakingAddress(stakingAddress)

            await checkAddress(addressFound)
            setLoading(false)
        }
        getTxDetails()

        setShowDetails(true)
    }, [])

    function getStakingAddress(){
        return txDetails.withdrawals.staking
    }
    
    function transactionBalance(transaction: any){
        const BalancesOut = {} as {[key: string]: bigint}
        console.log(transaction)
        inputUtxos?.map( (input: any, index: number) => {
           if ( isAddressMine(input.address)) {
           Object.keys( input.assets).map( (asset: string) => 


                asset in BalancesOut ? BalancesOut[asset] -= BigInt(input.assets[asset]):  BalancesOut[asset] =- BigInt(input.assets[asset])
            )}})

        transaction.outputs?.map( (output: any, index: number) => {
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

    return (
        <div className="pedningTx">
            {loading ? <div className="loading">Loading...</div> : 

            <div className="pendingTx_signers">
            
            {showDetails && transactionBalance(txDetails)}
            {showDetails && TransactionDetails({inputUtxos, collateralUtxos, referenceInputsUtxos}, (address) => isAddressMine(address), txDetails  )}
            </div>
            }
                </div>

    )
}

export default PendingTx