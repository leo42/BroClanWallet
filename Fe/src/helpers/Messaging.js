// Desc: Messaging helper for communicating with background script
// Usage: Messaging(this);
//
import { Lucid, utxoToCore  } from "lucid-cardano";

function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

class Messaging {   

    constructor(wallet) {
        this.wallet = wallet;
        this.port = null;
        this.connect();

    }


   async connect() {

        this.port = chrome.runtime.connect("jfjmokidpopgdhcilhkoanmjcimijgng");
        this.port.onMessage.addListener((message) => {
            console.log("Received message from background script:", message);
            if(message.request){
                switch (message.request) {
                
                    case "getBalance": 
                        this.port.postMessage({ response: this.wallet.getBalance() });
                        break;
                    case "getUtxos":
                        
                        this.port.postMessage({ response: this.wallet.getUtxos().map((utxo) => ( toHexString(utxoToCore(utxo).to_bytes()))) });
                        break;    
                }
             }
            else{
                console.log("Received message from background script:", message);
                console.log(this.wallet.getUtxos());
            }
        }
        );
    }
    
    changeWallet(wallet){
        this.wallet = wallet;
    }
    disconnect() {
        this.port.disconnect();
    }   
}

export default Messaging;