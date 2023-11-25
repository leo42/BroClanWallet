import React from 'react';
import ReactDOM from 'react-dom';
import {useState , useEffect} from "react"; 

  



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

    const walletOverview = <div> 
          <h2>Connnected Wallet:{walletName === '' ? "UnNamed" : walletName}</h2>
          <h2>Ballance:{ballance/1_000_000}tA</h2>
          <h2>{signers}</h2>
          </div>
    

    const notConnected =         <div> <h2>Not Connected</h2>
        <button onClick={openApp}>Open App</button>
        </div>
    

    
        return (
        <div className="extensionWindow">
          <h1>BroClan dApp Connector  </h1>
          {!connected  ? notConnected : walletOverview }
         </div>
        );
    

}

    ReactDOM.render(<App />, document.getElementById('root'));