import React from "react";
import { useState } from "react";

function MWalletThumb(props) {
  const { wallet  } = props;
  

  
  
  return (
    <div className="MWalletThumb" onClick={() => props.root.selectWallet(props.index)}> 
      {wallet.getAddress()}
        <div>{(wallet.getBalance()/1000000).toFixed(2)}tA</div>
        
        
      </div>
  );
  
}


export default MWalletThumb;