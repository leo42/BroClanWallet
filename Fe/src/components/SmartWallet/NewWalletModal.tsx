import React from "react";
import { ReactComponent as ImportIcon } from "../../html/assets/import.svg";
import { ReactComponent as CreateIcon } from "../../html/assets/newWallet.svg";
import {  toast } from 'react-toastify';
import SmartWalletContainer from "./SmartWalletContainer";
// import "./NewWalletModal.css"

function NewWalletModal(props: { moduleRoot: SmartWalletContainer, showModal: (modal: string) => void }) {

  const importWallet = () => {
    try {

      props.moduleRoot.showModal("importWallet");
      
    } catch (error) {
      toast.error("Invalid Wallet File");
    }    

}
const createWallet = () => {
  props.moduleRoot.showModal("minting");
}
  return (
    <div className="modalBackground" onClick={() => props.showModal("newWallet")} >
      <div className="modalContainer" onClick={ (e) => e.stopPropagation()} >
     
      <div className="titleCloseBtn">
          <button
            onClick={() => {
              props.showModal("newWallet");
            }}
          >X
          </button>
        </div>
        <div className="title">
     
          </div>
          <div className="inputContainer">
          <div   onClick={createWallet}  className='createWalletIconWraper createWalletButton'>
                <CreateIcon className="icon"  />  
            </div>  
            <div   onClick={() => importWallet()}  className='createWalletIconWraper importWalletIcon'>

                <ImportIcon className="icon"  />  
            </div>  
        
          </div>

        </div>
      </div>
  );
}

export default NewWalletModal;