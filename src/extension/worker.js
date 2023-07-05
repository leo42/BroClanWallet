

chrome.action.onClicked.addListener((tab) => {
    var newURL = chrome.runtime.getURL("index.html");
    chrome.tabs.create({ url: newURL + "?=" + tab.url });
  });
  
  
  // Get the tab ID of a random open tab in the current window and filter out tabs that are not http or https URLs 
  
findTab()

function injectTab(tabId) {



chrome.scripting.executeScript({
  target: { tabId: tabId },
  function: () => {
    //sleep 10 sec to allow page to load

    console.log('Code injected into tab',window) ;


    
  }
});
//watch for tab closing 
chrome.tabs.onRemoved.addListener(function(ClosedtabId, removeInfo) {
  if (tabId !== ClosedtabId) return;
  console.log("tab closed")
  findTab();
});
}


function findTab(){
  chrome.tabs.query({ currentWindow: true, url: ['http://*/*', 'https://*/*'] }, (tabs) => {
    //if no tabs are found, sleep for 5 sec and try again
    if (tabs.length === 0) {
      console.log("no tabs found")
      setTimeout(findTab, 5000);
      return;
    }else{
    if (tabs && tabs.length > 0) {
      const tabId = tabs[0].id;
      console.log(tabId)
      injectTab(tabId);
    }}
  });
}


chrome.webRequest.onCompleted.addListener(
  function(details) {
    // Access the response details
    var url = details.url;
    var responseHeaders = details.responseHeaders;
    var responseSize = details.encodedDataLength;

    // Calculate the hash of the response data
    // (You'll need to implement your own hash calculation method)
    var hash = "test"// calculateHash(responseData);


    // Do something with the hash value
    console.log("Hash of " + url + ": " + hash, details);
  },
  { urls: ["<all_urls>"] }
);

function ipfsOnlyHash(value){
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const buffer = reader.result
      const hash = ipfsHash(buffer)
      resolve(hash)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(value)
  }, { urls: ["<all_urls>"] })
}