const BROCLAN_DOMAIN = "test.broclan.io"
const BROCLAN_PORT =  ":8080"
const BROCLAN_URL = "http://" + BROCLAN_DOMAIN + BROCLAN_PORT + "/";
const approvedUrls = [ "http://localhost:8081"];

let BroPort = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Received internal message:", sender, request);
    
    if(sender.id !== chrome.runtime.id){
        sendResponse({ error: "Invalid sender" });
        return false;
    }

    if(request && request.action){
        if(request.action === "openApp"){
           connectBroClan().then(() => {
            sendResponse({ response: "Connected to BroClan" });
           });
           return true;
        }
                    
        if(BroPort === null){
            sendResponse( {error: "BroClan not connected"});
            return true;
        }

        const messageListener = (message) => {
            console.log(request.action, message.method);
            if(request.action === message.method){
                console.log(request.action, message);
                BroPort.onMessage.removeListener(messageListener);
                sendResponse(message.response);
            }
        };

        BroPort.postMessage({ request: request.action });
        BroPort.onMessage.addListener(messageListener);
        return true;
    }
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    console.log("Received message from webpage:", request);


    if(BroPort === null){
        connectBroClan();
    }
    if (approvedUrls.includes(sender.origin)) {
        if(request && request.action){
               BroPort.postMessage({ request: request.action });
               const messageListener = (message) => { 
                     if( request.action === message.method){
                            BroPort.onMessage.removeListener(messageListener);
                            sendResponse(message.response);
                        }
                };

                BroPort.onMessage.addListener(messageListener);
                return true;
        }else{
            sendResponse({ response: "Message processed in the background script!" });        }
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
async function connectBroClan() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({}, async function(tabs) {
            let tabIds = [];

            for (let tab of tabs) {
                let tabDomain = new URL(tab.url).hostname;
                if (tabDomain === BROCLAN_DOMAIN) {
                    tabIds.push(tab.id);
                }
            }

            if (tabIds.length === 0) {
                tabIds.push(chrome.tabs.create({ url: BROCLAN_URL, active: false }));
            } else {
                if (tabIds.length > 1) {
                    tabIds.shift();
                    chrome.tabs.remove(tabIds);
                }
            }

            if(BroPort === null){
                chrome.tabs.reload(tabIds[0]);
            }

            while(BroPort === null){
                console.log("Waiting for BroClan to connect");
                await new Promise(r => setTimeout(r, 1000));
            }

            resolve(true);
        });
    });
}
console.log("Background script loaded");