import React from "react";
import "./WalletImportModal.css";
import { ReactComponent as DeleteIcon } from '../html/assets/delete.svg';
import { ReactComponent as ImportIcon } from '../html/assets/import.svg';
import { ReactComponent as DetailsIcon } from '../html/assets/details.svg';
import MultisigContainer from "./Multisig/MultisigContainer";
import SmartWalletContainer from "./SmartWallet/SmartWalletContainer";
type WalletImportModalProps = {
  moduleRoot: MultisigContainer | SmartWalletContainer;
  setOpenModal: (open: boolean) => void;
};



function WalletImportModal(props: WalletImportModalProps) {


  const [ showingDetails, setshowingDetails] = React.useState("");

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const updateWindowDimensions = () => {
      const newIsMobile = window.innerWidth <= 768;
      if (isMobile !== newIsMobile) {
        setIsMobile(newIsMobile);
      }
    };
    window.addEventListener("resize", updateWindowDimensions);
    updateWindowDimensions();
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, [isMobile]);
  
  const showDetails = (key: string) => {
    if (showingDetails === key) {
      setshowingDetails("");
    } else {
      setshowingDetails(key);
    }
  };
  const [hovering, setHovering] = React.useState("");

  const walletJson = (json: any) => {
    try {
      // If the input is already an object, stringify it
      const jsonString = typeof json === 'string' ? json : JSON.stringify(json);
      // Parse the string to handle escaped characters
      const parsedJson = JSON.parse(jsonString);
      // Pretty print with indentation
      const formattedData = JSON.stringify(parsedJson, null, 2);
      
      return (
        <div className="ImportWalletJsonInner" style={{ whiteSpace: 'pre-wrap' }}>
          {formattedData}
        </div>
      );
    } catch (error) {
      console.error('Error formatting JSON:', error);
      return (
        <div className="ImportWalletJsonInner" style={{ whiteSpace: 'pre-wrap' }}>
          {json}
        </div>
      );
    }
  };
  const deleteAllWallets = () => {
    props.moduleRoot.deleteAllPendingWallets();
    props.setOpenModal(false);
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
         
          {props.moduleRoot.state.pendingWallets && Object.keys(props.moduleRoot.state.pendingWallets).length > 0 ? (
            <div >
              
                {Object.keys(props.moduleRoot.state.pendingWallets).map((key) => {

                  return (
                    <div key={key} className="walletDetailsContainer">
                      {props.moduleRoot.state.pendingWallets[key].walletName && <div className="">{props.moduleRoot.state.pendingWallets[key].walletName}</div>}
                      <div className="">{key}</div>
                    
                       <span className="DateCreated"> Created:  { new Date(props.moduleRoot.state.pendingWallets[key].creationTime).toLocaleString()}</span>
                      {showingDetails === key && (
                        <div className="">
                          <div className="">
                            <span className="">Json:</span>
                            {/* show the json object as a pretty Json */}


                            <span className="ImportWalletJson">{walletJson(props.moduleRoot.state.pendingWallets[key].json ? props.moduleRoot.state.pendingWallets[key].json : props.moduleRoot.state.pendingWallets[key].walletJson)}</span>
                          </div>
                        </div>
                      )} 

                      <div className="ImportWalletButtons">
                     
                      <div  onMouseEnter={() => setHovering("delete"+key)} onMouseLeave={() => setHovering("") } onClick={() => {
                            props.moduleRoot.deleteImportedWallet(key);
                          }}  className='iconWraper deleteButton'>
                      <DeleteIcon className="icon"  />
                      {  (hovering === "delete"+key || isMobile )  &&  <label className='iconLabel'>Delete</label> }
                      < br/>   
                      </div>

                     
                      <div  onMouseEnter={() => setHovering("details"+key)} onMouseLeave={() => setHovering("") } onClick={() => {
                            showDetails(key);
                          }}  className='iconWraper detailsButton'>
                      <DetailsIcon className="icon"  />
                      {  (hovering === "details"+key || isMobile )  &&  <label className='iconLabel'>Details</label> }
                      < br/>   
                      </div>   

                        
                      <div  onMouseEnter={() => setHovering("import"+key)} onMouseLeave={() => setHovering("") } onClick={() => {
                            props.moduleRoot.importPendingWallet(key);
                          }}  className='iconWraper importButton'>
                      <ImportIcon className="icon"  />
                      { ( hovering === "import"+key || isMobile ) &&  <label className='iconLabel'>Import</label> }
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
             deleteAllWallets();
            }}
            id="cancelBtn">
            Delete All
          </button>
          <button
            onClick={() => {
              props.setOpenModal(false);
            }}
            id="cancelBtn">
            Close
          </button>
          </div>
        </div>
      </div>
      </div>
    );
  }

export default WalletImportModal;