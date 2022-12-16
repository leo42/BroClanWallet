import React from "react";
import { useState } from "react";

function MWalletThumb(props) {
  const { wallet  } = props;
  
  const [balance, setBalance] = useState("");

  async function loadBalance(){
    setBalance(await wallet.getBalance())
  }
  loadBalance()
  
  return (
    <div className="MWalletThumb" onClick={props.onClick}>
      {wallet.getAddress(balance)}
        <div>{(balance/1000000).toFixed(2)}tA</div>
        
        
      </div>
  );
  
}


export default MWalletThumb;