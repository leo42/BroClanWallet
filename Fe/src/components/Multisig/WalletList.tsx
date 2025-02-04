import React, { useState } from 'react';
import { ReactComponent as ExpandIcon } from '../../html/assets/settings.svg';
import WalletSettings from './walletSettings';
import "./WalletList.css"



function WalletList (props: {moduleRoot: any,  root: any}) {
    const [walletSettingsOpen, setWalletSettingsOpen] = useState(false);

    return (
        <div style={{height: "0px"}}>
      {  walletSettingsOpen ? <WalletSettings moduleRoot={props.moduleRoot} wallet={props.moduleRoot.state.wallets[props.moduleRoot.state.selectedWallet]} closeSettings={() => setWalletSettingsOpen(false)}/> : ""}
    <div className='WalletListContainer multisigWalletListContainer'>
        <button className={"addNewWalletButton" + ( props.moduleRoot.state.wallets.length === 0 ? " addWalletButtonHighlight" : " ") } onClick={ () => props.moduleRoot.showModal("newWallet")}>+</button>
        <select className="MWalletList" value={props.moduleRoot.state.selectedWallet} onChange={(event) => props.moduleRoot.selectWallet(event.target.value)}>

        {props.moduleRoot.state.wallets.map( (item: any, index: any) => (
            <option key={index} value={index}> {item.getName()}-{String((item.getBalance()/1000000).toFixed(2))}{props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  } </option>
        ))}

    </select>
      {        
        <button className={"addNewWalletButton" }>
             <ExpandIcon className="walletSettingsIcon" onClick={() =>setWalletSettingsOpen(!walletSettingsOpen)}/> 
         </button>}
        </div>

    </div>
    );
    
}
 
export default WalletList;