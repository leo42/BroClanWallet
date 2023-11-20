// // Inject a listener for messages from the extension
// console.log("BroClan, content script loaded, test ");

// const script = document.createElement("script");
// script.src = chrome.runtime.getURL("api.js");
// script.onload = function() {
//   this.remove();
// };

// console.log(document)
// console.log(window)
// window["cardano"]["broclan"] = "test";
// console.log("BroClan, content script loaded, test again 4");





const injectScript = () => {
  const script = document.createElement('script');
  script.async = false;
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
};

function shouldInject() {
  const documentElement = document.documentElement.nodeName;
  const docElemCheck = documentElement
    ? documentElement.toLowerCase() === 'html'
    : true;
  const { docType } = window.document;
  const docTypeCheck = docType ? docType.name === 'html' : true;
  return docElemCheck && docTypeCheck;
}

if (shouldInject) {
  injectScript();
}

// // CIP-30

