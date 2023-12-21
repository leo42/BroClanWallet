import React from "react";
import "./minting.css"
import { Lucid ,Blockfrost, Kupmios, Data, Constr } from "lucid-cardano";

import {  toast } from 'react-toastify';class Minting extends React.Component {
  
  terms = [ <span>I read and understood the <a href="https://raw.githubusercontent.com/leo42/BroClanWallet/main/LICENSE" target="blank">Opensource License </a> </span>, 
            <span>I read and understood the <a href="https://broclan.io/faq.html" target="blank">FAQ</a> </span>]
  
  mintingInfo = ["This token represents a tokenized Wallet", "the holder of this token can access the funds of the wallet", "access your tokenized wallet or mint your own", "at broclan.io"]

  state = {
         mintingSettings : [{name: "" , description: "", amount : 1, image: ""}],
         affiliateModalOpen: false,
         termsAccepted: (this.terms.map(() => false))

    }
    paymentAddress = "addr_test1qpw97ty053xuqnqg0tsu3qeu5w2c8emu9lufyt24h68k6pcuf8fd97xmztpdh8l5fackuzf5r26m74p7gd924y6yecvs5f968f"
    mintingRawScript = { type: "PlutusV2", script : "590641010000323232323232323232323222323253330093232533300b3370e90000008991919191929998081999919191919191111919191919299980f19b87480000044cc02cdd61980d180e004240084a66603e6601600266036603a0089002099b87300a375666036603a002900119b82375a66036603a00890000030a501323253330203300d375866038603c014900212999810998068009980e980f80324008266e1cc030dd59980e980f800a400466e08cdc09bad3301d301f00648000dd69980e980f8032400401029404cc034dd61980e180f005240084a6660426601a002004266e1cc030dd59980e980f800a400466e08dd69980e980f8032400401029405281812000980e003180e00299299980e99b87480000044c8c8c8c8c8c94ccc098c0a40084c926301c0011630270013027002375a604a002604a0046eb4c08c004c06c00858c06c004cc88c94ccc078cdc3a4004002200426460480026038006603800464a66603866e1d200200114c103d87a8000132323374a9000198111919299981019b87480100044c8c098004c07800858c078004cc068c070cc068c0700052002480112f5c060440026034004603400298103d87a800032323300100100222533302000114c0103d87a800013232533301f3371090001998069bab3301b301d3301b301d0024800920024891c29348067d7a4cb37d84061e6f40e6815b9361f2d68923a804b2683ae0048811342726f436c616e4d696e74696e6741646d696e0013374a90001981180125eb804cc010010004c090008c088004dd61980b180c002240046460120026601660146eaccc054c05c00d2008002233300400148900488100223253330173370e90000008991919baf3301530173301530170054800120003374a90001980e9ba90014bd701bae301d00130150021323253330193375e6602a602e6602a602e00a90002400066e9520023301d375200297ae013232533301b3370e9002000899251301900214a060320026602a602e00a90020a50375c603a002602a004602a00244646600200200644a66603400229404c8c94ccc064c014008528899802002000980f001180e000911191919299980c19b874800800452000132375a603c002602c004602c00264a66602e66e1d200200114c0103d87a800013232323300100100222533301e00114c103d87a8000132323232533301f3371e016004266e95200033023375000297ae0133006006003375a60400066eb8c078008c088008c080004dd5980e800980a801180a80099804001801180080091299980a8008a400026466e0120023300300300130180013300c300e00a4800001002c4ccc8c888c8c8cc004004008894ccc06800452889919299980c99b87332232333001001003480008894ccc08400840044c8c8ccc0140140054ccc080c0180084cdc0001a40042006604a00660460046eb0cc054c05c01d20002533301a3371e6eb8cc058c060cc058c060cc058c060005200048001200000313370e6eb4cc058c060cc058c060005200048009200014a090010998020020008a50301e002375c60380026460080026600c600a6eaccc040c0480092008001300100122533301500114bd7009919191980c9ba900133005005002375c602a0046032004602e00266018601c01490000020a502323300100100222533301500114bd6f7b630099191919299980b19b8f488100002100313301a337606ea4008dd3000998030030019bab3017003375c602a0046032004602e002446464a66602466e1d200200114bd6f7b6300991bab3018001301000230100013300300200122323300100100322533301400114c103d87a800013232323253330153371e00e004266e95200033019374c00297ae01330060060033756602c0066eb8c050008c060008c058004dd7180880098048010a50300900133005300700348008526163253330093370e90000008a99980618038020a4c2c2a66601266e1d200200113232533300e3011002132498c01000458c03c004c01c01058c01c00c8c94ccc024cdc3a400000226464a66601c60220042930b1bae300f0013007002153330093370e900100089919299980718088010a4c2c6eb8c03c004c01c00858c01c004cc0040052000222233330073370e0020060184666600a00a66e000112002300e001002002230053754002460066ea80055cd2ab9d5573caae7d5d02ba157441" }
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
        const lucid = await this.newLucidInstance(settings)
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
             assets[policyId+validUtxos[index].txHash] =  mintingSetting.amount;
             consumingTxs.push( lucid.newTx().collectFrom([validUtxos[index]]))
             metadata[`0x${policyId}`][`0x${validUtxos[index].txHash}`] =  {name: mintingSetting.name, 
                                                                            description: mintingSetting.description.length > 56 ? stringToChunks(mintingSetting.description) : mintingSetting.description, 
                                                                            image: [`https://${settings.network === "Mainnet" ? "" : "preprod"}tokenvaults.broclan.io/api/`,`${validUtxos[index].txHash}`,`/image.png`],
                                                                            information: this.mintingInfo }
    }) 
    let affiliate =  localStorage.getItem("affiliate") ? JSON.parse(localStorage.getItem("affiliate")) : undefined
    if (affiliate && affiliate.time < Date.now() - 2592000000) {
        affiliate = undefined
        localStorage.removeItem("affiliate")
    }

      const paymentTx = lucid.newTx()
      const affiliateValid = this.addressIsValid(affiliate, lucid.utils.getAddressDetails)
      if (affiliateValid ){  
          if(lucid.utils.getAddressDetails(this.paymentAddress).paymentCredential.type === "Key" )
                paymentTx.payToAddress(this.paymentAddress, {lovelace : mintPrice - affiliateBounty  }) 
          else     
                paymentTx.payToAddressWithData(this.paymentAddress, {inline :Data.void()}, {lovelace : mintPrice - affiliateBounty  })
          
          if(lucid.utils.getAddressDetails(affiliate.affiliate).paymentCredential.type === "Key" )
                paymentTx.payToAddress(affiliate.affiliate, {lovelace : affiliateBounty  }) 
          else     
                paymentTx.payToAddressWithData(affiliate.affiliate, {inline :Data.void()}, {lovelace : affiliateBounty  })
      }else {
        if(lucid.utils.getAddressDetails(this.paymentAddress).paymentCredential.type === "Key" )
                paymentTx.payToAddress(this.paymentAddress, {lovelace : mintPrice   })
        else  
                paymentTx.payToAddressWithData(this.paymentAddress, {inline :Data.void()}, {lovelace : mintPrice   })
      }

       
       const redeemer  = affiliateValid ?  
                 Data.to(new Constr(1, [new Constr( lucid.utils.getAddressDetails(affiliate.affiliate).paymentCredential.type === "Key" ? 0 : 1, [ lucid.utils.getAddressDetails(affiliate.affiliate).paymentCredential.hash])])) :
                 Data.void()
      
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

      async function getValidUtxos(lucid) {
        const utxos = await lucid.provider.getUtxos( lucid.utils.getAddressDetails(await lucid.wallet.address()).paymentCredential);
        const validUtxos = utxos.filter(utxo => utxo.outputIndex === 0);
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

    async newLucidInstance(settings) {
        if (settings.provider === "Blockfrost") {
          return await Lucid.new(
            new Blockfrost(settings.api.url, settings.api.projectId),
            settings.network
          );
        } else if (settings.provider === "Kupmios") {
          return await Lucid.new(
            new Kupmios(settings.api.kupoUrl, settings.api.ogmiosUrl),
            settings.network
          );
        } else if (settings.provider === "MWallet") {
          return await Lucid.new(
            new Blockfrost(settings.api.url, settings.api.projectId),
            settings.network
          );
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