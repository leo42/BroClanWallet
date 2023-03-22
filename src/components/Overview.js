import React, { useState , useRef, useEffect } from 'react';
import TokenElement from './TokenElement';
import "./Overview.css";
import { ReactComponent as DownloadIcon } from '../html/assets/download.svg';
import { ReactComponent as ExpandIcon } from '../html/assets/expand.svg';
import { ReactComponent as DeleteIcon } from '../html/assets/delete.svg';

function Overview(props) {
  const linkRef = useRef(null);
  const wallet = props.wallet
  const [settingsOpen, setSettingsOpen] = useState(wallet.getFundedAddress().map(() => (false)))
  const [walletSettingsOpen, setWalletSettingsOpen] = useState(false)
  const [showing , setShowing] = useState("All")
  const [showingAddress , setShowingAddress] = useState(props.wallet.getDefaultAddress())
  const [search , setSearch] = useState("")
  const [hovering, setHovering] = useState("")
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
  
  const AccountSelect = () => 
    <div>
   <br />
       <select defaultValue={props.wallet.getDefaultAddress()} onChange={(event)=> setShowingAddress(event.target.value)} >  
                <option value="" >All</option>

                {props.wallet.getFundedAddress().map( (item, index) => (
                  <option key={index} value={item} >{props.wallet.getAddressName(item)}</option>
            ))}
      </select>

      <br />
   </div>
   
  const handleCBORExport = () => {

    const blob = new Blob([wallet.getCBOR()], { type: "application/octet-stream" });
    linkRef.current.href = URL.createObjectURL(blob);
    linkRef.current.download = "wallet.cbor";
    linkRef.current.click();
  }

  const settingsMenu = (address) => 
    <div className="settingsMenu">
       {address === "" ? walletSettings() : addressSettings(address)}
    </div>
    

  const addressSettings = (address) =>
    <div className="addressSettings">
      { wallet.getDefaultAddress() === address ? "" : <button className='defaultButton' onClick={() => props.root.setDefaultAddress(address)}> Make Default</button> }
      <br/>
      <label>
        <span>Name</span>
        <input type="text"  value={wallet.getAddressName(address)} onChange={(event) => props.root.changeAddressName(address,event.target.value)}></input>
      </label>
    </div>
  
  const walletSettings = () =>
    <div className="walletSettings">
      <label>
        <span>Wallet Name</span>
        <input type="text"  value={wallet.getName()} onChange={(event) => props.root.changeWalletName(event.target.value)}></input>
      </label>
      <br/>
      {wallet.getDefaultAddress() !== "" && <button onClick={() => props.root.setDefaultAddress("")}> Make Default</button> }
      <br/>
      <div className='overviewButtons'>
      {/* <button onClick={() => props.root.deleteWallet(props.root.state.selectedWallet)}> Delete Wallet</button> */}
      <div  onMouseEnter={() => setHovering("delete")} onMouseLeave={() => setHovering("") } onClick={() => props.root.deleteWallet(props.root.state.selectedWallet)}  className='iconWraper deleteButton'>
             <DeleteIcon className="icon"  alt="deleteIcon" />
             {  hovering === "delete" &&  <label className='iconLabel'>Delete</label> }
            < br/>   
          </div>
          <a ref={linkRef}  style={{ display: "none" }}></a>
          <div  onMouseEnter={() => setHovering("download")} onMouseLeave={() => setHovering("") } onClick={handleExport}  className='iconWraper downloadButton'>
             <DownloadIcon className="icon"  alt="downloadIcon" />
            {  hovering === "download" &&  <label className='iconLabel'>Download</label> }
            
            < br/>   
          </div>
      </div>

    </div>

  return (
    
    <div>
      <label>
      <div>
      Overview:
      <ExpandIcon className="expandButton" alt="expandIcon" onClick={() =>setWalletSettingsOpen(!walletSettingsOpen)}/>
    < br/>  </div> 
    </label>
{ walletSettingsOpen ?  settingsMenu(showingAddress) : "" }
      { props.wallet.getFundedAddress().length > 1 ? AccountSelect(): ""}
      <br />
      <button className={`overviewTab` + ( showing === "All" ? " overviewTabSelected" : " " )} value="All"  onClick={(event) => setShowing(event.target.value )}>All</button>
      <button className={`overviewTab` + ( showing === "FTs" ? " overviewTabSelected" : " " )}  value="FTs" onClick={(event) => setShowing(event.target.value )}>FTs</button>
      <button className={`overviewTab` + ( showing === "NFTs" ? " overviewTabSelected" : " " )}  value="NFTs" onClick={(event) => setShowing(event.target.value )}>NFTs</button>        
      <br />
      <span className="overVeiwTokenSearch">Search:<input type="text"  defaultValue={search} onChange={(event) => setSearch(event.target.value)} />  </span>
      <div className='overviewTokensContainer'>
      {Object.keys(wallet.getBalanceFull(showingAddress)).map((asset, index) => (
          <div className='overviewTokenContainer' key={index}><TokenElement tokenId={asset} expanded={false}  amount={wallet.getBalanceFull(showingAddress)[asset]} filter={showing} search={search} /></div>
        ))}

    </div>
    </div>
  );
}
export default Overview;