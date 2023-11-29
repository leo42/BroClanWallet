import React from 'react';
import ReactDOM from 'react-dom';
import {useState , useEffect} from "react"; 
import "./extension.css";  
import "./approval.css";
import PendingTx from './components/PendingTx';

function App() {
    const [type, setType] = useState('');
    const [page, setPage] = useState('');
    const [tx, setTx] = useState(undefined);   

    useEffect(() => {
        chrome.storage.local.get(['type'], function(result) {
            setType(result.type);

        });
        chrome.storage.local.get(['page'], function(result) {
            setPage(result.page);
        });


        chrome.storage.local.get(['tx'] , function(result) {
            console.log('Value currently is ' + result.tx);
            if(result.tx)
            setTx(JSON.parse(result.tx));
        });

    }, []);

 
    // on close 
    // Connect to the background script
    let port = chrome.runtime.connect({name: "popup"});

    window.onbeforeunload = function() {
        // Disconnect from the background script
        port.disconnect();
    }

    const approve = async () => {
        chrome.storage.local.get(['page', 'approvedUrls'], function(result) {
            console.log('Value currently is ' + result.page);
            console.log('Value currently is ' + result.approvedUrls);
            let approvedUrls = [];
            // Parse approvedUrls back to an array
            let parsedApprovedUrls = [];
            if (result.approvedUrls) {
                try {
                    parsedApprovedUrls = JSON.parse(result.approvedUrls);
                } catch(e) {
                    console.error("Error parsing approvedUrls:", e);
                }
            }
            if(!parsedApprovedUrls || parsedApprovedUrls.length === 0){
                approvedUrls = [result.page];
            } else {
                approvedUrls = parsedApprovedUrls;
                approvedUrls.push(result.page);
            }
            chrome.storage.local.set({ approvedUrls: JSON.stringify(approvedUrls) }, function() {
                // Close the window
                port.postMessage({ approve: true });
                port.disconnect();
                window.close();     
            });    
        });
    }

    const reject = async () => { window.close();  };

    const pageApproval  = <div >
           <div className='extensionHeader'>
            < h1 >Connection approval</h1>
          </div>
          <div className='requestBody'>
        <h2>This page is requesting access to your wallet.</h2>
        <h3>{page}</h3>
        <span className='disclamer'>This page will be able to: 
        <ul>
            <li>View your wallet ballance</li>
            <li>View your wallet name</li>
            <li>View your wallet signers</li>
            <li>View your wallet script</li>
            <li>View your wallet address</li>
            <li>View your collateral</li>
            <li>Query the state of transactions</li>
            <li>Submit transactions for review</li>
            <li>Submit completed transactions directly</li>    
        </ul>
        </span>
       <span className='approvalButtons'> <button onClick={() => reject()}>Reject</button> <button onClick={() => approve()}>Approve</button> </span>
    </div>
    </div>

    const txApproval  = <div >
    <div className='extensionHeader'>
     < h1 >Transaction approval</h1>
    </div>
    <div className='requestBody'>
    <h2>This page is requesting to submit a transaction on your behalf.</h2>
    <h3>{page}</h3>
    {tx &&  <PendingTx key={tx} tx={tx} />}
    <p>{tx}</p>
    <span className='approvalButtons'> <button onClick={() => reject()}>Reject</button> <button onClick={() => approve()}>Approve</button> </span>

    </div>
    </div>
        

    return (
    <div className="extensionWindow">
  
            {type === "connection" && pageApproval}
            {type === "transaction" && txApproval}
     </div>
    );


}

ReactDOM.render(<App />, document.getElementById('root'));