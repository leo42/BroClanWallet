chrome.storage.local.get('appURL', function(result) {
    if (result.appURL === undefined) {
        chrome.storage.local.set({appURL: 'https://app.broclan.io/'});
    }
});

let BroPort = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    
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
            sendResponse({error: "BroClan not connected"});
            return true;
        }

        const messageListener = (message) => {
            if(request.action === message.action){
                BroPort.onMessage.removeListener(messageListener);
                sendResponse(message.response);
            }
        };

        BroPort.postMessage(request);
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

    let approvedUrls = await loadApprovedUrls()

    if (approvedUrls.includes(sender.origin)) {
        if(BroPort === null){
           await connectBroClan();  
        }
        if(request && request.action && request.action === "submitUnsignedTx"){
            const approval = await getUserApproval({ type: 'transaction', page: sender.origin, tx:request.tx ,approval_complete: false } );
            if(!approval){
                sendResponse({ code: -3, error: "User Rejected" });
                return false;
            }
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
        let userApproval =await getUserApproval({ type: 'connection', page: sender.origin, approval_complete: false } );
        if(userApproval === true){
            sendResponse({ response: "User Approved" });
        } else {
            sendResponse({ code: -3, error: "User Rejected" });
        }
        // Keep the message channel open until sendResponse is called
        return true;
    }
});



chrome.runtime.onConnectExternal.addListener(function(port) {
    // reject if url is not in approved list
    //check open tabs 
    chrome.storage.local.get('appURL', function(result) {
         console.log("connection request from " + port.sender.url, result.appURL);  
    let senderUrl = new URL(port.sender.url);
    let appUrl = new URL(result.appURL);

    if (senderUrl.hostname === appUrl.hostname && senderUrl.port === appUrl.port) {
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
    

});

function getUserApproval(data) {

    //get random number
    let height = 600;
    let width = 500;
    if(data.type === "transaction"){
        height = 1000;
        width = 1600;
    }

    return new Promise((resolve, reject) => {
        chrome.storage.local.set(data, function () {
            chrome.windows.create({ url: "approval_page.html", type: "popup", width: width, height: height });

            let messageListener;
            let disconnectListener;
            let port;

            let listenerFunction = async function(p) {
                port = p;
                if (port.name === "popup") {
                    port.onMessage.addListener(messageListener);
                    port.onDisconnect.addListener(disconnectListener);
                }
            };

            messageListener = async function(message) {
                port.onMessage.removeListener(messageListener);
                port.onDisconnect.removeListener(disconnectListener);
                chrome.runtime.onConnect.removeListener(listenerFunction);
                resolve(message.approve);
            };

            disconnectListener = function() {
                port.onMessage.removeListener(messageListener);
                port.onDisconnect.removeListener(disconnectListener);
                chrome.runtime.onConnect.removeListener(listenerFunction);
                resolve(false);
            };

            chrome.runtime.onConnect.addListener(listenerFunction);
        });
    });
}
  


function connectBroClan() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('appURL', function(result) {
            let appDomain = new URL(result.appURL);

            chrome.tabs.query({}, async function(tabs) {
                let tabIds = [];
                for (let tab of tabs) {
                    let tabDomain = new URL(tab.url);
                    if (tabDomain.hostname === appDomain.hostname && tabDomain.port === appDomain.port) {
                        tabIds.push(tab.id);
                        console.log("tab Found");
                    }
                }
                if (tabIds.length === 0) {
                    tabIds.push(chrome.tabs.create({ url:  result.appURL, active: false }));
                } else if(BroPort === null){
                    chrome.tabs.reload(tabIds[0]);
                }

                while(BroPort === null){
                    await new Promise(r => setTimeout(r, 1000));
                }

                resolve(true);
            });
        });
    });
}