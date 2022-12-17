import React from "react";
import "./WalletPicker.css";

function AddWalletModal({ setOpenModal, root }) {
  const [WName, setWName] = React.useState('');
  const [json, setJson] = React.useState('');

  function handleSubmit(event){
    event.preventDefault();
    root.addWallet(JSON.parse(json),WName)
    setOpenModal(false)
  }


  return (
    <div className="modalBackground">
      <div className="modalContainer"  >
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              setOpenModal(false);
            }}
          >
            X
          </button>
        </div>
  
        <div className="title">
          <h1>Select Wallet</h1>
        </div>
        <div className="body">
        <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={WName}
          onChange={event => setWName(event.target.value)}
        />
      </label>
      <br />
      <label>
        Json:
        <input 
        className="Json_input_box"
          type="text"
          name="json"
          value={json}
          onChange={event => setJson(event.target.value)}
        />
      </label>
      <br />
      <button type="submit">addWallet</button>
    </form>
            <></>
        </div>
        <div className="footer">
          <button
            onClick={() => {
              setOpenModal(false);
            }}
            id="cancelBtn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddWalletModal;