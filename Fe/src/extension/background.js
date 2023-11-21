const BROCLAN_DOMAIN = "test.broclan.io"
const BROCLAN_PORT =  ":8080"
const BROCLAN_URL = "http://" + BROCLAN_DOMAIN + BROCLAN_PORT + "/";
const approvedUrls = [ "http://localhost:8081/"];


chrome.runtime.onConnectExternal.addListener(function(port) {
    console.log("Connected to webpage:", port.sender.url);
    // reject if url is not in approved list
    //check open tabs 

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
            chrome.tabs.create({ url: BROCLAN_URL, active: false });
        } else {
            // If multiple tabs are open, close all but one
            if (tabIds.length > 1) {
                // Remove the first tab ID from the array and close the rest
                tabIds.shift();
                chrome.tabs.remove(tabIds);
            }

            // Send a message to the remaining open tab
            chrome.tabs.sendMessage(tabIds[0], { message: 'Hello from the background script!' });
        }
    });
    

     if (!approvedUrls.includes(port.sender.url)) {
         port.disconnect();
         return false;
     }
    port.onMessage.addListener(function(request) {
        return new Promise((resolve, reject) => {
            if (request.fromWebpage) {
                console.log("Received message from webpage:", request.fromWebpage);
                // Process the message and send a response if needed
                // ...
                port.postMessage({ response: "Message processed in the background script!" });
                resolve();
            } else {
                reject("Invalid request");
            }
        });
    });
});

console.log("Background script loaded");