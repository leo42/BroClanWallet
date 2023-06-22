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
