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

function loadApprovedUrls() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['approvedUrls'], function(result) {
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
                approvedUrls = [];
            } else {
                approvedUrls = parsedApprovedUrls;
            }
            resolve(approvedUrls);
        });
    });
}

chrome.runtime.onMessageExternal.addListener(async function(request, sender, sendResponse) {
    console.log("Received message from webpage:", request);

    let approvedUrls = await loadApprovedUrls()
    console.log("Approved urls:", approvedUrls.toString());

    if (approvedUrls.includes(sender.origin)) {
        if(BroPort === null){
           await connectBroClan();
        }
        if(request && request.action && request.action !== "enable"){
               BroPort.postMessage(request);
               const messageListener = (message) => { 
                     if( request.action === message.action){
                            BroPort.onMessage.removeListener(messageListener);
                            sendResponse(message.response);
                         }
                };
                BroPort.onMessage.addListener(messageListener);
            }else{
                sendResponse({ response: "Message processed in the background script!" });        
            }
            return true;
     } else {
        chrome.storage.local.set({ type: 'connection' ,page:sender.origin, approval_complete : false }, function() {
            chrome.windows.create({ url: "approval_page.html", type: "popup", width: 500, height: 600 });
            let checkInterval = setInterval(function() {
                chrome.storage.local.get(['approval_complete'], async function(result) {
                    if (result.approval_complete) {
                        clearInterval(checkInterval);
                        if((await loadApprovedUrls()).includes(sender.origin)){
                            sendResponse({ response: "User Approved" });
                        }else{
                            sendResponse({ code: -3, error: "User Rejected" });
                        }
                        
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