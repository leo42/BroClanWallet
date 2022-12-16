import React from 'react';
import MWalletThumb from "./MWalletThumb";

function WWalletList (props) {
    const { wallets  } = props;
    
    return (
        <div className="MWalletList">
        {wallets.map( (item, index) => (
            <MWalletThumb wallet={item} key={index} > </MWalletThumb>
        ))}
    </div>);
    
}
 
export default WWalletList;