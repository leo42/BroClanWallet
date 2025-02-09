

const injectScript = () => {
  const script = document.createElement('script');
  script.async = false;
  script.src = chrome.runtime.getURL('injected.js');
  script.dataset.extensionId = chrome.runtime.id
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

// Bridge between background script and injected script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FOR_INJECTED') {
      // Forward the message to the injected script using window.postMessage
      window.postMessage(message.data, '*');
  }
});

if (shouldInject) {
  injectScript();
}

