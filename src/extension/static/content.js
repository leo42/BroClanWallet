// Inject a listener for messages from the extension
console.log("content script loaded")

//afeter page load, inject the script
window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    console.log("page loaded")
    setTimeout(() => {
        // Access window.cardano here
        console.log('Value of window.cardano:', window.cardano);
      }, 2000); // Delay for 2 seconds (adjust as needed)
    console.log(window.cardano)
    
},false);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'getCardano') {
      // Send the value of window.cardano back to the extension
      sendResponse({ cardano: window.cardano });
    }
  });