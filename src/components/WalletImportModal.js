import React from "react";
import "./WalletImportModal.css";


function WalletImportModal(props) {

  const [ showingDetails, setshowingDetails] = React.useState("");
  const showDetails = (key) => {
    if (showingDetails === key) {
      setshowingDetails("");
    } else {
      setshowingDetails(key);
    }
  };

  const walletJson = (json) => {
    const formattedData = JSON.stringify(json, null, 2);

    return (
      <div className="ImportWalletJsonInner" style={{ whiteSpace: 'pre-wrap' }}>
        {formattedData}
      </div>
    );

  };

  const deleteWallet = (key) => {
    props.root.deletePendingWallet(key);
  };

  const importWallet = (key) => {
    props.root.importPendingWallet(key);
  };

  return (
    <div className="modalBackground" >
      <div className="walletImportModalContainer"  >
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              props.setOpenModal(false);
            }}>X
          </button>
        </div>
  
        <div className="title">
        </div>
        <div className="body">
         

          </div> 
        <div className="">
          {props.root.state.pendingWallets && Object.keys(props.root.state.pendingWallets).length > 0 ? (
            <div>
              <div className="">Wallets</div>
                {Object.keys(props.root.state.pendingWallets).map((key) => {

                  return (
                    <div key={key} className="">
                      <div className="">{key}</div>
                    
                       <span className="DateCreated"> Created:  { new Date(props.root.state.pendingWallets[key].creationTime).toLocaleString()}</span>
                      {showingDetails === key && (
                        <div className="">
                          <div className="">
                            <span className="">Json:</span>
                            {/* show the json object as a pretty Json */}


                            <span className="ImportWalletJson">{walletJson(props.root.state.pendingWallets[key].json)}</span>
                          </div>
                        </div>
                      )} 
                      <div className="ImportWalletButtons">
                      <button onClick={() => {
                            props.root.deleteImportedWallet(key);
                          }}>Delete</button>
                      <button onClick={() => {
                            showDetails(key);
                          }}>Details</button>
                        <button
                          onClick={() => {
                            props.root.importPendingWallet(key);
                          }}>
                          Import
                        </button>
                        </div>
                      </div>
     
                  );
                })}
              </div>
          ) : (
            ""
          )
                }
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
  );
}

export default WalletImportModal;