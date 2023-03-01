import React from "react";
import { useState} from 'react';
import AddWalletModal from "./AddWalletModal";
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
  return (
    <div className="modalBackground" >
      <div className="modalContainer"  >
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              props.setOpenModal(false);
            }}
          >
            X
          </button>
        </div>
  
        <div className="title">
        </div>
        <div className="body">
        {addWalletOpen && <AddWalletModal hostModal={props.setOpenModal} setOpenModal={setAddWalletOpen} root={props.root} />}
          <div className="inputContainer">
            <button className='addWalletButton' onClick={ () => setAddWalletOpen(true)}>Create new Wallet</button>
            <br/>
            <input type="file" id="file-picker" hidden={true} onChange={importWallet}></input>
            <button className='addWalletButton' onClick={() => document.getElementById("file-picker").click()}>Import Wallet</button>

          </div>

          
        <div className="footer">
         
          </div> 
        
          <button
            onClick={() => {
              props.setOpenModal(false);
            }}
            id="cancelBtn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewWalletModal;