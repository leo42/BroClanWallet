import React from "react";
import WalletPicker from "./WalletPicker"


function WalletPendingTxs(props) {
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);

    async function signWithLocalWallet(wallet){
        const api = await window.cardano[wallet].enable()
        const signature = await api.signTx(props.tx.tx.toString() ,true)
        props.root.addSignature(signature)
      }  
      
    const txDetails = props.root.state.wallets[props.root.state.selectedWallet].getPendingTxDetails(props.index)


    return (
        <div className="pedningTx">
             Fee:{txDetails.fee/1000000}<br/>


             {walletPickerOpen && <WalletPicker setOpenModal={setWalletPickerOpen} operation={signWithLocalWallet} tx={props.tx}/>}
            {txDetails.signatures.map( (item, index) => (
                <div key={index} className={"pendingTx_signer"+ (item.haveSig ? " pendingTx_signer_signed" : "")} >Hey { item.name}</div>
            )

             )}
            
            <button onClick={() => setWalletPickerOpen(true)} >add signature</button>
        
            <button onClick={() => props.root.submit(props.index)} >Submit</button>
        </div>
    )
}

export default WalletPendingTxs