import React from "react";
import "./WalletPicker.css";
import { useState} from 'react';

interface WalletPickerProps {
  setOpenModal: (modal: string) => void;
  operation: (wallet: string) => void;
}

function WalletPicker({ setOpenModal, operation }: WalletPickerProps) {
    let Wallets = []

   if (window.cardano) for (const [key, value] of Object.entries(window.cardano)) {
        if (value.icon && key !== "ccvault" && key !== "typhoncip30" ){
            Wallets.push(key)
        }
      }
  
    const submit = (e: string) => {
      operation(e)
      close()
    }


    const close = () => {
      console.log("close")
      setOpenModal("")
    }

  let wal =  Wallets.map( (item, index) => 
  <div className="walletOption" key={index}>

    <div className="walletOptionBtn" onClick={ () => submit(item)} >
        {item}
        {<img className="walletOptionImg" src={window.cardano[item].icon} />}    
    </div>
    </div>)

  return (
    <div className="modalBackground" onClick={close}>
      <div className="modalContainer"  onClick={ (e) => e.stopPropagation()}   >
        <div className="titleCloseBtn">
          <button


            onClick={close}
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