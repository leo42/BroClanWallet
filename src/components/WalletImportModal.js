import React from "react";
import "./WalletImportModal.css";
import { ReactComponent as DeleteIcon } from '../html/assets/delete.svg';
import { ReactComponent as ImportIcon } from '../html/assets/import.svg';
import { ReactComponent as DetailsIcon } from '../html/assets/details.svg';


function WalletImportModal(props) {

  const [ showingDetails, setshowingDetails] = React.useState("");
  const showDetails = (key) => {
    if (showingDetails === key) {
      setshowingDetails("");
    } else {
      setshowingDetails(key);
    }
  };
  const [hovering, setHovering] = React.useState("");

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
      <div className="modalContainer"  >
      <div className="walletImportModalContainer"  >
      <div className="title">Wallets</div>
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              props.setOpenModal(false);
            }}>X
          </button>
        </div>
  
        
        <div className="body">
         
          {props.root.state.pendingWallets && Object.keys(props.root.state.pendingWallets).length > 0 ? (
            <div>
              
                {Object.keys(props.root.state.pendingWallets).map((key) => {

                  return (
                    <div key={key} className="walletDetailsContainer">
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
                     
                      <div  onMouseEnter={() => setHovering("delete")} onMouseLeave={() => setHovering("") } onClick={() => {
                            props.root.deleteImportedWallet(key);
                          }}  className='iconWraper deleteButton'>
                      <DeleteIcon className="icon"  alt="deleteIcon" />
                      {  hovering === "delete" &&  <label className='iconLabel'>Delete</label> }
                      < br/>   
                      </div>
                     
                      <div  onMouseEnter={() => setHovering("details")} onMouseLeave={() => setHovering("") } onClick={() => {
                            showDetails(key);
                          }}  className='iconWraper detailsButton'>
                      <DetailsIcon className="icon"  alt="detailsIcon" />
                      {  hovering === "details" &&  <label className='iconLabel'>Details</label> }
                      < br/>   
                      </div>   
                        
                      <div  onMouseEnter={() => setHovering("import")} onMouseLeave={() => setHovering("") } onClick={() => {
                            props.root.importPendingWallet(key);
                          }}  className='iconWraper importButton'>
                      <ImportIcon className="icon"  alt="importIcon" />
                      {  hovering === "import" &&  <label className='iconLabel'>Import</label> }
                      < br/>   
                      </div>
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
        <div className="footer">
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
      </div>
  );
}

export default WalletImportModal;