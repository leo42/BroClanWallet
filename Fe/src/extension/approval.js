import React from 'react';
import ReactDOM from 'react-dom';
import {useState , useEffect} from "react"; 
import "./extension.css";  
import "./approval.css";


function App() {
    const [type, setType] = useState('');
    const [page, setPage] = useState('');
    const [approvedUrls, setApprovedUrls] = useState([]);
    useEffect(() => {
        chrome.storage.local.get(['type'], function(result) {
            setType(result.type);

        });
        chrome.storage.local.get(['page'], function(result) {
            setPage(result.page);
        });

        chrome.storage.local.get(['approvedUrls'], function(result) {
            setApprovedUrls(result.approvedUrls);
        });
    }, []);

    // on close 
    window.onbeforeunload = function() {
        chrome.storage.local.set({ approval_complete: true }, function() {
            // Close the window
            window.close();
        });
    };

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

    return (
    <div className="extensionWindow">
  
            {type === "connection" && pageApproval}
       
     </div>
    );


}

ReactDOM.render(<App />, document.getElementById('root'));