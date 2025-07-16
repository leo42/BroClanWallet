
import {Buffer} from 'buffer';
 
import { utxoToCore , CML , assetsToValue} from "@evolution-sdk/lucid";
import { App } from '..';
import MultisigWallet from '../core/multisigWallet';
import MultisigContainer from '../components/Multisig/MultisigContainer';
import SmartWalletContainer from '../components/SmartWallet/SmartWalletContainer';
import WalletInterface from '../core/WalletInterface';
import SmartWallet from '../core/smartWallet';




function toHexString(byteArray: Uint8Array) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

class Messaging {   
    private wallet: WalletInterface;
    private root: MultisigContainer | SmartWalletContainer;
    private port: chrome.runtime.Port | null;

    constructor(wallet: WalletInterface, root: MultisigContainer | SmartWalletContainer) {
        this.wallet = wallet;
        this.root = root;   
        this.port = null;
        this.connect();
    }

   async connect() {

       // this.port = chrome.runtime.connect("jfjmokidpopgdhcilhkoanmjcimijgng"); // Selfbuild ID
    try{
       // this.port = chrome.runtime.connect("mdnadibcilebgfdkadlhegdpgpglljmn");   //playstore ID
        this.port = chrome.runtime.connect("emfmflhcajhodbjgkmemdncoangplkdn");   //playstore ID
    }catch(e){
        console.log(e)
        return
    } 
    this.port.onDisconnect.addListener(() => {
        console.log("Port disconnected")
        this.port = null;
    })
        this.port.onMessage.addListener( async (message: any) => {
            if(message.action){
                let response

                try{
                switch (message.action) {  
                        case "ping":
                            if(this.wallet instanceof MultisigWallet){
                                response = {"version" : 106};
                            }else{
                                response = {"version" : 141};
                            }
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
                            if(this.wallet instanceof MultisigWallet){
                                response = this.wallet.getScriptRequirements()
                            }else if((this.wallet instanceof SmartWallet)){
                                response = await this.wallet.getScriptRequirements()
                                response.collateral  =  response.collateral !== null ? utxoToCore(response.collateral).to_cbor_hex() : null
                                if(response.inputs !== undefined){
                                    response.inputs  =   response.inputs.map((input: any) => utxoToCore(input).to_cbor_hex())
                                }
                                if(response.reference_inputs !== undefined){
                                    response.reference_inputs  =  response.reference_inputs.map((input: any) => utxoToCore(input).to_cbor_hex())
                                }
                            }

                            break;

                        case "getScript":

                            if(this.wallet instanceof MultisigWallet){  
                                response = this.wallet.getScript()!.to_cbor_hex();
                            }else if(this.wallet instanceof SmartWallet){
                                const rawScript = this.wallet.getScript()
                                response =[ Number(rawScript.type.replace("PlutusV", "")), rawScript.script]
                            }
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
                        case "getSecret":
                            response =JSON.stringify( {code : 1, error:  "Not found"})
                            break;
                        case "signRedeemer":
                            response =JSON.stringify( {code : 1, error:  "Not found"})

                            break;
                        case "decodeTx":
                            response = JSON.stringify(this.wallet.decodeTransaction(JSON.parse(message.tx)));
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
    
    changeWallet(wallet: WalletInterface){
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