
console.log("devtools.js loaded")
chrome.devtools.network.onRequestFinished.addListener((request) => {
  console.log(request);
    request.getContent((content, encoding) => {
      // Here, you can access the response content
      console.log(content);
    });
  });

  const backgroundPageConnection = chrome.runtime.connect({
    name: "devtools"
  });
  
  // Communicate with the background script
  backgroundPageConnection.postMessage({ type: "init" });
  