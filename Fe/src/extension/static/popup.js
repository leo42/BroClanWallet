// popup.js
document.getElementById('injectButton').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage({ action: 'injectScript' });
    });
  });
  