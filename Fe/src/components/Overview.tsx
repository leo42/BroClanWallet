import React, { useState , useRef, useEffect } from 'react';
import TokenElement from './TokenElement';
import "./Overview.css";
import { ReactComponent as DownloadIcon } from '../html/assets/download.svg';
import { ReactComponent as ExpandIcon } from '../html/assets/settings.svg';
import { ReactComponent as DeleteIcon } from '../html/assets/delete.svg';
import { ReactComponent as DetailsIcon } from '../html/assets/details.svg';
import AddressSelect from './AddressSelect';
import WalletInterface from '../core/WalletInterface';
import SmartWalletContainer from './SmartWallet/SmartWalletContainer';
import MultisigContainer from './Multisig/MultisigContainer';




function Overview(props: {wallet: WalletInterface  ,  moduleRoot: SmartWalletContainer | MultisigContainer}) {

  const wallet = props.wallet
  const [walletSettingsOpen, setWalletSettingsOpen] = useState(false)
  const [showing , setShowing] = useState<"FTs" | "NFTs" | undefined>(undefined)
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
    
    <div className='overviewContainer'>
      <label>
      <h1>
      Overview
     </h1> 
    </label>
      { props.wallet.getFundedAddress().length > 1 && <AddressSelect
          wallet={props.wallet}
          moduleRoot={props.moduleRoot}
          selectedAddress={showingAddress}
          onAddressChange={setShowingAddress}
          setName={true}
        />}
      <div className='overviewButtonsContainer'>
        <button className={`overviewTab` + ( showing === undefined ? " overviewTabSelected" : " " )}  onClick={() => setShowing(undefined)}>All</button>
        <button className={`overviewTab` + ( showing === "FTs" ? " overviewTabSelected" : " " )}  onClick={() => setShowing("FTs")}>FTs</button>
        <button className={`overviewTab` + ( showing === "NFTs" ? " overviewTabSelected" : " " )}  onClick={() => setShowing("NFTs")}>NFTs</button>        
      </div>
      <span className="overVeiwTokenSearch"><input type="text"  placeholder='Search' defaultValue={search} onChange={(event) => setSearch(event.target.value)} />  </span>

      {Object.keys(wallet.getBalanceFull(showingAddress)).length > 0 &&
      <div className='overviewTokensContainer'>
      {Object.keys(wallet.getBalanceFull(showingAddress)).map((asset, index) => (
          <TokenElement tokenId={asset} className='overviewTokenContainer' key={index+showingAddress} expanded={false}  amount={Number(wallet.getBalanceFull(showingAddress)[asset])} filter={showing} search={search} />
        ))}

    </div>
      }
    </div>
  );
}
export default Overview;