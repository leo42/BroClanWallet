import React from 'react';
import NewWalletModal   from './NewWalletModal';

import "./WalletList.css"

function WalletList (props) {
    const [addWalletOpen, setAddWalletOpen] = React.useState(false);

    return (
            <div className='WalletListContainer'>
        {addWalletOpen && <NewWalletModal setOpenModal={setAddWalletOpen} root={props.root} />}
        <select className="MWalletList" onChange={(event) => props.root.selectWallet(event.target.value)}>

        {props.root.state.wallets.map( (item, index) => (
               <option key={index} value={index}> {item.getName()}-{String((item.getBalance()/1000000).toFixed(2))}tA</option>
        ))}

    </select>

<button className={"addWalletButton" + ( props.root.state.wallets.length === 0 ? " addWalletButtonHighlight" : " ") } onClick={ () => setAddWalletOpen(true)}>+</button>

    </div>
    );
    
}
 
export default WalletList;