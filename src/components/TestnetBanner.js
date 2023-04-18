import React, { useState } from 'react';
import './TestnetBanner.css';
import { toast } from 'react-toastify';


function TestnetBanner(props) {
  const [testnetAccepted, setTestnetAccepted] = useState(false);
  function handleAcceptClick() {    
    setTestnetAccepted(true);

  } 

    if (testnetAccepted === true || window.location.hostname === "app.broclan.io" ) {
        return null;
    }


    return (
        <div className="Testnet-banner">
            <p>This Is a testnet Deployment of the BroClan software, it is not adviced to use with real funds on the mainnet at this point in time.</p>
            <button className='commonBtn' onClick={handleAcceptClick}>I Undestand</button>
        </div>
    );
}

export default TestnetBanner;