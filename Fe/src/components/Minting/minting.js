import React from "react";
import "./minting.css"
import { Data, Constr } from "lucid-cardano";
import { getNewLucidInstance } from "../../helpers/newLucid";

import CryptoJS from 'crypto-js';

import {  toast } from 'react-toastify';

class Minting extends React.Component {

  
 



  terms = [ <span>I read and understood the <a href="https://raw.githubusercontent.com/leo42/BroClanWallet/main/LICENSE" target="blank">Opensource License </a> </span>, 
            <span>I read and understood the <a href="https://broclan.io/faq.html" target="blank">FAQ</a> </span>]
  
  mintingInfo = ["This token represents a tokenized Wallet", "the holder of this token can access the funds of the wallet", "access your tokenized wallet or mint your own", "at broclan.io"]

  state = {
         mintingSettings : [{name: "" , description: "", amount : 1, image: ""}],
         affiliateModalOpen: false,
         termsAccepted: (this.terms.map(() => false))

    }
    paymentAddress = "addr_test1qpw97ty053xuqnqg0tsu3qeu5w2c8emu9lufyt24h68k6pcuf8fd97xmztpdh8l5fackuzf5r26m74p7gd924y6yecvs5f968f"
    mintingRawScript = { type: "PlutusV2", script : "5906000100003232323232323232323232225333007323253330093370e9000000899191919192999807199919191119191919191919299980d0018a5110013370e66601200291011c24fc896805f0b75ab51502b022834440ef8235f134475e0c14ea935300488112546f6b656e5661756c7420566175636865720048004c02cdd59980a180b003a40106644646600200200644a66603c00229404c8c94ccc074c014008528899802002000981100118100009bac3301330150064801094ccc060c8c94ccc068cdc3a40000022646466ebccc060c068cc060c068015200048000cdd2a4000660406ea40052f5c06eb8c080004c0600084c8c94ccc070cdd79980c180d1980c180d002a4000900019ba548008cc080dd4800a5eb804c8c94ccc078cdc3a4008002264944c070008528180e0009980c180d002a40082940dd71810000980c001180c0009980a180b001a4008266e1cc8ccc02400522100488100375666028602c002900119b82375a66028602c00690000028a503253330173370e900000089919191919192999810181180109924c64a66603c66e1d20000011323253330233026002149858dd71812000980e0010a99980f19b87480080044c8c94ccc08cc09800852616375c604800260380042c60380022c604200260420046eb4c07c004c07c008dd6980e800980a8010b180a800999119299980c19b874800800440084c8c078004c05800cc058008c94ccc058cdc3a4004002298103d87a8000132323374a90001980e1919299980d19b87480100044c8c080004c06000858c060004cc050c058cc050c0580052002480112f5c060380026028004602800298103d87a800032323300100100222533301a00114c0103d87a80001323253330193371090001998049bab3301530173301530170024800920024891c29348067d7a4cb37d84061e6f40e6815b9361f2d68923a804b2683ae0048811342726f436c616e4d696e74696e6741646d696e0013374a90001980e80125eb804cc010010004c078008c070004dd6198081809001a400464600a0026600e600c6eaccc03cc044009200800122232323253330163370e90010008a40002646eb4c070004c050008c050004c94ccc054cdc3a4004002298103d87a800013232323300100100222533301c00114c103d87a8000132323232533301d3371e016004266e95200033021375000297ae0133006006003375a603c0066eb8c070008c080008c078004dd5980d800980980118098009980400180118008009129998098008a400026466e0120023300300300130160013300a300c008480000104ccc8c888c94ccc04cc8cc004004008894ccc06000452889919299980b99b87332232333001001003480008894ccc07c00840044c8c8ccc0140140054ccc078c0180084cdc0001a40042006604600660420046eb0cc04cc05401d200023371e646e48004cc88cdc58008011bae33014301633014301633014301600148001200048000dd69980a180b1980a180b000a40009001001a40042660080080022940c070008dd7180d00089991191980080080191299980d0008a51132325333019300500213300400400114a0603c00460380026eb0cc03cc04400d20002337106eb4cc040c048cc040c04800520004800920fe0314a06460080026600c600a6eaccc038c0400092008001300100122533301300114bd7009919191980b9ba900133005005002375c6026004602e004602a00266014601801090000020a502323300100100222533301300114bd6f7b630099191919299980a19b8f489000021003133018337606ea4008dd3000998030030019bab3015003375c6026004602e004602a002446464a66602066e1d200200114bd6f7b6300991bab3016001300e002300e0013300300200122323300100100322533301200114c103d87a800013232323253330133371e00e004266e95200033017374c00297ae0133006006003375660280066eb8c048008c058008c050004dd7180780098038010a503007001330033005001480085261633001001480008888cccc01ccdc38008018061199980280299b8000448008c0380040080088c014dd5000918019baa0015734aae7555cf2ab9f5740ae855d101" }
    adminKey = "29348067d7a4cb37d84061e6f40e6815b9361f2d68923a804b2683ae42726f436c616e4d696e74696e6741646d696e"


    setName = (name, index) => {
        let mintingSettings = [...this.state.mintingSettings];
        mintingSettings[index].name = name;
        this.setState({mintingSettings});
    }

    setDescription = (description, index) => {
        let mintingSettings = [...this.state.mintingSettings];
        mintingSettings[index].description = description;
        this.setState({mintingSettings});
    }
    
    changeImage = (value, index) => {
        let mintingSettings = [...this.state.mintingSettings];
        mintingSettings[index].image = value;
        this.setState({mintingSettings});
    }

    uploadImage = (event, index) => {
        const file = event.target.files[0]; // Get the first file from the input
        if (!file) {
          console.log("No file selected");
          return;
        }
    
        const reader = new FileReader();
    
        reader.onerror = (error) => {
          console.error("An error occurred while reading the file:", error);
        };
    
        reader.readAsArrayBuffer(file);
    
        reader.onloadend = () => {
            if (reader.readyState === FileReader.DONE) {
              const arrayBuffer = reader.result;
              const uint8Array = new Uint8Array(arrayBuffer);
          
              let mintingSettings = [...this.state.mintingSettings];
              const updatedSetting = { ...mintingSettings[index], CustomImage: uint8Array };
              mintingSettings[index] = updatedSetting;
          
              this.setState({ mintingSettings });
            }
          };
      };
    

    setAmount = (amount, index) => {
        let mintingSettings = [...this.state.mintingSettings];
        if (amount < 1) amount = 1;
        mintingSettings[index].amount = amount;
        this.setState({mintingSettings});
    }

    addMintingSetting = () => {
        let mintingSettings = [...this.state.mintingSettings];
        mintingSettings.push({name: "Name" , description: "", amount : 1, image: ""});
        this.setState({mintingSettings});
    }

    removeMintingSetting = (index) => { 
        let mintingSettings = [...this.state.mintingSettings];
        mintingSettings.splice(index, 1);
        this.setState({mintingSettings});
    }


    inputCheck = () => {
      let allOk = true
        const mintingSettings = this.state.mintingSettings;
        
        for (let i = 0; i < mintingSettings.length; i++) {
            if (mintingSettings[i].name === ""  || mintingSettings[i].amount === 0) {
                //add invalidInput class to input field by id ``mintingName${i}``
              document.getElementById(`mintingName${i}`).classList.add("invalidInput") 
              allOk = false;
            }else{
              document.getElementById(`mintingName${i}`).classList.remove("invalidInput")  
            }
        }
        for(let i = 0; i < this.state.termsAccepted.length; i++){
          if(!this.state.termsAccepted[i]){
            allOk = false
            document.getElementById(`mintingTerm${i}`).classList.add("invalidTerm") 
          }else{  
            document.getElementById(`mintingTerm${i}`).classList.remove("invalidTerm")
          }
        }

        return allOk;
    }
    startMint = () => {
        if(this.inputCheck()){
          this.props.root.openWalletPicker(this.mintWithWallet)
        }
    }

    mintWithWallet = (wallet) =>{
        const mintingSettings = this.state.mintingSettings;
        this.mint(mintingSettings, wallet , this.props.root.state.settings)
    }

    addressIsValid = (affiliate, getAddressDetails) => {
        try {
          console.log(affiliate)
            const addressDetails = getAddressDetails(affiliate.affiliate)
            return true
            
        } catch (error) {
            return false
        }
    }

    async mint(mintingSettings, wallet , settings){
      let adminTokenPolicy = "29348067d7a4cb37d84061e6f40e6815b9361f2d68923a804b2683ae" 
      let adminTokenName   = "42726f436c616e4d696e74696e6741646d696e"

      let redemptionTokenPolicy  = "29348067d7a4cb37d84061e6f40e6815b9361f2d68923a804b2683ae" 
      let redemptionTokenName = "42726f436c616e4d696e74696e6741646d696e"
      
      function stringToChunks(string) {
        const chunks = [];
        while (string.length > 0) {
            chunks.push(string.substring(0, 56));
            string = string.substring(56, string.length);
        }
        return chunks
      }
      try{      
        const api = await window.cardano[wallet].enable();
        const lucid = await getNewLucidInstance(this.props.root.state.settings)

        lucid.selectWallet(api)

        const policyId = lucid.utils.mintingPolicyToId(this.mintingRawScript)
        
        const adminUtxo = await lucid.provider.getUtxoByUnit(this.adminKey)
        const adminDatum =  Data.from(adminUtxo.datum)
        const mintPrice = adminDatum.fields[0]
        const affiliateBounty = adminDatum.fields[1]
        let validUtxos = await getValidUtxos(lucid);
        const assets = {  }
        const consumingTxs = []
        const metadata =  {}
        metadata[`0x${policyId}`] ={}
        metadata["version"] = 2
        if(validUtxos.length < mintingSettings.length)  {
          toast.info("Not enough primary Utxos to mint all tokens, creating more with a empty transaction")
          await createEmptyTx(lucid);
          
          return
        }
         

        mintingSettings.forEach((mintingSetting, index) => { 
             const tokenName = getTokenName(validUtxos[index])
             console.log(tokenName)
             assets[policyId+tokenName] =  mintingSetting.amount;
             consumingTxs.push( lucid.newTx().collectFrom([validUtxos[index]]))
             metadata[`0x${policyId}`][`0x$tokenName`] =  {name: mintingSetting.name, 
                                                                            description: mintingSetting.description.length > 56 ? stringToChunks(mintingSetting.description) : mintingSetting.description, 
                                                                            image: [`https://${settings.network === "Mainnet" ? "" : "preprod"}tokenvaults.broclan.io/api/`,`${tokenName}`,`/image.png`],
                                                                            information: this.mintingInfo }
    }) 

      const paymentTx = lucid.newTx()
      paymentTx.payToAddressWithData(this.paymentAddress, {inline :Data.void()}, {lovelace : mintPrice   })

      
       const redeemer  =  Data.void()
      
        const tx = lucid.newTx()
                   .mintAssets(assets, redeemer)
                   .attachMintingPolicy(this.mintingRawScript )
                   .attachMetadataWithConversion( 721 , metadata )
                   .readFrom([adminUtxo])
                   .compose(paymentTx)
        
        consumingTxs.map(consumingTx => {tx.compose(consumingTx)})
        const completedTx = await tx.complete()
        const signature = await completedTx.sign().complete();
          
        const txHash = await signature.submit();
        toast.promise(lucid.provider.awaitTx(txHash), {
          pending: 'Waiting for confirmation',
          success: 'Transaction confirmed',
          error: 'Something went wrong',
        });

    }catch(e){
        console.log(e)
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

    function getTokenName(utxo) { 
      console.log(utxo)
      let string =utxo.outputIndex.toString(16)  ;
      if (utxo.outputIndex < 16) string = "0" + string;
      string = string + utxo.txHash;
      console.log(string)
      function hexToByteArray(hexString) {
        var result = [];
        while (hexString.length >= 2) { 
          result.push(parseInt(hexString.substring(0, 2), 16));
          hexString = hexString.substring(2, hexString.length);
        }
        return result;
      }

      function byteArrayToWordArray(byteArray) {
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

      async function getValidUtxos(lucid) {
        const utxos = await lucid.provider.getUtxos( lucid.utils.getAddressDetails(await lucid.wallet.address()).paymentCredential);
        const validUtxos = utxos
        return validUtxos;
      }

      async function createEmptyTx(lucid) {
        const returnAddress = await lucid.wallet.address();
        const tx = lucid.newTx().payToAddress(returnAddress, { lovelace: 1000000 });
        const completedTx = await tx.complete();
        const signature = await completedTx.sign().complete();
        const txHash = await signature.submit();
        const awaitTxPromise =  lucid.provider.awaitTx(txHash)
        toast.promise(awaitTxPromise, {
          pending: 'Waiting for confirmation',
          success: 'Transaction confirmed.',
          error: 'Something went wrong',
        });
        await awaitTxPromise
      }
    }




    description = <div name="mintingDescription"><h1>Mint your Tokenized Wallet</h1><br/>
            </div>

    acceptTerm = (index) => { 
        let termsAccepted = [...this.state.termsAccepted];
        termsAccepted[index] = !termsAccepted[index];
        this.setState({termsAccepted});
    }    

    toggleAfiliateModal = () => {
        this.props.root.showModal("affiliate")
    }

    render() {
        return (
            <div className='MintingModule'>
                    {this.description}
                  { this.props.root.state.settings.network !== "Preprod" &&  <span className="mintingDisclamer">Tokenized Wallets are only supported on the preprod testnet.</span>}
                    <div key={this.state.mintingSettings}> 
                {this.state.mintingSettings.map((mintingSetting, index) => 
                    <div key={index}>
                        {index > 0 && <button onClick={() => this.removeMintingSetting(index)}>x</button> }
                        <input type="text" className="mintingName"  value={mintingSetting.name} id={`mintingName${index}`} placeholder="Name" onChange={(event) => this.setName(event.target.value, index) }/> 
                        <br/>
                        <input type="text"   value={mintingSetting.description} placeholder="Description" onChange={(event) => this.setDescription(event.target.value, index)} /> 
                        <br/>
                        Copies:<input type="number"  className="mintCopies"  value={mintingSetting.amount}  onChange={(event) => this.setAmount(event.target.value, index)}/>
                        <br/>
                        {/* Image:
                            <select  value={mintingSetting.image}  onChange={(event) => this.changeImage(event.target.value, index) } > 
                                <option value="">default</option>
                                <option value="custom">Custom</option>
                            </select>
                            {mintingSetting.image === "custom" &&
                               <div> <input type="file"  onChange={(event)=> this.uploadImage(event, index)}/> 
                                    {mintingSetting.CustomImage && <img className="CustomImageSelection" src={URL.createObjectURL(new Blob([mintingSetting.CustomImage]))} alt="custom" />}
                               </div>}
                            <br/> */}
                            {/* <button onClick={() => this.addMintingSetting()}>Mint More</button> */}
                            <br/>
                            <div className="mintingTerms">
                            {this.terms.map((term, index) => <div key={index} className="mintingTerm" id={`mintingTerm${index}`}><input type="checkbox" value={this.state.termsAccepted[index]} onChange={() => this.acceptTerm(index)} ></input> {term} </div>)}
                             </div>
                              <button className="commonBtn" onClick={() => this.startMint()}>Mint Now</button>
                    </div>
                    )}
              </div>

                <br />
                <span className="affiliateLink" onClick={() => this.toggleAfiliateModal() }> affiliate </span>
            </div>
        );
    }

}

export default Minting