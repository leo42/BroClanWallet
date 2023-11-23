// Desc: Messaging helper for communicating with background script
// Usage: Messaging(this);
//

class Messaging {   

    constructor(wallet) {
        this.wallet = wallet;
        this.port = null;
        this.connect();
    }


    connect() {
        this.port = chrome.runtime.connect("jfjmokidpopgdhcilhkoanmjcimijgng");
        this.port.onMessage.addListener((message) => {
            console.log("Received message from background script:", message);
            if(message.request === "getBalance"){
                this.port.postMessage({ response: this.wallet.getBalance() });
            }
            else{
                console.log("Received message from background script:", message);
                console.log(this.wallet.getUtxos());
            }
        }
        );
    }
    
    disconnect() {
        this.port.disconnect();
    }   
}

export default Messaging;