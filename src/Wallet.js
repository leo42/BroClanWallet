//import { Core } from "lucid-cardano" 
import {  Utils , C , Lucid, Blockfrost ,ExternalWallet  } from "lucid-cardano";
import Datasource  from "./Datasource";
const { Address ,  NativeScript , StakeCredential,  BaseAddress , ScriptPubkey, Vkeywitness  , Transaction} = C;

const data1 = await Datasource.from_blockfrost("preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp")

class Wallet {
    // Initialize the wallet with the provided script and address
    constructor(wallet_json,name) {
    //   const address =  Address.from_bech32("addr_test1qpy8h9y9euvdn858teawlxuqcnf638xvmhhmcfjpep769y60t75myaxudjacwd6q6knggt2lwesvc7x4jw4dr8nmmcdsfq4ccf") // L
            
    //   const address2 =  Address.from_bech32("addr_test1qpceptsuy658a4tjartjqj29fhwgwnfkq2fur66r4m6fpc73h7m9jt9q7mt0k3heg2c6sckzqy2pvjtrzt3wts5nnw2q9z6p9m") // Trash

    //   let mintingScripts =  NativeScripts.new()
    //   mintingScripts.add( NativeScript.new_script_pubkey( ScriptPubkey.new( BaseAddress.from_address(address).payment_cred().to_keyhash())))
    //   mintingScripts.add( NativeScript.new_script_pubkey( ScriptPubkey.new( BaseAddress.from_address(address2).payment_cred().to_keyhash())))
    //   console.log(NativeScript.new_script_all( ScriptAll.new(mintingScripts)).to_json())
    //   this.wallet_script = NativeScript.new_script_all( ScriptAll.new(mintingScripts))
      this.signersNames = []
       
      this.wallet_script = wallet_json
      this.wallet_address = "";
      this.name=name
      this.pendingTxs = [];
      
    }

    extractSignerNames(json) {
      for (const key in json) {
        if (json.hasOwnProperty(key)) {
          const element = json[key];
          if (element.type === "sig"){
            this.signersNames.push( { hash:element.keyHash , name:element.name})
            if (element.keyHash.substring(0, 5)=== "addr_"){
              
                element.keyHash=this.utils.getAddressDetails(element.keyHash).paymentCredential.hash
                }
          } else if (typeof element === 'object') {
            this.extractSignerNames(element);
          } 
        }
      }
    }

    async initialize (){
      this.lucid = await Lucid.new(
        new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp"),
        "Preprod",
      );
      this.utils = new Utils(this.lucid)
      this.extractSignerNames(this.wallet_script)

      this.lucidNativeScript = this.utils.nativeScriptFromJson(this.wallet_script )
      this.lucid.selectWalletFrom(  { "address":this.getAddress()})
      await this.loadUtxos()

      console.log(this.lucidNativeScript)
    }

    getScript() {
      return this.wallet_script;
    }

    getName(){
      return this.name
    }
    getSignatures(){
      return this.signatures;
    }

    getBalance(){
      const utxos = this.utxos
      let result = 0
      utxos.map( utxo => {
        result += Number( utxo.assets.lovelace)
      }

      )
      return result
   }
    getAddress() {

        return this.utils.validatorToAddress(this.lucidNativeScript)
    }
 
    getSigners(){
      return this.signersNames
    }
    async getUtxos() {
        return this.utxos
    }
   
    async loadUtxos() {
      this.utxos = await this.lucid.provider.getUtxos(this.getAddress())
    }
    
    getPendingTxs(){
        return this.pendingTxs
    }

    decodeTransaction(tx){
      const uint8Array = new Uint8Array(tx.toString().match(/.{2}/g).map(byte => parseInt(byte, 16)));
      const txBody =  Transaction.from_bytes(uint8Array).body().to_js_value()
  
      return txBody

    }

    checkSigners(signers){
      return true

      
    }
    
    async createTx(amount, destination, signers){ 
      console.log(`Creating transaction of ${amount} Lovelace, for address: ${destination}`)

      if ( !this.checkSigners(signers)){
        return ("Not enough signers")
      }

      const tx = this.lucid.newTx()

      signers.map( value => (
        tx.addSignerKey(value)
      ))
      
      const completedTx = await tx.attachSpendingValidator(this.lucidNativeScript)
      .payToAddress(destination,{lovelace: amount*1000000})
      .complete()
      
      this.pendingTxs.push({tx:completedTx, signatures:[]})
      return "Sucsess"
    }

    decodeSignature(signature){
     // const uint8Array = new Uint8Array(signature.toString().match(/.{2}/g).map(byte => parseInt(byte, 16)));
      //const Vkeywitness  =  Vkeywitness.from_bytes(uint8Array).to_js_value()
      //return Vkeywitness
      return "hey"
    }
    
    addSignature(signature){
      this.pendingTxs[0].signatures.indexOf(signature) === -1 ? this.pendingTxs[0].signatures.push(signature) : console.log("This signature already exists");

    }

    async submitTransaction(tx){
       const signedTx = await tx.tx.assemble(tx.signatures).complete();
       const txHash = await signedTx.submit();
      this.pendingTxs=[]
      console.log(txHash);

    }
    // Setters
    setScript(wallet_script) {
      this.wallet_script = wallet_script;
    }
    setAddress(wallet_address) {
      this.wallet_address = wallet_address;
    }

  }

  export default Wallet;