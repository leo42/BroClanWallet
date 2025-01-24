import React, { useState , useRef, useEffect } from 'react';
import TokenElement from './TokenElement';
import "./Overview.css";
import { ReactComponent as DownloadIcon } from '../html/assets/download.svg';
import { ReactComponent as ExpandIcon } from '../html/assets/settings.svg';
import { ReactComponent as DeleteIcon } from '../html/assets/delete.svg';
import { ReactComponent as DetailsIcon } from '../html/assets/details.svg';
import AddressSelect from './AddressSelect';


function Overview(props) {

  const wallet = props.wallet
  const [walletSettingsOpen, setWalletSettingsOpen] = useState(false)
  const [showing , setShowing] = useState("All")
  const [showingAddress , setShowingAddress] = useState(props.wallet.getDefaultAddress())
  const [search , setSearch] = useState("")
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
  

  
  return (
    
    <div>
      <label>
      <h1>
      Overview
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