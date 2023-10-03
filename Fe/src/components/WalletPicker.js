import React from "react";
import "./WalletPicker.css";
import { useState} from 'react';

function WalletPicker({ setOpenModal, operation }) {
let Wallets = []
   if (window.cardano) for (const [key, value] of Object.entries(window.cardano)) {
        if (value.icon && key !== "ccvault" && key !== "typhoncip30" ){
            Wallets.push(key)
        }
      }
  
    const submit = (e) => {
      operation(e)
      setOpenModal(false);
    }
  
  let wal =  Wallets.map( (item, index) => 
  <div className="walletOption" key={index}>
    <div className="walletOptionBtn" onClick={ () => submit(item)} >
        {item}
        {<img className="walletOptionImg" src={window.cardano[item].icon} />}    
    </div>
    </div>)

  return (
    <div className="modalBackground" onClick={() => { setOpenModal(false); }}>
      <div className="modalContainer"  onClick={ (e) => e.stopPropagation()}   >
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              setOpenModal(false);
            }}
          >
            X
          </button>
        </div>
  
        <div className="walletPickerTitle">
          <h1>Select Wallet</h1>
        </div>
        <div className="walletPickerBody">
        {wal}
            
        </div>
        <div className="footer">

        </div>
      </div>
    </div>
  );
}

export default WalletPicker;