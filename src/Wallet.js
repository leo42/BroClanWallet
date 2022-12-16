//import { Core } from "lucid-cardano" 
import {  Utils , C , Lucid, Blockfrost ,ExternalWallet  } from "lucid-cardano";
import Datasource  from "./Datasource";
const { Address ,  NativeScript , StakeCredential,  BaseAddress , ScriptPubkey, ScriptAll, Transaction} = C;

const data1 = await Datasource.from_blockfrost("preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp")

class Wallet {
    // Initialize the wallet with the provided script and address
    constructor(wallet_json) {
    //   const address =  Address.from_bech32("addr_test1qpy8h9y9euvdn858teawlxuqcnf638xvmhhmcfjpep769y60t75myaxudjacwd6q6knggt2lwesvc7x4jw4dr8nmmcdsfq4ccf") // L
            
    //   const address2 =  Address.from_bech32("addr_test1qpceptsuy658a4tjartjqj29fhwgwnfkq2fur66r4m6fpc73h7m9jt9q7mt0k3heg2c6sckzqy2pvjtrzt3wts5nnw2q9z6p9m") // Trash

    //   let mintingScripts =  NativeScripts.new()
    //   mintingScripts.add( NativeScript.new_script_pubkey( ScriptPubkey.new( BaseAddress.from_address(address).payment_cred().to_keyhash())))
    //   mintingScripts.add( NativeScript.new_script_pubkey( ScriptPubkey.new( BaseAddress.from_address(address2).payment_cred().to_keyhash())))
    //   console.log(NativeScript.new_script_all( ScriptAll.new(mintingScripts)).to_json())
    //   this.wallet_script = NativeScript.new_script_all( ScriptAll.new(mintingScripts))

      this.wallet_script = NativeScript.from_json(wallet_json)
      this.wallet_address = "";
      this.pendingTxs = [];
      this.signatures = [];
      
    }

    async initialize (){
      this.lucid = await Lucid.new(
        new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp"),
        "Preprod",
      );
      this.utils = new Utils(this.lucid)
      
      this.lucidNativeScript = this.utils.nativeScriptFromJson({
        "type": "all",
        "scripts":
        [
          {
            "type": "sig",
            "name" : "test",
            "keyHash": "487b9485cf18d99e875e7aef9b80c4d3a89cccddefbc2641c87da293"
          },
          {
            "type": "sig",
            "name": "Leo",
            "keyHash": "7190ae1c26a87ed572e8d72049454ddc874d360293c1eb43aef490e3"
          },
        ]
      } )
      this.lucid.selectWalletFrom(  { "address":this.getAddress()})
      console.log(this.lucidNativeScript)
    }
    // Getters
    getScript() {
      return this.wallet_script;
    }


    getSignatures(){
      return this.signatures;
    }

    async getBalance(){
      const utxos =  await this.lucid.provider.getUtxos(this.getAddress())
      console.log(utxos)
      let result = 0
      utxos.map( utxo => {
        console.log(utxo.assets.lovelace)
        result += Number( utxo.assets.lovelace)
      }

      )
      
      return result

 

    }
    getAddress() {
        const stakeCred =  StakeCredential.from_scripthash(this.wallet_script.hash())
    //    console.log("lucid address:" + this.utils.validatorToAddress(this.lucidNativeScript))
        const scriptAddress =  BaseAddress.new(0, stakeCred, stakeCred ) //1 = mainnet , 0 = testnet
     //   console.log("Serialization address:" + scriptAddress.to_address().to_bech32("addr_test"))
        return this.utils.validatorToAddress(this.lucidNativeScript)
        //return scriptAddress.to_address().to_bech32("addr_test");
    }
 
    async getUtxos() {
        return await this.lucid.provider.getUtxos(this.getAddress())
       
    }
    
    async createTx(amount, destination){ 
      console.log(`Creating transaction of ${amount} Lovelace, for address: ${destination}`)
      const tx =  await this.lucid.newTx()
        .addSigner("addr_test1qpy8h9y9euvdn858teawlxuqcnf638xvmhhmcfjpep769y60t75myaxudjacwd6q6knggt2lwesvc7x4jw4dr8nmmcdsfq4ccf")
        .addSigner("addr_test1qpceptsuy658a4tjartjqj29fhwgwnfkq2fur66r4m6fpc73h7m9jt9q7mt0k3heg2c6sckzqy2pvjtrzt3wts5nnw2q9z6p9m")
        .attachSpendingValidator(this.lucidNativeScript)
        .payToAddress(destination,{lovelace: 1_000_000})
        .complete()
      
        console.log(await tx.toString())
      this.tx = tx
    }

    addSignature(signature){
      this.signatures.push(signature)
      console.log(this.signatures)
    }

    async submitTransaction(){
       const signedTx = await this.tx.assemble(this.signatures).complete();
       const txHash = await signedTx.submit();

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