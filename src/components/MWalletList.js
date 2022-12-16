import React from 'react';
import MWalletThumb from "./MWalletThumb";

function WWalletList (props) {
    const { wallets  } = props;
    
    return (
        <div className="MWalletList">
        {props.root.state.wallets.map( (item, index) => (

            <MWalletThumb wallet={item} key={index} index={index} root={props.root}></MWalletThumb>
        ))}

        <button className='addWalletButton' onClick={ () => props.root.addWallet()}>+</button>

    </div>);
    
}
 
export default WWalletList;