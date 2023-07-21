import React from 'react';

import "./WalletList.css"

function WalletList (props) {

    return (
            <div className='WalletListContainer'>
        <select className="MWalletList" onChange={(event) => props.moduleRoot.selectWallet(event.target.value)}>

        {props.moduleRoot.state.wallets.map( (item, index) => (
               <option key={index} value={index}> {item.getName()}-{String((item.getBalance()/1000000).toFixed(2))}tA</option>
        ))}

    </select>


<button className={"addWalletButton" + ( props.moduleRoot.state.wallets.length === 0 ? " addWalletButtonHighlight" : " ") } onClick={ () => props.moduleRoot.showModal("newWallet")}>+</button>

    </div>
    );
    
}
 
export default WalletList;