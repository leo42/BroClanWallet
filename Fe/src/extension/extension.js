import React from 'react';
import ReactDOM from 'react-dom';
import {useState , useEffect} from "react"; 
import './extension.css';
  



function App() {
    const [walletName, setWalletName] = useState("");
    const [ballance, setBallance] = useState(0);
    const [connected, setConnected] = useState(false);
    const [signers, setSigners] = useState([]);
    

     
    useEffect(() => {
        getInfo()
      }, []);

    function getInfo(){
        console.log("getInfo");
        chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
            // Received the data from the background
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
              } else if (response.error){   
                console.error(response.error);
              }else{
                console.log(response)
                setBallance(response.ballance);
                setWalletName(response.walletName);
                setSigners(response.signers);
                setConnected(true);
              }            
          });
   }

    const openApp = () => {
        chrome.runtime.sendMessage({ action: 'openApp' }, (response) => {

            getInfo();
          });
    }

    const walletOverview = <div className='walletOverview'> 
          <h1>{walletName === '' ? "UnNamed" : walletName}</h1>
          <h2>{ballance/1_000_000}tA</h2>
          <h2>Signers:</h2><div className='signers'>{signers.filter((signer => signer.isDefault)).map((signer) => <div>
            <label>{signer.name} 

            {/* <input type="checkbox" checked={signer.isDefault} onChange={() => {}}></input> */}
           </label>
            
          </div>)}
            </div>
          </div>
    

    const notConnected =         <div className='notConnected'> <h2>Not Connected</h2>
        <button onClick={openApp}>Open App</button>
        </div>
    

    
        return (
        <div className="extensionWindow">
         <div className='extensionHeader'>
            <h1 >BroClan dApp Connector  </h1>
          </div>
          {!connected  ? notConnected : walletOverview }
         </div>
        );
    

}

    ReactDOM.render(<App />, document.getElementById('root'));