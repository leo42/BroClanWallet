import React from "react";


function MWalletPendingTxs(props) {

    return (
        <div className="pedningTx">
            {props.tx.tx.toString()}
            <button onClick={() => props.root.addSignature(props.tx)} >add signature</button>
            {props.tx.signatures.map((signature, index) =>(
                <div>{signature}</div>

            ))}
            <button onClick={() => props.root.submit(props.tx)} >Submit</button>
        </div>
    )
}

export default MWalletPendingTxs