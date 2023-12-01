import React from 'react';
import ReactDOM from 'react-dom';
import {useState , useEffect} from "react"; 
import './extension.css';
import { ReactComponent as SettingsIcon } from '../html/assets/settings.svg';




function App() {
    const [walletName, setWalletName] = useState("");
    const [ballance, setBallance] = useState(0);
    const [empty, setEmpty] = useState(false);
    const [connected, setConnected] = useState(false);
    const [signers, setSigners] = useState([]);
    const [signersValid, setSignersValid] = useState(false);
    const [settingsOpen , setSettingsOpen] = useState(false);
    const [approvedUrls, setApprovedUrls] = useState([]);
     
    useEffect(() => {
        getInfo()
        chrome.storage.local.get(['approvedUrls'], function(result) {
            setApprovedUrls(JSON.parse(result.approvedUrls));
        });
      }, []);

    function getInfo(){
        console.log("getInfo");
        chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
            // Received the data from the background
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
              } else if (response.error){   
                if(response.error === "no wallet connected"){
                    setConnected(true);
                    setEmpty(true);
                    setBallance(0);
                    setWalletName("");
                    setSigners([]);
                    setSignersValid(false);
                }
                console.error(response.error);
              }else{
                console.log(response)
                setConnected(true);
                setBallance(response.ballance);
                setWalletName(response.walletName);
                setSigners(response.signers);
                setSignersValid(response.signersValid);
              }            
          });
   }

    const openApp = () => {
        chrome.runtime.sendMessage({ action: 'openApp' }, (response) => {

            getInfo();
          });
    }

    const walletOverview = empty? 
    
    <div className='walletOverview'>
        <h1>Empty</h1>
        <h3 className='emptyText'> It seems like you have not created any multisig wallets in BroClan!
        <br/><br/> Please navigate to the App and create one to start using this connector</h3>
    </div>
    
    
    
    : <div className='walletOverview'> 
          <h1>{walletName === '' ? "UnNamed" : walletName}</h1>
          <h2>{ballance/1_000_000}tA</h2>
          <h2>Signers:</h2>
          
          {!signersValid && <span className="signersWarning">Signers not valid</span> }
          <div className='signers'>{signers.filter((signer => signer.isDefault)).map((signer) => <div>
            <label>{signer.name} 

            {/* <input type="checkbox" checked={signer.isDefault} onChange={() => {}}></input> */}
           </label>
            
          </div>)}
            </div>
          </div>

    const deleteUrl = (url) => {
        console.log(url);
        let newApprovedUrls = approvedUrls.filter((approvedUrl) => approvedUrl !== url);
        chrome.storage.local.set({ approvedUrls: JSON.stringify(newApprovedUrls) }, function() {
            setApprovedUrls(newApprovedUrls);
        });    
    }

    const settingsOverview = <div className='settingsOverview'>
        <h2>Settings</h2>
        <h3>Approved Urls</h3>
        <div className='approvedUrls'>
            {approvedUrls.map((url) => <div key={url} className='approvedUrl'>{url}<button  className='deleteUrl' onClick={()=> deleteUrl(url)}>X</button></div>)}
        </div>  


        <button className='closeBtn' onClick={() => setSettingsOpen(false)}>Back</button>
        </div>


    const notConnected =         <div className='notConnected'> <h2>Not Connected</h2>
      <label className="Disclamer">Only Multisig wallets supported.</label>
        <button className='openAppButton' onClick={openApp}>Open App</button>
        </div>
    

    
        return (
        <div className="extensionWindow">
         <div className='extensionHeader'>
            <h1 >BroClan dApp Connector  </h1>
          </div>
          <SettingsIcon className="SettingsIcon" onClick={() => setSettingsOpen(!settingsOpen)}/>
          
          {settingsOpen ? settingsOverview : !connected  ? notConnected : walletOverview }
         </div>
        );
    

}

    ReactDOM.render(<App />, document.getElementById('root'));