import React from "react";
import "./SettingsModal.css";

function WalletImportModal(props) {
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
         
        <div className="footer">
         <button
            onClick={() => {
              applyNetworkSettings();
            }}
            id="applyButton">
            Apply
          </button>
          <br/>          
          <br/>

          </div> 
        <div className="sendAll">
          <label htmlFor="sendAll">Enable Send All</label>
           <input type="checkbox" id="sendAll" name="sendAll" checked={props.root.state.settings.sendAll} value={props.root.state.settings.sendAll} onChange={ () => props.root.toggleSendAll()} />
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

export default WalletImportModal;