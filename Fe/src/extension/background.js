
const approvedUrls = [ "http://localhost:8081/"];
chrome.runtime.onConnectExternal.addListener(function(port) {
    console.log("Connected to webpage:", port.sender.url);
    // reject if url is not in approved list
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