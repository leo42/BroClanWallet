const BROCLAN_DOMAIN = "test.broclan.io"
const BROCLAN_PORT =  ":8080"
const BROCLAN_URL = "http://" + BROCLAN_DOMAIN + BROCLAN_PORT + "/";
const approvedUrls = [ "http://localhost:8081"];

let BroPort = null;

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    console.log("Received message from webpage:", sender);
    if (approvedUrls.includes(sender.origin)) {
        if(request && request.action){
            if(BroPort === null){
                connectBroClan();
            }
            switch (request.action) {
            
                case "getBalance": 
                BroPort.postMessage({ request: "getBalance" });
                BroPort.onMessage.addListener((message) => {
                    console.log("Received message from BroClan:", message);
                    sendResponse( message.response );
                });
                break;
            }

            return
        }
        // Process the message and send a response if needed
        // ...
        sendResponse({ response: "Message processed in the background script!" });
    } else {
        sendResponse({ error: "User Rejected" });
    }
});


chrome.runtime.onConnectExternal.addListener(function(port) {
    console.log("Connected to webpage:", port.sender.url);
    // reject if url is not in approved list
    //check open tabs 
    if (port.sender.url === BROCLAN_URL) {
        console.log("Connected to BroClan");
        
        port.onDisconnect.addListener(function() {
            console.log('Port disconnected');
            BroPort = null;
          });
        // check if BroPort is alive 

        if(BroPort !== null){
            console.log("BroClan already connected");
            BroPort.disconnect();
            return
        }
        
        BroPort = port; 
        
        return
    }


    

});

function connectBroClan(){
    chrome.tabs.query({}, function(tabs) {
        let tabIds = [];

        for (let tab of tabs) {
            let tabDomain = new URL(tab.url).hostname;
            if (tabDomain === BROCLAN_DOMAIN) {
                tabIds.push(tab.id);
            }
        }

        if (tabIds.length === 0) {
            // If no tabs are open, open one but don't focus it
            tabIds.push(chrome.tabs.create({ url: BROCLAN_URL, active: false }));
            
        } else {

            // If multiple tabs are open, close all but one
            if (tabIds.length > 1) {
                // Remove the first tab ID from the array and close the rest
                tabIds.shift();
                chrome.tabs.remove(tabIds);
            }

            // Send a message to the remaining open tab
        }

        if(BroPort === null){
            //refresh the page
            chrome.tabs.reload(tabIds[0]);
            
        }
        console.log("Sending message to tab:", tabIds[0]);
        BroPort.postMessage({ fromBackground: "Message from background script!" });    
    });

}

console.log("Background script loaded");