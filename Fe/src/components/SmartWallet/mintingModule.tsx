import React from "react";
import { Data, MintingPolicy, Assets, LucidEvolution , getAddressDetails, UTxO , Constr} from "@lucid-evolution/lucid";
import { getNewLucidInstance } from "../../helpers/newLucidEvolution";
import {mintingPolicyToId} from "@lucid-evolution/utils"
import { toast } from "react-toastify";
import { adminDatumSchema, SmartMultisigDescriptorType, SmartMultisigDescriptor , SmartMultisigDescriptorSchema , SmartMultisigDescriptorKeyHash  , SmartMultisigDescriptorKeyHashSchema} from "./types";
import "./mintingModule.css"
import CryptoJS from 'crypto-js';
import { encode } from "./encoder";
interface MintingProps {
  root: {
    openWalletPicker: (callback: (wallet: any) => void) => void;
    state: {
      settings: any;
    };
    showModal: (modalName: string) => void;
  };
  showModal: () => void;
}

interface MintingState {
  termsAccepted: boolean[];
  price: number | null;
  }

class MintingModule extends React.Component<MintingProps> {
  
  terms = [ <span>I read and understood the <a href="https://raw.githubusercontent.com/leo42/BroClanWallet/main/LICENSE" target="blank">Opensource License </a> </span>, 
            <span>I read and understood the <a href="https://broclan.io/faq.html" target="blank">FAQ</a> </span>]
  
  mintingInfo = ["This token represents a tokenized Wallet", "the holder of this token can access the funds of the wallet", "access your tokenized wallet or mint your own", "at broclan.io"]

  state : MintingState  = {
         termsAccepted: (this.terms.map(() => true)),
         price : null

    }
    paymentAddress = "addr_test1qpw97ty053xuqnqg0tsu3qeu5w2c8emu9lufyt24h68k6pcuf8fd97xmztpdh8l5fackuzf5r26m74p7gd924y6yecvs5f968f";
    mintingRawScript = { type: "PlutusV3", script : "590641010100323232323232323232322533300332323232325332330093001300b37540042646464646464a66466020646464a6666660360022a6660266016602a6ea80044c94ccc06000404c4c94cccccc0740040500500504c8c94ccc06c0040584c94cccccc08000405c05c05c05c4c94ccc074c08000c4c94ccc068c8cc004004dd61805180f1baa01722533302000114a0264a66603a64a66603c66e3cc94ccc07cc05cc084dd500089bae30253022375400226eb8c094c088dd5000980918109baa3012302137540026eb8c04cc084dd5006099b8733300e3756602660426ea8005220100488100375a602460426ea803052818118010a51133003003001302300114a2200266e1cccc024dd59807980e1baa0154891c24fc896805f0b75ab51502b022834440ef8235f134475e0c14ea935300488112546f6b656e5661756c7420566175636865720048004060dd7000980e800980e8019bad001014301a0013016375400202402402402402464a6660266008602a6ea80045300103d87a8000130193016375400264a6660266008602a6ea8004530103d87a800013006330183253330143370e9002180b1baa0011301a301737540022c6004602c6ea8c020c058dd5180c980b1baa0014bd7019198008009bac30083016375401e44a6660300022980103d87a80001323253330163371090001998031bab300b30193754601660326ea800922011c592fb0f9d8ed15c06858118d134d5c4b7c77320507810fee9ac2ddf90048810e736d6172744d696e7441646d696e00130093301b0024bd70099802002000980e001180d0009180c180c980c80091119299980a1802980b1baa0011480004dd6980d180b9baa001325333014300530163754002298103d87a8000132330010013756603660306ea8008894ccc068004530103d87a8000132323232533301a337220100042a66603466e3c0200084c034cc07cdd4000a5eb80530103d87a8000133006006003375a60380066eb8c068008c078008c070004cc01400c0084c8c94ccc048c8cc004004cc00c00cc94ccc050c014c058dd50008a5eb7bdb1804dd5980d180b9baa0013300537566012602c6ea803c028894ccc060004528899299980a99180399198008009bac300b301a375402644a6660380022900009991299980d19b8f33009372466e2cdd69807980e9baa300e301d37540046eb8c038c074dd51807180e9baa002480080144cdc0000a40042002603c00266004004603e002660086eb8c06c009200213300300300114a06036002264660020026eb0c01cc058dd500791299980c0008a511325333015337106eb4c028c060dd51804980c1baa301b002483f80c4cc00c00c004528180d8008a502233371800266e04dc680100080111299980b0008a5eb804cc05cc050c060004cc008008c064004dc3a4004294088c8cc00400400c894ccc0580045300103d87a800013232323253330163372200e0042a66602c66e3c01c0084c024cc06cdd3000a5eb80530103d87a8000133006006003375660300066eb8c058008c068008c060004dd2a4000460260024602460260024602260246024602460240026eb8c03cc030dd50011b874800058c034c038008c030004c030008c028004c018dd50008a4c2a6600892011856616c696461746f722072657475726e65642066616c7365001365615330024901ff6578706563742061646d696e446174613a2041646d696e446174756d20203d206f7074696f6e2e6f725f656c7365286f7074696f6e2e6d61702861646d696e5574786f2c20666e287574786f29207b0a2020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020207768656e20287574786f2e6f75747075742e646174756d29206973207b0a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020496e6c696e65446174756d28646261746129202d3e20646174610a2020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020205f202d3e206661696c7d7d292c204e6f6e652900165734ae7155ceaab9e5573eae815d0aba257481" };
    adminKey = "592fb0f9d8ed15c06858118d134d5c4b7c77320507810fee9ac2ddf9736d6172744d696e7441646d696e";

    componentDidMount() {
      const getAdminData = async () => {
        try{
          console.log("getting AdminData");
          const lucid = await getNewLucidInstance(this.props.root.state.settings)

          const adminUtxo = await lucid.config().provider.getUtxoByUnit(this.adminKey)
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
        
        const adminUtxo = await lucid.config().provider.getUtxoByUnit(this.adminKey)
        const adminDatum =  Data.from(adminUtxo?.datum as string, adminDatumSchema)
        const consumingTx =  lucid.newTx().collectFrom([utxos[0]])
        const tokenNameSuffix = this.getTokenName(utxos[0]).slice(1); 
        consumingTx.pay.ToAddress(this.paymentAddress, { lovelace: BigInt(adminDatum.mintAmount) });
        const assets : Assets = {}
        const assetsConfigToken : Assets= {}
        const walletConfigToken = policyId + "0" + tokenNameSuffix
        const walletSubscriptionToken = policyId + "1" + tokenNameSuffix
        const walletRefferenceToken = policyId + "2" + tokenNameSuffix
        assets[walletConfigToken] = 1n;
        assetsConfigToken[walletConfigToken] = 1n
        assets[walletSubscriptionToken] = 1n;
        assets[walletRefferenceToken] = 1n;
        const keyHash =   Data.to(new Constr(0, [paymentCredential.hash]))
        console.log("keyHash", paymentCredential.hash)
        const initialMultisigConfig = keyHash // Data.to(new Constr(0, [keyHash]))
        console.log(initialMultisigConfig, encode({Type : SmartMultisigDescriptorType.AtLeast, atLeast : {m : 1, scripts : [{Type : SmartMultisigDescriptorType.KeyHash, keyHash : {name : "", keyHash : paymentCredential.hash}}]}}))
        consumingTx.pay.ToContract(address, {kind : "inline" , value : initialMultisigConfig}, assetsConfigToken)
        const redeemer = Data.void();
        consumingTx.mintAssets(assets, redeemer)
                  .attach.MintingPolicy(this.mintingRawScript as MintingPolicy)
                  .readFrom([adminUtxo])

                  
        const completedTx = await consumingTx.complete()
        
        const signature = await completedTx.sign.withWallet()
        
        const txComlete = await signature.complete();
        const txHash = await txComlete.submit();
        toast.promise(lucid.config().provider.awaitTx(txHash), {
          pending: 'Waiting for confirmation',
          success: 'Transaction confirmed',
          error: 'Something went wrong',
        });

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
            </div>
          </div>
          );
    }

}

export default MintingModule