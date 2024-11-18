import { Buffer } from 'buffer';
import { utxoToCore, CML, assetsToValue, scriptFromNative } from '@lucid-evolution/lucid';
import SmartWallet from '../components/SmartWallet/smartWallet';

class SmartWalletMessaging {
    private wallet : SmartWallet;
    private root : any;
    private port : chrome.runtime.Port | null;
    
    constructor(wallet : SmartWallet, root : any) {
        this.wallet = wallet;   
        this.root = root;
        this.port = null;
        this.connect();
    }

    async connect() {
        this.port =await chrome.runtime.connect("jfjmokidpopgdhcilhkoanmjcimijgng"); // Selfbuild ID
        this.port.postMessage({action: "walletType", walletType: 1})
        try{
         //this.port = chrome.runtime.connect("mdnadibcilebgfdkadlhegdpgpglljmn");   //playstore ID
        }catch(e){
               console.log(e)
               return
          } 
         this.port.onMessage.addListener(async (message : any) => {
            if (message.action) {
                let response;
                try {
                    switch (message.action) {
                        case "ping":
                            response = "pong";
                            break;
                        case "getData":
                            if (!this.wallet) {
                                response = { error: "no wallet connected" };
                                break;
                            }
                            response = {
                                walletName: this.wallet.getName(),
                                balance: this.wallet.getBalance(),
                                signers: this.wallet.getSigners(),
                                signersValid: this.wallet.defaultSignersValid()
                            };
                            break;
                        case "getNetworkId":
                            response = this.wallet.getNetworkId();
                            break;
                        case "getBalance":
                            response = assetsToValue(this.wallet.getBalanceFull()).to_cbor_hex();
                            break;
                        case "getUtxos":
                            response = this.wallet.getUtxos().map((utxo) => (utxoToCore(utxo).to_cbor_hex()));
                            break;
                        case "getScriptRequirements":
                            response = "TODO" // this.wallet.getScriptRequirements();
                            break;
                        case "getUsedAddresses":
                            response =  [CML.Address.from_bech32(this.wallet.getAddress()).to_hex()];
                            break;
                        case "getUnusedAddresses":
                            response =[ CML.Address.from_bech32(this.wallet.getAddress()).to_hex()];
                            break;
                        case "getChangeAddress":
                            response =[ CML.Address.from_bech32(this.wallet.getAddress()).to_hex()];
                            break;
                        case "getRewardAddresses":
                            response = [ CML.Address.from_bech32( this.wallet.getStakingAddress()).to_hex()]; 
                            break;
                        case "getScript":
                            response = this.wallet.getScript();
                            break;
                        case "submitUnsignedTx":
                            try {
                                response = await this.root.importTransaction(JSON.parse(message.tx));
                            } catch (e : any) {
                                response = { code: 2, error: e.message };
                            }
                            break;
                        case "getCompletedTx":
                            const tx = await this.wallet.getCompletedTx(message.txId);
                            if (!tx) {
                                response = { code: 1, error: "Transaction not found!" };
                            } else {
                                const txDetails = this.wallet.decodeTransaction(tx.tx);
                                const signersComplete = this.wallet.checkSigners(Object.keys(tx.signatures));
                                if (!signersComplete) {
                                    response = { code: 2, error: "Transaction not ready!" };
                                    break;
                                } else {
                                    response = [tx.tx.toString(), Object.values(tx.signatures)];
                                }
                            }
                            break;
                        // Add additional cases for new API endpoints as per CIP-0106 and the new connector
                    }
                } catch (e : any) {
                    console.log(e);
                    response = { error: e.message };
                }
                this.port?.postMessage({ action: message.action, response: response });
            }
        });
    }

    changeWallet(wallet : SmartWallet) {
        this.wallet = wallet;
    }

    disconnect() {
        try {
            this.port?.disconnect();
        } catch (e : any) {
            console.log(e);
        }
    }
}

export default SmartWalletMessaging;
