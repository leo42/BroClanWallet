import React from "react";
import "./minting.css"
import { Lucid , Blockfrost, Kupmios } from "lucid-cardano";
import WalletPicker from "../WalletPicker";
import { Program } from "@hyperionbt/helios"
import mintingScript from '!!raw-loader!./minting.hl';

class Minting extends React.Component {
    state = {
         mintingSettings : [{name: "Name" , description: "", amount : 1, image: ""}],
         walletPickerOpen: false
    }

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
        const api = window.cardano[wallet].enable();
        const lucid = new Lucid(  api);
        this.mint(mintingSettings, api , this.props.root.state.settings)
    }

    async mint(mintingSettings, api , settings){
        const program = Program.new(mintingScript)
        const simplify = true
        const myUplcProgram = program.compile(simplify)
        const mintingRawScript = { type: "PlutusV2", script : JSON.parse(myUplcProgram.serialize()).cborHex }
        console.log(mintingRawScript)
        const lucid = await this.newLucidInstance(settings)
        lucid.setWallet(api)

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