import React from 'react';

import "./WalletList.css"

function WalletList (props) {

    return (
    <div className='WalletListContainer multisigWalletListContainer'>
        <select className="MWalletList" value={props.moduleRoot.state.selectedWallet} onChange={(event) => props.moduleRoot.selectWallet(event.target.value)}>

        {props.moduleRoot.state.wallets.map( (item, index) => (
               <option key={index} value={index}> {item.getName()}-{String((item.getBalance()/1000000).toFixed(2))}{props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  } </option>
        ))}

    </select>


<button className={"addWalletButton" + ( props.moduleRoot.state.wallets.length === 0 ? " addWalletButtonHighlight" : " ") } onClick={ () => props.moduleRoot.showModal("newWallet")}>+</button>

    </div>
    );
    
}
 
export default WalletList;