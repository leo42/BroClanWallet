
import {Buffer} from 'buffer';
 
import { utxoToCore , CML , assetsToValue} from "@lucid-evolution/lucid";
import { App } from '..';
import MultisigWallet from '../core/multisigWallet';
import MultisigContainer from '../components/Multisig/MultisigContainer';



function toHexString(byteArray: Uint8Array) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

class Messaging {   
    private wallet: MultisigWallet;
    private root: MultisigContainer;
    private port: chrome.runtime.Port | null;

    constructor(wallet: MultisigWallet, root: MultisigContainer) {
        this.wallet = wallet;
        this.root = root;   
        this.port = null;
        this.connect();



    }

    // getUtxos: (amount = undefined, paginate= undefined) => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getUtxos' , amount : amount, paginate: paginate}),
    // getCollateral: (amount = undefined) => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getCollateral' , amount : amount}),
    // getBalance: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getBalance' }),
    // getUsedAddresses: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getUsedAddresses' }),
    // getUnusedAddresses: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getUnusedAddresses' }),
    // getChangeAddress: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getChangeAddress' }),
    // getRewardAddresses: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getRewardAddresses' }),
    // submitTx: (tx) => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'submitTx', tx: tx }),
    // submitUnsignedTx: (tx) => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'submitUnsignedTx', tx: tx }),
    // getCollateralAddress: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getCollateralAddress' }),
    // getScriptRequirements: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getScriptRequirements' }),
    // getScript: () => chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getScript' }),
    // getCompletedTx(txId) { return chrome.runtime.sendMessage(EXTENSION_ID, { action: 'getCompletedTx', txId: txId }) },

   async connect() {

       // this.port = chrome.runtime.connect("jfjmokidpopgdhcilhkoanmjcimijgng"); // Selfbuild ID
       try{
       // this.port = chrome.runtime.connect("mdnadibcilebgfdkadlhegdpgpglljmn");   //playstore ID
        this.port = chrome.runtime.connect("emfmflhcajhodbjgkmemdncoangplkdn");   //playstore ID
    }catch(e){
              console.log(e)
              return
         } 
        this.port.onMessage.addListener( async (message: any) => {
            if(message.action){
                let response
                try{
                switch (message.action) {  

                        case "ping":
                            response = "pong";
                            break;
                        case "getData":
                            if(!this.wallet){
                                response = {error: "no wallet connected"}
                                break;
                            }
                            response = {
                                walletName : this.wallet.getName(), 
                                ballance: this.wallet.getBalance(),
                                signers: this.wallet.getSigners(),
                                signersValid: this.wallet.defaultSignersValid()
                             }
                            break;        
                        case "getNetworkId":
                            response = this.wallet.getNetworkId();
                            break;
                        case "getBalance": 
                            response =  assetsToValue(this.wallet.getBalanceFull()).to_canonical_cbor_hex();
                            break;
                        case "getUtxos":
                            response = this.wallet.getUtxos().map((utxo) => ( utxoToCore(utxo).to_cbor_hex()));

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
                            response = [   CML.Address.from_bech32( this.wallet.getStakingAddress()).to_hex()]; 
                            break;
                        case "submitTx":
                            response = await this.root.submit(message.tx);
                            break;
                        case "submitUnsignedTx":
                            try{
                                response = await this.root.importTransaction(JSON.parse(message.tx));
                            }catch(e : any){
                                response = {code : 2, error: e.message}
                            }
                            break;

                        case "getScriptRequirements":
                            const signers = this.wallet.getSigners(); 
                            
                            const isValid = this.wallet.defaultSignersValid();
                            if (isValid === false){
                                response = {error: "not enough signers"}
                                break;
                            }else{
                                response = signers.filter((signer) => signer.isDefault).map((signer) => ({ code: 1 , value: signer.hash}));
                                if (isValid.requires_before)   {
                                    response.push({code : 2, "value": isValid.requires_before});
                                }
                                if (isValid.requires_after){
                                    response.push({code: 3, "value": isValid.requires_after});
                                }

                            }
                            break;
                        case "getScript":
                            response = this.wallet.getScript()!.to_cbor_hex();
                            break;
                        case "getCompletedTx":
                            const tx = await this.wallet.getCompletedTx(message.txId);
                            if(!tx){
                                response = {code : 1, error:  "Transaction not found!"}
                            }else{
                                const signersComplete = this.wallet.checkSigners( Object.keys(tx.signatures))
                                if(!signersComplete){
                                    response = {code : 2, error:  "Transaction not ready!"}
                                    break;
                                }else{
                                    response = [ tx.tx.toString(), 
                                                 Object.values(tx.signatures)  ] 
                                }       
                            }
                            break;
                        case "getCollateralAddress":
                            response = [CML.Address.from_bech32(this.wallet.getCollateralAddress()).to_hex()];
                            break;
                        case "getCollateral":
                                response = (await this.wallet.getCollateral()).map((utxo: any) => utxoToCore(utxo).to_cbor_hex());
                            break;
                        case "getUtxoByOutRef":
                            const replacer = (key: any, value: any) => {
                                if (typeof value === 'bigint') {
                                  // Convert BigInt to string
                                  return Number(value);
                                } else {
                                  return value;
                                }
                              };
                            //have BigInt transform to number for JSON
                            response =  JSON.stringify(await this.wallet.getUtxosByOutRef(JSON.parse(message.outRefs)),replacer);
                            break;
                        case "decodeTx":
                            response = JSON.stringify(this.wallet.decodeTransaction(this.wallet.txFromCBOR(JSON.parse(message.tx))));
                            break;
                        case "isAddressMine":
                            response = {}
                           JSON.parse(message.address).map( (address: any) => { response[address] = this.wallet.isAddressMine(address)});
                           response = JSON.stringify(response);
                           console.log(response)
                            break;
                    }
                }catch(e : any){
                    console.log(e)
                    response = {error: e.message}
            }

                this.port?.postMessage({ action: message.action, response: response });
            }
        }
        );
    }
    
    changeWallet(wallet: MultisigWallet){
        this.wallet = wallet;
    }

    disconnect() {
        try{
            this.port?.disconnect();
        }catch(e){
            console.log(e)
        }
    }   

}

export default Messaging;