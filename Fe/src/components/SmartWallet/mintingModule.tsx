import React from "react";
import { Data, MintingPolicy, Assets, LucidEvolution , getAddressDetails, UTxO , Constr} from "@lucid-evolution/lucid";
import { getNewLucidInstance } from "../../helpers/newLucidEvolution";
import {mintingPolicyToId} from "@lucid-evolution/utils"
import { toast } from "react-toastify";
import { adminDatumSchema, SmartMultisigDescriptorType, SmartMultisigDescriptor , SmartMultisigDescriptorSchema , SmartMultisigDescriptorKeyHash  , SmartMultisigDescriptorKeyHashSchema} from "./types";
import "./mintingModule.css"
import CryptoJS from 'crypto-js';
import { encode , decode } from "./encoder";
import SmartWallet from "./smartWallet";
import contracts from "./contracts.json";
import { Settings  } from "../../types/app";

interface MintingProps {
  root: {
    openWalletPicker: (callback: (wallet: any) => void) => void;
    state: {
      settings: Settings
    };
    showModal: (modalName: string) => void;
  };
  showModal: () => void;
  moduleRoot: any;
}

interface MintingState {
  termsAccepted: boolean[];
  price: number | null;
  walletId: string;
  }

class MintingModule extends React.Component<MintingProps> {
  
  terms = [ <span>I read and understood the <a href="https://raw.githubusercontent.com/leo42/BroClanWallet/main/LICENSE" target="blank">Opensource License </a> </span>, 
            <span>I read and understood the <a href="https://broclan.io/faq.html" target="blank">FAQ</a> </span>]
  
  mintingInfo = ["This token represents a tokenized Wallet", "the holder of this token can access the funds of the wallet", "access your tokenized wallet or mint your own", "at broclan.io"]

  state : MintingState  = {
         termsAccepted: (this.terms.map(() => true)),
         price : null,
         walletId : ""
    }
    mintingRawScript = { type: "PlutusV3", script : contracts[this.props.root.state.settings.network].minting.script}

    componentDidMount() {
      const getAdminData = async () => {
        try{
          console.log("getting AdminData");
          const lucid = await getNewLucidInstance(this.props.root.state.settings)

          const adminUtxo = await lucid.config().provider.getUtxoByUnit(contracts[this.props.root.state.settings.network].minting.adminKey)
          console.log(adminUtxo)
          const adminDatum  =  Data.from(adminUtxo?.datum as string, adminDatumSchema)
          this.setState({price : Number(adminDatum.mintAmount)} )
          console.log(adminDatum)
          
        }catch(e){
            console.log(e)
        }
      }
      getAdminData()
    }
    
    inputCheck = () => {
      let allOk = true
        for(let i = 0; i < this.state.termsAccepted.length; i++){
          if(!this.state.termsAccepted[i]){
            allOk = false
            document.getElementById(`mintingTerm${i}`)?.classList.add("invalidTerm") 
          }else{  
            document.getElementById(`mintingTerm${i}`)?.classList.remove("invalidTerm")
          }
        }
        return allOk;
    }

    startMint = () => {
        if(this.inputCheck()){
          console.log("startMint")
          this.props.root.openWalletPicker(this.mintWithWallet)
          this.closeModule()
        }
    }

    mintWithWallet = (wallet : string) =>{
        this.mint( wallet , this.props.root.state.settings)
    }


    async mint( wallet  : string , settings : any){
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
        const utxos = await lucid.config().provider.getUtxos(paymentCredential);



        const policyId = mintingPolicyToId(this.mintingRawScript as MintingPolicy)
        const adminUtxo = await lucid.config().provider.getUtxoByUnit(contracts[this.props.root.state.settings.network].minting.adminKey)
        const adminDatum =  Data.from(adminUtxo?.datum as string, adminDatumSchema)
        const consumingTx =  lucid.newTx().collectFrom([utxos[0]])
        const tokenNameSuffix = this.getTokenName(utxos[0]).slice(2); 
        consumingTx.pay.ToAddress(contracts[this.props.root.state.settings.network].minting.paymentAddress, { lovelace: BigInt(adminDatum.mintAmount) });
        const assets : Assets = {}
        const assetsConfigToken : Assets= {}
        const walletConfigToken = policyId + "00" + tokenNameSuffix
        const walletSubscriptionToken = policyId + "01" + tokenNameSuffix
        const walletRefferenceToken = policyId + "02" + tokenNameSuffix
        assets[walletConfigToken] = 1n;
        assetsConfigToken[walletConfigToken] = 1n
        assets[walletSubscriptionToken] = 1n;
        assets[walletRefferenceToken] = 1n;
        const smartWallet = new SmartWallet(tokenNameSuffix,settings)
        await smartWallet.initializeLucid()
        const smartWalletEnterpriseAddress = smartWallet.getEnterpriseAddress()
        
        console.log("keyHash", paymentCredential.hash, policyId)
        const initialMultisigConfig = encode(    {
          Type : SmartMultisigDescriptorType.KeyHash, 
          keyHash : {name : "me", keyHash : paymentCredential.hash}
        })
        console.log(initialMultisigConfig)
        
        const redeemer = Data.void();
        consumingTx.mintAssets(assets, redeemer)
        .attach.MintingPolicy(this.mintingRawScript as MintingPolicy)
        .readFrom([adminUtxo])
        
        consumingTx.pay.ToContract(smartWalletEnterpriseAddress, {kind : "inline" , value : initialMultisigConfig}, assetsConfigToken)
        
        const completedTx = await consumingTx.complete()
        
        const signature = await completedTx.sign.withWallet()
        
        const txComlete = await signature.complete();
        const txHash = await txComlete.submit();
        const awaitTx = lucid.config().provider.awaitTx(txHash)
        toast.promise(awaitTx, {
          pending: 'Waiting for confirmation',
          success: 'Transaction confirmed',
          error: 'Something went wrong',
        });
        await awaitTx
        this.props.moduleRoot.addWallet(tokenNameSuffix, "New Smart Wallet")

    }catch(e : any){
        console.log(e , "error")
        if (e.message === "Unit not found."){
          toast.error("TokenVaults not supported on this network.")
        } else
        if(e.message === "Could not fetch UTxOs from Blockfrost. Try again."){
          toast.error("Your wallet seems to be empty")
        }else  if(e === "Missing input or output for some native asset"){
          toast.error("Insuffucient funds")
        } else {
          toast.error(e.message ? e.message : e)
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

    description = <div id="mintingDescription"><h1>Mint your Smart Wallet</h1>
    <br/>
    <div className="mintingTerms">
      {this.terms.map((term, index) => (
        <div key={index.toString() + term} id={`mintingTerm${index}`} className="mintingTerm" onClick={() => this.toggleTerm(index)}>
          <input
            type="checkbox" 
            id={`mintingTermCheckbox${index}`}
            value={this.state.termsAccepted[index].toString()}
            onChange={() => this.toggleTerm(index)}
            className="mintingTermCheckbox"
          />        
            {term}
        </div>
      ))}
      <span>Price: {Number(this.state.price).toFixed(2)} ADA</span>
      {this.state.price !== null && <span>Price: {this.state.price} ADA</span>}  
    </div>
</div>

toggleTerm = (index: number) => { 
        let termsAccepted = [...this.state.termsAccepted];
        termsAccepted[index] = !termsAccepted[index];
        this.setState({termsAccepted});
    }    

    closeModule = () => {
      this.props.showModal()
    }

    importWallet = () => {
      this.props.moduleRoot.addWallet(this.state.walletId, "Imported Wallet")
    }

    render() {
        return (
          <div className="ModuleBackground" onClick={() => this.closeModule()}>
            <div className='MintingModule' onClick={(e) => e.stopPropagation()}>
                <div className='MintingModule-content'>
                <div className="titleCloseBtn">
                    <button onClick={() => this.closeModule()}>X</button>
                </div>                    
                {this.description}
                    {this.props.root.state.settings.network !== "Preprod" && <span className="mintingDisclamer">Tokenized Wallets are only supported on the preprod testnet.</span>}
                    <button className="commonBtn" onClick={this.startMint}>Mint Now</button>
                </div>
                <div className="ImportFromId">
                  <input type="text" placeholder="Enter your wallet ID" value={this.state.walletId} onChange={(e) => this.setState({walletId: e.target.value})}/>
                      <button className="commonBtn" onClick={this.importWallet}>Import</button>
                </div>
            </div>
          </div>
        );
    }

}

export default MintingModule