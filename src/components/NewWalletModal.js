import React from "react";
import { useState} from 'react';
import "./NewWalletModal.css"
import { ReactComponent as ImportIcon } from "../html/assets/import.svg";
import { ReactComponent as CreateIcon } from "../html/assets/newWallet.svg";
import { ToastContainer, toast } from 'react-toastify';
// import "./NewWalletModal.css"

function NewWalletModal(props) {
  const [addWalletOpen, setAddWalletOpen] = useState(false);

  const importWallet = (event) => {
    try {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileText = e.target.result;
      console.log(fileText);
      try {
        props.root.addWallet(JSON.parse(fileText),"Imported Wallet");
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
  props.root.showModal("createWallet");
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
                <CreateIcon className="icon"  alt="signicon" />  
            </div>  
            <input type="file" id="file-picker" hidden={true} onChange={importWallet}></input>
            <div   onClick={() => document.getElementById("file-picker").click()}  className='createWalletIconWraper importWalletIcon'>
                <ImportIcon className="icon"  alt="signicon" />  
            </div>  
            
          </div>


        </div>
      </div>
  );
}

export default NewWalletModal;