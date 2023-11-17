var record = {}

chrome.action.onClicked.addListener((tab) => {
    var newURL = chrome.runtime.getURL("index.html");
    chrome.tabs.create({ url: newURL + "?=" + tab.url });
  });
  
  
  
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


chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "devtools") {
    port.onMessage.addListener(function(message) {
      if (message.type === "init") {
          console.log("devtools.js loaded")
      }
    });
  }
});


chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "devtools-page") {
    port.onMessage.addListener((message) => {
      if (message.name === "init") {
        chrome.devtools.network.getHAR((harLog) => {
          harLog.entries.forEach((entry) => {
            // Retrieve the response content from each entry
            entry.getContent((content, encoding) => {
              console.log(content);
            });
          });
        });
      }
    });
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details)
  {
      console.log(details);
      console.log(details.requestBody);
  },
  {urls: ["https://alpha.broclan.io/*"]},
  ['requestBody']
);

chrome.webRequest.onCompleted.addListener(
  function(details) {
    if (details.type === "main_frame" && details.statusCode === 200 && details.url.includes("broclan.io")) {
      //resolve the response body as a string

      
    
    var url = details.url;

    record[url] = details;
    console.log("Hash of " + url , details);
  }}
  ,
  { urls: ["<all_urls>"] }
);


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getData' ) {
    if (  message.url in record){
    // Send the data to the popup
      sendResponse({ data: record[message.url] });
    }else{
      sendResponse({ data: null });
    } 
  }
});
