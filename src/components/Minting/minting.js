import React from "react";
import "./minting.css"
import { Lucid , Blockfrost, Kupmios, Data } from "lucid-cardano";
import WalletPicker from "../WalletPicker";
import { Program } from "@hyperionbt/helios"
import mintingScript from '!!raw-loader!./minting.hl';

class Minting extends React.Component {
    state = {
         mintingSettings : [{name: "Name" , description: "", amount : 1, image: ""}],
         walletPickerOpen: false
    }
    paymentAddress = "addr_test1qpceptsuy658a4tjartjqj29fhwgwnfkq2fur66r4m6fpc73h7m9jt9q7mt0k3heg2c6sckzqy2pvjtrzt3wts5nnw2q9z6p9m"

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
        const api = await window.cardano[wallet].enable();
        const lucid = await this.newLucidInstance(settings)
        lucid.selectWallet(api)
        const program = Program.new(mintingScript)
        const simplify = true
        const myUplcProgram = program.compile(simplify)
        //const mintingRawScript = { type: "PlutusV2", script : JSON.parse(myUplcProgram.serialize()).cborHex }
        const mintingRawScript = { type: "PlutusV2", script : "5904a00100003232323232323232323232225333007323253330093370e9000000899191919192999807199919191119191919191991191980080080191299980f8008a5013232533301e300500214a2266008008002604600460420026eb0cc050c05801d2004253330193375e6602a602e6602a602e002900024000004266e1cc8ccc0280052210048810037566602a602e002900119b82375a6602a602e00890000030a503374a90001980d99809980a8012400897ae03253330173370e90000008991919191919299981018118010a4c2c6eb8c084004c084008dd6980f800980f8011bad301d001301500216301500133223253330183370e90010008801099180f000980b001980b00119299980b19b87480080045300103d87a8000132323374a90001980e1919299980d19b87480100044c8c080004c06000858c060004cc050c058cc050c0580052002480112f5c060380026028004602800298103d87a800032323300100100222533301a00114c0103d87a80001323253330193371090001998049bab3301530173301530170024800920024891c72ff4773518459890ea5224018c10f7487a339ea0a9e42ac6826f8290048810841646d696e4b65790013374a90001980e80125eb804cc010010004c078008c070004dd6198081809001a400464600a0026600e600c6eaccc03cc044009200800122232323253330163370e90010008a40002646eb4c070004c050008c050004c94ccc054cdc3a4004002298103d87a800013232323300100100222533301c00114c103d87a8000132323232533301d3371e016004266e95200033021375000297ae0133006006003375a603c0066eb8c070008c080008c078004dd5980d800980980118098009980400180118008009129998098008a400026466e0120023300300300130160013300a300c008480000104ccc8c888c8c8cc004004008894ccc06000452889919299980b99b87332232333001001003480008894ccc07c00840044c8c8ccc0140140054ccc078c0180084cdc0001a40042006604600660420046eb0cc04cc05401d2000253330183371e6eb8cc050c058cc050c058cc050c058005200048001200000313370e6eb4cc050c058cc050c058005200048009200014a090010998020020008a50301c002375c60340026460080026600c600a6eaccc038c0400092008001300100122533301300114bd7009919191980b9ba900133005005002375c6026004602e004602a00266014601801090000020a502323300100100222533301300114bd6f7b630099191919299980a19b8f489000021003133018337606ea4008dd3000998030030019bab3015003375c6026004602e004602a002446464a66602066e1d200200114bd6f7b6300991bab3016001300e002300e0013300300200122323300100100322533301200114c103d87a800013232323253330133371e00e004266e95200033017374c00297ae0133006006003375660280066eb8c048008c058008c050004dd7180780098038010a503007001330033005001480085261633001001480008888cccc01ccdc38008018061199980280299b8000448008c0380040080088c014dd5000918019baa0015734aae7555cf2ab9f5740ae855d101" }
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
        mintingSettings.forEach((mintingSetting, index) => { 
             assets[policyId+validUtxos[index].txHash] =  mintingSetting.amount;
             consumingTxs.push( lucid.newTx().collectFrom([validUtxos[index]]))
             metadata[validUtxos[index].txHash] =  {name: mintingSetting.name, description: mintingSetting.description, image: mintingSetting.image}
    }) 
        

        console.log(adminUtxo)
        console.log(mintPrice, afiliateBounty, lucid.utils.getAddressDetails(this.paymentAddress), adminDatum)
        const tx = lucid.newTx()
                   .mintAssets(assets, Data.void())
                   .attachMintingPolicy(mintingRawScript )
                   .payToAddress(this.paymentAddress, {lovelace : mintPrice})
                   .attachMetadata( 721 , metadata )
                   .readFrom([adminUtxo])
        
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