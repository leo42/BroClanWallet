import React from "react";
import WalletPicker from "./WalletPicker"


function MWalletPendingTxs(props) {
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);

    async function signWithLocalWallet(wallet){
        const api = await window.cardano[wallet].enable()
        const signature = await api.signTx(props.tx.tx.toString() ,true)
        props.root.addSignature(signature)
      }  
      
    const txDetails = props.root.state.wallets[props.root.state.selectedWallet].decodeTransaction(props.tx.tx)
    console.log(txDetails)


    return (
        <div className="pedningTx">
             {walletPickerOpen && <WalletPicker setOpenModal={setWalletPickerOpen} operation={signWithLocalWallet} tx={props.tx}/>}
            {props.tx.tx.toString()}
            <button onClick={() => setWalletPickerOpen(true)} >add signature</button>
            {props.tx.signatures.map((signature, index) =>(
                <div key={index}>{signature}</div>

            ))}
            <button onClick={() => props.root.submit(props.tx)} >Submit</button>
        </div>
    )
}

export default MWalletPendingTxs