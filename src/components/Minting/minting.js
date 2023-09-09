import React from "react";
import "./minting.css"
import { Lucid ,Blockfrost, Kupmios, Data, Constr } from "lucid-cardano";
import WalletPicker from "../WalletPicker";
import { Program } from "@hyperionbt/helios"
import mintingScript from '!!raw-loader!./minting.hl';

class Minting extends React.Component {
    state = {
         mintingSettings : [{name: "Name" , description: "", amount : 1, image: ""}],
         walletPickerOpen: false
    }
    paymentAddress = "addr_test1xpvjlv8emrk3tsrgtqgc6y6dt39hcaejq5rczrlwntpdm72e97c0nk8dzhqxskq335f56hzt03mnypg8sy87axkzmhusvk0ya2"

    
    setName = (name, index) => {
        console.log(name, index)
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

    startMint = () => {
        this.setState({walletPickerOpen: true})
    }

    mintWithWallet = (wallet) =>{
        const mintingSettings = this.state.mintingSettings;
        this.mint(mintingSettings, wallet , this.props.root.state.settings)
    }

    async mint(mintingSettings, wallet , settings){
      const AfiliateSchema  = Data.Object({ 
        paymentAddressCredential : String
    })
    
      
        const api = await window.cardano[wallet].enable();
        const lucid = await this.newLucidInstance(settings)
        lucid.selectWallet(api)
        const program = Program.new(mintingScript)
        const simplify = true
        const myUplcProgram = program.compile(simplify)
        //const mintingRawScript = { type: "PlutusV2", script : JSON.parse(myUplcProgram.serialize()).cborHex }
        const mintingRawScript = { type: "PlutusV2", script : "590618010000323232323232323232323222323253330093232533300b3370e90000008991919191929998081999919191919191111919191919299980f19b87480000044cc02cdd61980d180e004240084a66603e6601666036603a00290001980d980e80224008266e1cc028dd59980d980e800a400466e08dd69980d980e8022400000c29404c8c94ccc080cc034dd61980e180f005240084a6660426601a6603a603e00290001980e980f80324008266e1cc030dd59980e980f800a400466e08cdc09bad3301d301f00648000dd69980e980f8032400401029404cc034dd61980e180f005240084a6660426601a6603a603e0029000001099b87300c37566603a603e002900119b82375a6603a603e00c90010040a5014a06048002603800c603800a64a66603a66e1d2000001132323232323253330263029002132498c07000458c09c004c09c008dd6981280098128011bad3023001301b00216301b001332232533301e3370e900100088010991812000980e001980e00119299980e19b87480080045300103d87a8000132323374a9000198111919299981019b87480100044c8c098004c07800858c078004cc068c070cc068c0700052002480112f5c060440026034004603400298103d87a800032323300100100222533302000114c0103d87a800013232533301f3371090001998069bab3301b301d3301b301d0024800920024891c72ff4773518459890ea5224018c10f7487a339ea0a9e42ac6826f8290048810841646d696e4b65790013374a90001981180125eb804cc010010004c090008c088004dd61980b180c002240046460120026601660146eaccc054c05c00d2008002233300400148900488100223253330173370e90000008991919baf33015301700548000cdd2a40006603a6ea40052f5c06eb8c074004c0540084c8c8cdd79980a980b802a400066e9520023301d375200297ae0375c603a002602a004602a00244646600200200644a66603400229404c8c94ccc064c014008528899802002000980f001180e000911191919299980c19b874800800452000132375a603c002602c004602c00264a66602e66e1d200200114c0103d87a800013232323300100100222533301e00114c103d87a8000132323232533301f3371e016004266e95200033023375000297ae0133006006003375a60400066eb8c078008c088008c080004dd5980e800980a801180a80099804001801180080091299980a8008a400026466e0120023300300300130180013300c300e00a4800001002c4ccc8c888c8c8cc004004008894ccc06800452889919299980c99b87332232333001001003480008894ccc08400840044c8c8ccc0140140054ccc080c0180084cdc0001a40042006604a00660460046eb0cc054c05c01d20002533301a3371e6eb8cc058c060cc058c060cc058c060005200048001200000313370e6eb4cc058c060cc058c060005200048009200014a090010998020020008a50301e002375c60380026460080026600c600a6eaccc040c0480092008001300100122533301500114bd7009919191980c9ba900133005005002375c602a0046032004602e00266018601c01490000020a502323300100100222533301500114bd6f7b630099191919299980b19b8f488100002100313301a337606ea4008dd3000998030030019bab3017003375c602a0046032004602e002446464a66602466e1d200200114bd6f7b6300991bab3018001301000230100013300300200122323300100100322533301400114c103d87a800013232323253330153371e00e004266e95200033019374c00297ae01330060060033756602c0066eb8c050008c060008c058004dd7180880098048010a50300900133005300700348008526163253330093370e90000008a99980618038020a4c2c2a66601266e1d200200113232533300e3011002132498c01000458c03c004c01c01058c01c00c8c94ccc024cdc3a400000226464a66601c60220042930b1bae300f0013007002153330093370e900100089919299980718088010a4c2c6eb8c03c004c01c00858c01c004cc0040052000222233330073370e0020060184666600a00a66e000112002300e001002002230053754002460066ea80055cd2ab9d5573caae7d5d02ba157441" }
        const policyId = lucid.utils.mintingPolicyToId(mintingRawScript)
    
        const adminKey = "72ff4773518459890ea5224018c10f7487a339ea0a9e42ac6826f82941646d696e4b6579"
        const adminUtxo = await lucid.provider.getUtxoByUnit(adminKey)
        const adminDatum =  Data.from(adminUtxo.datum)
        const mintPrice = adminDatum.fields[0]
        const afiliateBounty = adminDatum.fields[1]
        const utxos = await lucid.wallet.getUtxos()
        const validUtxos =  utxos.filter(utxo =>  utxo.outputIndex === 0)
        const assets = {  }
        const consumingTxs = []
        const metadata =  {}
        metadata[policyId] ={}
        mintingSettings.forEach((mintingSetting, index) => { 
             assets[policyId+validUtxos[index].txHash] =  mintingSetting.amount;
             consumingTxs.push( lucid.newTx().collectFrom([validUtxos[index]]))
             metadata[policyId][validUtxos[index].txHash] =  {name: mintingSetting.name, description: mintingSetting.description, image: mintingSetting.image}
    }) 
    const afiliateAddress =  "addr_test1qpy8h9y9euvdn858teawlxuqcnf638xvmhhmcfjpep769y60t75myaxudjacwd6q6knggt2lwesvc7x4jw4dr8nmmcdsfq4ccf"
      const paymentTx = afiliateAddress ?  
                  lucid.newTx().payToAddress(this.paymentAddress, {lovelace : mintPrice - afiliateBounty  })
                               .payToAddress(afiliateAddress, {lovelace : afiliateBounty })  :
                  lucid.newTx().payToAddress(this.paymentAddress, {lovelace : mintPrice   })
      

       
       const redeemer   = afiliateAddress ?  
                 Data.to(new Constr(1, [new Constr( lucid.utils.getAddressDetails(afiliateAddress).paymentCredential.type === "Key" ? 0 : 1, [ lucid.utils.getAddressDetails(afiliateAddress).paymentCredential.hash])])) :
                 Data.void()
      
        console.log(adminUtxo)
        console.log(mintPrice, afiliateBounty, lucid.utils.getAddressDetails(this.paymentAddress), adminDatum , redeemer)
        const tx = lucid.newTx()
                   .mintAssets(assets, redeemer)
                   .attachMintingPolicy(mintingRawScript )
                   .attachMetadata( 721 , metadata )
                   .readFrom([adminUtxo])
                   .compose(paymentTx)
        
        consumingTxs.map(consumingTx => {tx.compose(consumingTx)})
        console.log(await tx.toString())
        const completedTx = await tx.complete()
        console.log(completedTx)
        const signature = await completedTx.sign().complete();
          
        const txHash = await signature.submit();
        console.log(txHash)
        console.log(adminDatum,mintPrice,afiliateBounty)
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
    setWalletPickerOpen = (value) => {
        this.setState({walletPickerOpen: value})
    }

    description = <div name="mintingDescription"><h1>Here you can mint your Tokenized Wallet</h1><br/>
            <h3>This process uses a plutus script to mint a Uniqe token for you that will unlock your token-wallet</h3><br/>
            <h4>You can select any metadata you want for your token, this metadata will help you to identify your token in the future for a better user experience<br/>
            The default image is a generated image based on the content of your token-wallet, generated centraly and served from the BroClan server<br/> 
            You can use a Custom image if you want, but you will have to host it yourself on IPFS<br/>
            Important to note that minting a token with the same name will NOT unlock the same token-wallet<br/>

            When tokenized Multisig is released for BroClan, you will be able to reuse this tokens in that setting</h4></div>

   

    render() {
        return (
            <div className='MintingModule'>
                 {this.state.walletPickerOpen && <WalletPicker setOpenModal={this.setWalletPickerOpen} operation={this.mintWithWallet} />}
                    {this.description}
                    <div key={this.state.mintingSettings}> 
                {this.state.mintingSettings.map((mintingSetting, index) => 
                    <div key={index}>
                        {index > 0 && <button onClick={() => this.removeMintingSetting(index)}>x</button> }
                        Name:<input type="text" value={mintingSetting.name} onChange={(event) => this.setName(event.target.value, index) }/> 
                        <br/>
                        Description:<input type="text"   value={mintingSetting.description} onChange={(event) => this.setDescription(event.target.value, index)} /> 
                        <br/>
                        Copies:<input type="number"   value={mintingSetting.amount}  onChange={(event) => this.setAmount(event.target.value, index)}/>
                        <br/>
                        Image:
                            <select  value={mintingSetting.image}  onChange={(event) => this.changeImage(event.target.value, index) } > 
                                <option value="">default</option>
                                <option value="custom">Custom</option>
                            </select>
                            {mintingSetting.image === "custom" &&
                               <div> <input type="file"  onChange={(event)=> this.uploadImage(event, index)}/> 
                                    {mintingSetting.CustomImage && <img className="CustomImageSelection" src={URL.createObjectURL(new Blob([mintingSetting.CustomImage]))} alt="custom" />}
                               </div>}
                            <br/>
                            {/* <button onClick={() => this.addMintingSetting()}>Mint More</button> */}
                            <br/>
                            <button onClick={() => this.startMint()}>Mint Now</button>
                    </div>
                    )}
              </div>

                <br />
            </div>
        );
    }

}

export default Minting