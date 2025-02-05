import React from "react";
import "./NewWalletModal.css"
import { ReactComponent as ImportIcon } from "../../html/assets/import.svg";
import { ReactComponent as CreateIcon } from "../../html/assets/newWallet.svg";
import {  toast } from 'react-toastify';
import MultisigContainer from "./MultisigContainer";
// import "./NewWalletModal.css"

function NewWalletModal(props: { moduleRoot: MultisigContainer, setOpenModal: (open: boolean) => void }) {

  const importWallet = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {

    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileText = e.target?.result;
      if (!fileText) {
        toast.error("No file content");

        return;
      }
      try {
        props.moduleRoot.addWallet(JSON.parse(fileText as string),"Imported Wallet");

        props.setOpenModal(false);
      }catch (error) {
          toast.error("Invalid Wallet File");
        }    
      }
    
      reader.readAsText(file)
      
    } catch (error) {
      toast.error("Invalid Wallet File");
    }    

}
const createWallet = () => {
  props.moduleRoot.showModal("createWallet");
}
  return (
    <div className="modalBackground" onClick={() => props.setOpenModal(true)} >
      <div className="modalContainer" onClick={ (e) => e.stopPropagation()} >
     
      <div className="titleCloseBtn">
          <button
            onClick={() => {
              props.setOpenModal(false);
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
            <input type="file" id="file-picker" hidden={true} onChange={importWallet}></input>
            <div   onClick={() => document.getElementById("file-picker")?.click()}  className='createWalletIconWraper importWalletIcon'>

                <ImportIcon className="icon"  />  
            </div>  
            

          </div>


        </div>
      </div>
  );
}

export default NewWalletModal;