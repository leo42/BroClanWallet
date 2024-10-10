import React, { useState , useRef, useEffect } from 'react';
import TokenElement from './TokenElement';
import "./Overview.css";
import { ReactComponent as DownloadIcon } from '../html/assets/download.svg';
import { ReactComponent as ExpandIcon } from '../html/assets/settings.svg';
import { ReactComponent as DeleteIcon } from '../html/assets/delete.svg';
import { ReactComponent as DetailsIcon } from '../html/assets/details.svg';
import AddressSelect from './AddressSelect';


function Overview(props) {
  const linkRef = useRef(null);
  const wallet = props.wallet
  const [settingsOpen, setSettingsOpen] = useState(wallet.getFundedAddress().map(() => (false)))
  const [walletSettingsOpen, setWalletSettingsOpen] = useState(false)
  const [showing , setShowing] = useState("All")
  const [showingAddress , setShowingAddress] = useState(props.wallet.getDefaultAddress())
  const [search , setSearch] = useState("")
  const [hovering, setHovering] = useState("")
  const [showingDetails, setshowingDetails] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
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
  

  const showSettings = (index) =>{
    let settingsOpenNew = [...settingsOpen]
    settingsOpenNew[index] = !settingsOpenNew[index]
    setSettingsOpen(settingsOpenNew)
  }


  const handleExport = () => {

     const blob = new Blob([JSON.stringify(wallet.getJson())], { type: "application/json" });
    linkRef.current.href = URL.createObjectURL(blob);
    linkRef.current.download = "wallet.json";
    linkRef.current.click();
  }


  const settingsMenu = (address) => 
    <div className="settingsMenu">
      {walletSettings()} 
       {address === "" ? "" : addressSettings(address)}
    </div>
    

  const addressSettings = (address) =>
    <div className="addressSettings">
      { wallet.getDefaultAddress() === address ? "" : <button className='defaultButton' onClick={() => props.moduleRoot.setDefaultAddress(address)}> Make Default</button> }
      <br/>
      <label>
        <span>Name</span>
        <input type="text"  value={wallet.getAddressName(address)} onChange={(event) => props.moduleRoot.changeAddressName(address,event.target.value)}></input>
      </label>
    </div>
  
  
  const walletJson = (json) => {
    const formattedData = JSON.stringify(json, null, 2);

    return (
      <div className="ImportWalletJsonInner" style={{ whiteSpace: 'pre-wrap' }}>
        {formattedData}
      </div>
    );

  };

  const toggleDefultSigner = (ChangedSigner) => {
    const defaultSigners =  wallet.getSigners().map((signer) => { 
      if(signer.hash === ChangedSigner){
        signer.isDefault = !signer.isDefault
      }
      //return sigherHash if it is default
      return signer.isDefault ? signer.hash : ""
    }).filter((signer) => (signer !== ""))
    props.moduleRoot.setDefaultSigners(defaultSigners)
  }

    
  const walletSettings = () =>
    <div className="walletSettings">
      <label>
        <span>Wallet Name</span>
        <input type="text"  value={wallet.getName()} onChange={(event) => props.moduleRoot.changeWalletName(event.target.value)}></input>
      </label>
      <div key= {JSON.stringify(wallet.defaultSignersValid())} className={wallet.defaultSignersValid() !== false ? "validSignerContainer" : "invalidSignerContainer" }> 
      <label>Default Signers</label>
      <br/>
      <div className='signerContainer'>    
        {wallet.getSigners().map((signer, index) => (
        <div className='signerContainerItem' key={index}  >
          <input type="checkbox" checked={signer.isDefault} onChange={() => toggleDefultSigner(signer.hash)}></input>
          <label> {signer.name}</label>
        </div>
      ))}
       </div>

      </div>
      <label>Collateral Donor:
        <select key={wallet.getCollateralDonor()} value={wallet.getCollateralDonor()} onChange={(event)=> props.moduleRoot.setCollateralDonor(event.target.value)} >
          <option value="" >None</option>
          {wallet.getSigners().filter((sighener) => sighener.isDefault).map( (item, index) => (
            <option key={index} value={item.hash} >{item.name}</option>
          ))}
        </select>

      </label>
      <div className='overviewButtons'>      
      {/* <button onClick={() => props.moduleRoot.deleteWallet(props.moduleRoot.state.selectedWallet)}> Delete Wallet</button> */}
      {props.root.state.module === "smartWallets" && <div  onMouseEnter={() => setHovering("details")} onMouseLeave={() => setHovering("") } onClick={() => {
                            props.moduleRoot.setState({ modal : "updateWallet"})
                          }}  className='iconWraper detailsButton'>
                      <DetailsIcon className="icon"  alt="detailsIcon" />
                      {  (hovering === "details" || isMobile ) &&  <label className='iconLabel'>Update</label> }
                      < br/>   
                      </div>   }

   {props.root.state.module !== "smartWallets" && <div  onMouseEnter={() => setHovering("details")} onMouseLeave={() => setHovering("") } onClick={() => {
                            setshowingDetails(!showingDetails);
                          }}  className='iconWraper detailsButton'>
                      <DetailsIcon className="icon"  alt="detailsIcon" />
                      {  (hovering === "details" || isMobile ) &&  <label className='iconLabel'>Details</label> }
                      < br/>   
                      </div>   
                      }

     { <div  onMouseEnter={() => setHovering("delete")} onMouseLeave={() => setHovering("") } onClick={() => props.moduleRoot.deleteWallet(props.moduleRoot.state.selectedWallet)}  className='iconWraper deleteButton'>
             
             <DeleteIcon className="icon"  alt="deleteIcon" />
             {  (hovering === "delete" || isMobile ) && <label className='iconLabel'>Delete</label> }
            < br/>   
          </div>
          }

          <a ref={linkRef}  style={{ display: "none" }}></a>
          {props.root.state.module !== "smartWallets" && <div  onMouseEnter={() => setHovering("download")} onMouseLeave={() => setHovering("") } onClick={handleExport}  className='iconWraper downloadButton'>    
             <DownloadIcon className="icon"  alt="downloadIcon" />
            {  (hovering === "download" || isMobile ) && <label className='iconLabel'>Download</label> }
            < br/>   
          </div>
          }
      </div>
      {showingDetails && (
                        <div className="">
                          <div className="">
                            <span className="">Json:</span>
                            {/* show the json object as a pretty Json */}


                            <span className="ImportWalletJson">{walletJson(props.wallet.getJson())}</span>
                          </div>
                        </div>
                      )} 

    </div>

  return (
    
    <div>
      <label>
      <h1>
      Overview
      {<ExpandIcon className="expandButton" alt="expandIcon" onClick={() =>setWalletSettingsOpen(!walletSettingsOpen)}/> }
     </h1> 
    </label>
{ walletSettingsOpen ?  settingsMenu(showingAddress) : "" }
      { props.wallet.getFundedAddress().length > 1 && <AddressSelect
          wallet={props.wallet}
          moduleRoot={props.moduleRoot}
          selectedAddress={showingAddress}
          onAddressChange={setShowingAddress}
          setName={true}
        />}
      <br />
      <button className={`overviewTab` + ( showing === "All" ? " overviewTabSelected" : " " )} value="All"  onClick={(event) => setShowing(event.target.value )}>All</button>
      <button className={`overviewTab` + ( showing === "FTs" ? " overviewTabSelected" : " " )}  value="FTs" onClick={(event) => setShowing(event.target.value )}>FTs</button>
      <button className={`overviewTab` + ( showing === "NFTs" ? " overviewTabSelected" : " " )}  value="NFTs" onClick={(event) => setShowing(event.target.value )}>NFTs</button>        
      <br />
      <span className="overVeiwTokenSearch"><input type="text"  placeholder='Search' defaultValue={search} onChange={(event) => setSearch(event.target.value)} />  </span>
      {Object.keys(wallet.getBalanceFull(showingAddress)).length > 0 &&
      <div className='overviewTokensContainer'>
      {Object.keys(wallet.getBalanceFull(showingAddress)).map((asset, index) => (
          <TokenElement tokenId={asset} className='overviewTokenContainer' key={index+showingAddress} expanded={false}  amount={wallet.getBalanceFull(showingAddress)[asset]} filter={showing} search={search} />
        ))}

    </div>
      }
    </div>
  );
}
export default Overview;