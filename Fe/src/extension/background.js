const BROCLAN_DOMAIN = "test.broclan.io"
const BROCLAN_PORT =  ":8080"
const BROCLAN_URL = "http://" + BROCLAN_DOMAIN + BROCLAN_PORT + "/";

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
            console.log(request.action, message.action);
            if(request.action === message.action){
                console.log(request.action, message);
                BroPort.onMessage.removeListener(messageListener);
                sendResponse(message.response);
            }
        };

        BroPort.postMessage({ action: request.action });
        BroPort.onMessage.addListener(messageListener);
        
        return true;

    }

});

let pingInterval;

function startPing() {
    pingInterval = setInterval(() => {
        if (BroPort) {
            BroPort.postMessage({ action: 'ping' });
        } else {
            clearInterval(pingInterval);
        }
    }, 5000); // Ping every 1000 milliseconds (1 second)
}

function stopPing() {
    clearInterval(pingInterval);
}

function keepAlive() {
    //ping every second to keep connection alive until disconnect

}   


chrome.runtime.onMessageExternal.addListener(async function(request, sender, sendResponse) {
    console.log("Received message from webpage:", request);

    let approvedUrls = await new Promise((resolve, reject) => { 
        chrome.storage.local.get(['approvedUrls'], function(result) {

            let res =   JSON.parse(result.approvedUrls)
            console.log("Approved urls:", res
            );

            if(res === null || res.length === 0){
                chrome.storage.local.set({ approvedUrls: JSON.stringify(["test"]) });
                resolve([]);
            }
            resolve(res);
        });
    });

    console.log("Approved urls:", approvedUrls.toString());

    if (approvedUrls.includes(sender.origin)) {
        if(BroPort === null){
           await connectBroClan();
        }
        if(request && request.action){
               BroPort.postMessage(request);
               const messageListener = (message) => { 
                     if( request.action === message.action){
                            BroPort.onMessage.removeListener(messageListener);
                            sendResponse(message.response);
                        }
                };

                BroPort.onMessage.addListener(messageListener);
                return true;
        }else{
            sendResponse({ response: "Message processed in the background script!" });        
        }
     } else {
        chrome.storage.local.set({ type: 'connection' ,page:sender.origin, approval_complete : false }, function() {
            // Open the popup
            chrome.windows.create({ url: "approval_page.html", type: "popup", width: 500, height: 600 });

            // Start checking approval_complete every 1 second
            let checkInterval = setInterval(function() {
                chrome.storage.local.get(['approval_complete'], function(result) {
                    if (result.approval_complete) {
                        clearInterval(checkInterval);
                        console.log("User approved");
                        sendResponse({ response: "User Approved" });
                    }
                });
            }, 1000);
        });

        // Keep the message channel open until sendResponse is called
        return true;
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
            stopPing();
            BroPort = null;
        });
        // check if BroPort is alive 
        
        if(BroPort !== null){
            console.log("BroClan already connected");
            BroPort.disconnect();
            return
        }
        
        BroPort = port; 
        startPing();
        
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