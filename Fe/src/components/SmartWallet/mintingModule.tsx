import React, { version } from "react";
import { Data, MintingPolicy, Assets, LucidEvolution , getAddressDetails, UTxO , credentialToAddress} from "@lucid-evolution/lucid";
import { getNewLucidInstance } from "../../helpers/newLucidEvolution";
import {mintingPolicyToId} from "@lucid-evolution/utils"
import { toast } from "react-toastify";
import { adminDatumSchema, SmartMultisigDescriptorType} from "../../core/types";
import "./MintingModule.css"
import CryptoJS from 'crypto-js';
import { encode , decode } from "../../core/encoder";
import SmartWallet from "../../core/smartWallet";
import contracts from "../../core/contracts.json";

import { App  } from "../../index";
import { validatorToAddress } from "@lucid-evolution/utils";
import SmartWalletContainer from "./SmartWalletContainer";
import { coinSelect } from "../../core/coinSelect";

type TransactionMetadata = string | number | Uint8Array | ReadonlyArray<TransactionMetadata> | {
  [key: string]: TransactionMetadata;
};

interface MintingProps {
  root: App
  moduleRoot: SmartWalletContainer
}
type NetworkType = keyof typeof contracts;


interface MintingState {
  termsAccepted: boolean[];
  price: number | null;
  message: string ;
  walletId: string;
  name: string;
  }



class MintingModule extends React.Component<MintingProps> {
  
  terms = [ <span>I read and understood the <a href="https://raw.githubusercontent.com/leo42/BroClanWallet/main/LICENSE" target="blank">Opensource License </a> </span>, 
            <span>I read and understood the <a href="https://broclan.io/faq.html" target="blank">FAQ</a> </span>]
  
  mintingInfo = ["This token represents a tokenized Wallet", "the holder of this token can access the funds of the wallet", "access your tokenized wallet or mint your own", "at broclan.io"]
  state : MintingState  = {
         termsAccepted: this.terms.map(() => false),
         price : null,
         walletId : "",
         message : "Loading",
         name : ""
    }
    // Add type assertion to ensure network is a valid key
    mintingRawScript = { type: "PlutusV3", script : contracts[this.props.root.state.settings.network as NetworkType].minting.script}



    componentDidMount() {
      const getAdminData = async () => {
        try{
          console.log("getting AdminData");
          const lucid = await getNewLucidInstance(this.props.root.state.settings)
          const adminKey = contracts[this.props.root.state.settings.network as NetworkType].minting.adminKey
          if(!adminKey){
            this.setState({message : "Minting Disabled on this network, Switch to Preprod to try this product"})
            return
          }
          const adminUtxo = await lucid.config().provider!.getUtxoByUnit(adminKey)
          console.log(adminUtxo)
          const adminDatum  =  Data.from(adminUtxo?.datum as string, adminDatumSchema)
          this.setState({price : Number(adminDatum.mintAmount)} )
          console.log(adminDatum)


          
        }catch(e){
            console.log(e)
            this.setState({message : "Minting Disabled on this network, Switch to Preprod to try this product"})
        }
      }
      getAdminData()
    }
    
    inputCheck = () => {
      let allOk = true;
      
      // Check name field first
      if (!this.state.name.trim()) {
        allOk = false;
        toast.error("Please enter a wallet name");
      }

      // Check terms
      for(let i = 0; i < this.state.termsAccepted.length; i++) {
        if(!this.state.termsAccepted[i]) {
          allOk = false;
          document.getElementById(`mintingTerm${i}`)?.classList.add("invalidTerm");
        } else {  
          document.getElementById(`mintingTerm${i}`)?.classList.remove("invalidTerm");
        }
      }

      return allOk;
    }

    startMint = () => {
        if(this.inputCheck()){
          console.log("startMint")
          this.props.root.openWalletPicker(this.mintWithWallet)
          this.props.moduleRoot.showModal("")
        }
    }

    mintWithWallet = (wallet : string) =>{
        this.mint( wallet , this.props.root.state.settings, this.state.name)
    }


    async mint( wallet  : string , settings : any, name: string ){
      const couponId = contracts[this.props.root.state.settings.network as NetworkType].minting.couponId
      function stringToChunks(string : string) {
        const chunks = [];
        while (string.length > 0) {

            chunks.push(string.substring(0, 56));
            string = string.substring(56, string.length);
        }
        return chunks
      }

    try {     
      const api = await window.cardano[wallet].enable();
      const lucid = await getNewLucidInstance(settings)
      lucid.selectWallet.fromAPI(api)

      const address = await lucid.config().wallet?.address();
      if (!address) {
        throw new Error("Wallet address not available");
      }

    

      const paymentCredential = getAddressDetails(address).paymentCredential;
      if (!paymentCredential) {
        throw new Error("Payment credential not found");
      }
      const utxos = (await lucid.config().provider!.getUtxos(paymentCredential))

      const couponUtxo =  utxos.find(utxo => utxo.assets[couponId] >= 1n)
      console.log("utxos", utxos, couponUtxo)
      const filteredUtxos = utxos.filter(utxo => utxo !== couponUtxo);
      let consumingUtxos : UTxO[]   

      const consumingTx =  lucid.newTx()
      if(couponUtxo){
        consumingUtxos = [couponUtxo, ...coinSelect({lovelace: BigInt(15_000_000)}, filteredUtxos)] 
        consumingTx.mintAssets({[couponId]: -1n}, Data.void())
        consumingTx.attach.Script({ type : "PlutusV3", script : contracts[this.props.root.state.settings.network as NetworkType].minting.couponmint})
      }else{
        const adminUtxo = await lucid.config().provider!.getUtxoByUnit(
          contracts[this.props.root.state.settings.network as NetworkType].minting.adminKey
        );
        if (!adminUtxo) {
          throw new Error("Could not fetch admin UTxO - the service might be temporarily unavailable");
        }
        const adminDatum =  Data.from(adminUtxo?.datum as string, adminDatumSchema)
        consumingUtxos = coinSelect({lovelace: BigInt(adminDatum.mintAmount + 15_000_000n)}, utxos)
        consumingTx.pay.ToAddress(contracts[this.props.root.state.settings.network as NetworkType].minting.paymentAddress, { lovelace: BigInt(adminDatum.mintAmount) });
        consumingTx.readFrom([adminUtxo])
      }



      const policyId = mintingPolicyToId(this.mintingRawScript as MintingPolicy)
      const tokenNameSuffix = this.getTokenName(consumingUtxos[0]).slice(2); 
      consumingTx.collectFrom(consumingUtxos)
      
      const assets : Assets = {}
      const assetsConfigToken : Assets = {}
      const assetsRefferenceToken : Assets = {}
      const walletConfigToken = policyId + "00" + tokenNameSuffix
      const walletRefferenceToken = policyId + "02" + tokenNameSuffix
      assets[walletConfigToken] = 1n;
      assetsConfigToken[walletConfigToken] = 1n
      assetsConfigToken["lovelace"] = 2_500_000n
      assets[walletRefferenceToken] = 1n;
      assetsRefferenceToken[walletRefferenceToken] = 1n
      const smartWallet = new SmartWallet(tokenNameSuffix,settings)
      await smartWallet.initializeLucid()

      const stakeCredential = { type : "Key" as any , hash : "5f331948d6f79cea6a0e2b8477f015d7e319747159811edfaaa93c90" }


      
      const configAddress = validatorToAddress(settings.network, { type: "PlutusV3" ,script : contracts[this.props.root.state.settings.network as NetworkType].configHost}, stakeCredential);
      const deadAddress = credentialToAddress(settings.network, { type: "Key" ,hash : "deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead"}, stakeCredential);
      
      
      console.log("keyHash", paymentCredential.hash, policyId)
      const initialMultisigConfig = encode(    {
        Type : SmartMultisigDescriptorType.KeyHash, 
        keyHash : paymentCredential.hash
      })

      console.log(initialMultisigConfig)
      // const tokenData = {
      //   "name": name + "-Config",
      //   "description": "Config token for smart wallet", 
      //   "image": "ipfs://QmRVeq15csUUMZ7kh2i2GC9ESh6DAYcTBygbcVeeeBx96U"
      // };

      const metadata = {
          "version" : "2",
          [policyId] : {
          ["00" + tokenNameSuffix] : {
            ["name"]: name + "-Config",
            ["image"] : "ipfs://QmQ3GoST59pxLyczFwGLUUqcT5ugEq2RAQMikyPgdJqJhc",
            ["mediaType"] : "image/png",
            ["description"]: "Config token for smart wallet"
          },
          ["02" + tokenNameSuffix] : {
            ["name"]: name + "-Reference",
            ["image"] : "ipfs://QmeTaCXumfNLHPEUSPehTTfqKuPX1utA9wyeAkGJXSL8xg",
            ["mediaType"] : "image/png",
            ["description"]: "Reference token for smart wallet"
          }
      }
    
    };

      console.log(this.mintingRawScript, configAddress, deadAddress, metadata, assets);

      const redeemer = Data.void();
      console.log("redeemer", redeemer)

      consumingTx.mintAssets(assets, redeemer)
      consumingTx.attach.Script({ type: "PlutusV3", script : contracts[this.props.root.state.settings.network as NetworkType].minting.script} )
      
      
      consumingTx.pay.ToContract(configAddress, {kind : "inline" , value : initialMultisigConfig}, assetsConfigToken)
      consumingTx.pay.ToAddressWithData(deadAddress, {kind : "inline" , value : Data.void()  }, assetsRefferenceToken, smartWallet.getContract())
      consumingTx.attachMetadata(721, metadata)
      const completedTx = await consumingTx.complete({setCollateral : 4_000_000n, canonical : true})
      
      const signature = await api.signTx(completedTx.toTransaction().to_canonical_cbor_hex(), true)
      
      const txComlete = await completedTx.assemble([signature]).complete();
      const txHash = await lucid.config().provider!.submitTx(txComlete.toCBOR())
      const awaitTx = lucid.config().provider!.awaitTx(txHash)
      this.props.moduleRoot.addWallet(tokenNameSuffix, name, awaitTx)

      toast.promise(awaitTx, {
        pending: 'Waiting for confirmation',
        success: 'Transaction confirmed',
        error: 'Something went wrong',
      });

      await awaitTx
      this.props.moduleRoot.reloadWallets()
    }catch(e : any){
        console.error("Detailed error:", e, e.toString());
        if (e.toString().includes("<!DOCTYPE")) {
          toast.error("Network error: The service is temporarily unavailable. Please try again later.");

        } else {
          if (e.message === "Unit not found.") {
            toast.error("TokenVaults not supported on this network.");
          } else if (e.message === "Could not fetch UTxOs from Blockfrost. Try again.") {
            toast.error("Your wallet seems to be empty");
          } else if (e === "Missing input or output for some native asset") {
            toast.error("Insufficient funds");
          } else {
            toast.error(e.message ? e.message : e.toString());
          }
        }
    }

    }
    

    getTokenName(utxo : UTxO) { 
      console.log(utxo)
      let string =utxo.outputIndex.toString(16)  ;
      if (utxo.outputIndex < 16) string = "0" + string;
      string = string + utxo.txHash;
      console.log(string)
      function hexToByteArray(hexString : string) {
        var result = [];
        while (hexString.length >= 2) { 
          result.push(parseInt(hexString.substring(0, 2), 16));
          hexString = hexString.substring(2, hexString.length);
        }
        return result;
      }
      function byteArrayToWordArray(byteArray : number[]) {
        var words = [], i = 0, bytes = byteArray.length;
        while (i < bytes) {
          words.push(
            (byteArray[i++] << 24) |
            (byteArray[i++] << 16) |
            (byteArray[i++] << 8)  |
            byteArray[i++]
          );
        }
        return CryptoJS.lib.WordArray.create(words, bytes);
      }

      let byteArray = hexToByteArray(string);
      let wordArray = byteArrayToWordArray(byteArray);
      return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);

    }



toggleTerm = (index: number) => {   console.log("toggleTerm", index);
  const termsAccepted = [...this.state.termsAccepted];
  termsAccepted[index] = !termsAccepted[index];
  this.setState({termsAccepted})
}

    closeModule = () => {
      this.props.moduleRoot.showModal("newWallet")
    }

    importWallet = () => {
      this.props.moduleRoot.addWallet(this.state.walletId, this.state.walletId)
    }

    render() {
        return (
          <div className="ModuleBackground" onClick={() => this.closeModule()}>
            <div className='MintingModule' onClick={(e) => e.stopPropagation()}>
                <div className='MintingModule-content'>
                <div className="titleCloseBtn">
                    <button onClick={() => this.closeModule()}>X</button>
                </div>                    
                <div id="mintingDescription">
    <h1>Mint your Smart Wallet</h1>
    <br/>
    <input 
      type="text" 
      placeholder="Enter your wallet Name *" 
      value={this.state.name} 
      onChange={(e) => this.setState({name: e.target.value})}
      required
    />
    <div className="mintingTerms">
      {this.terms.map((term, index) => (
        <div key={`term-${index}-${this.state.termsAccepted[index]}`} id={`mintingTerm${index}`} className="mintingTerm">
          <input
            type="checkbox" 
            id={`mintingTermCheckbox${index}`}
            value={index}
            checked={this.state.termsAccepted[index]}
            onChange={(e) => {
              e.stopPropagation();
              this.toggleTerm(index);
            }}
            className="mintingTermCheckbox"
          />        
          {term}
        </div>
      ))}
    </div>
    {this.state.price === null ?  <label className="mintingMessage"><br/>{this.state.message}</label> : <div className="mintingPrice">
        <span data-label="Price:" data-value={`${this.state.price/1_000_000} ADA`}></span>
        <span data-label="Registration Cost:" data-value={`${contracts[this.props.root.state.settings.network as NetworkType].registrationCost/1_000_000} ADA`}></span>
        <span data-label="Tx Fee:" data-value={`${contracts[this.props.root.state.settings.network as NetworkType].txFee/1_000_000} ADA`}></span>

        <span data-label="Config Utxo:" data-value={`${contracts[this.props.root.state.settings.network as NetworkType].configUtxo/1_000_000} ADA`}></span>
        <span data-label="Total:" data-value={`${(this.state.price + contracts[this.props.root.state.settings.network as NetworkType].registrationCost + contracts[this.props.root.state.settings.network as NetworkType].txFee + contracts[this.props.root.state.settings.network as NetworkType].configUtxo)/1_000_000} ADA`}></span>

    </div>}  
      </div>
                    
                    <button className="commonBtn" onClick={this.startMint}>Mint Now</button>
              
                </div>
            </div>
          </div>
        );
    }

}

export default MintingModule