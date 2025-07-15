const TARGET = "KeyPact";
const EXTENSION_ID = document.currentScript.dataset.extensionId;
let supportedExtensionValue = []; 

window.addEventListener('message', (event) => {
    // Make sure the message is from our extension
    if (event.data.source === EXTENSION_ID) {
        if (event.data.action === 'version') {
            supportedExtensionValue = [event.data.extension];
            window.cardano.keypact.supportedExtensions = supportedExtensionValue;
        }
    }
});


function promiseMessage(message){
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(EXTENSION_ID, message).then((responce) => { 
            if(responce.error){
                reject(responce);
            }else{
                resolve(responce);
            }
        })
    })

}

function isEnabled() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(EXTENSION_ID, { action: 'enable', extensions: supportedExtensionValue }).then((responce) => {
            if(!responce || responce.error){ 
                resolve(false);
            }else{
                resolve(true);
            }
        })
    })
}

function enable(extensions = []) {

    return new Promise((resolve, reject) => {
        if (!extensions.includes(supportedExtensionValue[0])) {
            reject("Only Extencion " + supportedExtensionValue[0] + " is supported");
        }
        chrome.runtime.sendMessage(EXTENSION_ID, { action: 'enable', extensions: extensions }).then((responce) => {
            if(!responce || responce.error){ 
                reject(responce.error);
            }else{
                resolve(
                { 
                    getNetworkId: () => promiseMessage({ action: 'getNetworkId' }),
                    getUtxos: (amount = undefined, paginate= undefined) => promiseMessage({ action: 'getUtxos' , amount : amount, paginate: paginate}),
                    getCollateral: (amount = undefined) => promiseMessage({ action: 'getCollateral' , amount : amount}),
                    getBalance: () => promiseMessage({ action: 'getBalance' }),
                    getUsedAddresses: () => promiseMessage({ action: 'getUsedAddresses' }),
                    getUnusedAddresses: () => promiseMessage({ action: 'getUnusedAddresses' }),
                    getChangeAddress: () => promiseMessage({ action: 'getChangeAddress' }),
                    getRewardAddresses: () => promiseMessage({ action: 'getRewardAddresses' }),
                    cip106: {
                        submitUnsignedTx: (tx) => promiseMessage({ action: 'submitUnsignedTx', tx: JSON.stringify(tx) }),
                        getCollateralAddress: () => promiseMessage({ action: 'getCollateralAddress' }),
                        getScriptRequirements: () => promiseMessage({ action: 'getScriptRequirements' }),
                        getScript: () => promiseMessage({ action: 'getScript' }),
                        getCompletedTx: (txId) => promiseMessage({ action: 'getCompletedTx', txId: txId })
                    },
                    cip141: {
                        getScriptRequirements: () => promiseMessage({ action: 'getScriptRequirements' }),
                        getScript: () => promiseMessage({ action: 'getScript' }),
                        submitUnsignedTx: (tx) => promiseMessage({ action: 'submitUnsignedTx', tx: JSON.stringify(tx) }),
                        getSecret:(secretId) => promiseMessage({ action: 'getSecret', secretId :  JSON.stringify(secretId)}),
                        signRedeemer:(data, primitive) => promiseMessage({action : 'signRedeemer', data:  JSON.stringify(data), primitive:  JSON.stringify(primitive)}),
                        getCompletedTx: (txId) => promiseMessage({ action: 'getCompletedTx', txId: txId })

                    },
                    submitTx: (tx) => promiseMessage({ action: 'submitTx', tx: tx }),
                    signTx: (tx) => Promise.reject("not supported"),
                    signData: (data) => Promise.reject("not supported")
                });
            }
        })
    })
}

window.cardano = {
    ...(window.cardano || {}),
    keypact: { 
        enable: enable,
      apiVersion: '0.1.0',
      name: 'KeyPact',
      supportedExtensions: supportedExtensionValue,
      isEnabled: () => isEnabled(),
      icon: "data:image/png;base64,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",
      _events: {},
    },
  };