console.log("BroClan, background script loaded, test again 3");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // Handle messages from content scripts
      console.log("Message from content script:", request);
  
      // You can implement additional logic here
  
      // Send a response back to the content script
      sendResponse({ success: true });
    }
  );