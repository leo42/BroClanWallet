import React from 'react';
import ReactDOM from 'react-dom';
import {useState , useEffect} from "react"; 
import "./extension.css";  



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
            chrome.storage.local.set({ approval_complete: true, approvedUrls: JSON.stringify(approvedUrls) }, function() {
                // Close the window
                window.close();     
            });    
        });
    }

    return (
    <div className="extensionWindow">
     <div className='extensionHeader'>
        < h1 >Connection approval</h1>
      </div>
        {type} {page}
       
        <button onClick={() => approve()}>Approve</button>
     </div>
    );


}

ReactDOM.render(<App />, document.getElementById('root'));