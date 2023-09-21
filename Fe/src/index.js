import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import MultisigContainer from './components/Multisig/MultisigContainer';
import { ToastContainer, toast } from 'react-toastify';
import './components/ReactToastify.css';
import TermsAndConditionsBanner from './components/TermsBanner';
import TestnetBanner from './components/TestnetBanner';
import NavBar from './components/NavBar';
import {  Blockfrost ,Kupmios} from "lucid-cardano";
import SettingsModal from "./components/SettingsModal";
import TokenVaultsContainer from './components/TokenVault/TokenVaultContainer';
import Minting from './components/Minting/minting';

class App extends React.Component {
  state= {
    modal: "",
    module : "multisig",
    settings: { metadataProvider :"Blockfrost", 
                sendAll: false, 
                network: "Preprod", 
                explorer: "https://preprod.cardanoscan.io/" , 
                provider: "Blockfrost" , 
                disableSync: false,
                termsAccepted: "NotAccepted",
                api :  {"url": "https://passthrough.broclan.io" , "projectId": "preprod"} 
                },
                
    syncService: "https://sync.broclan.io"
  }
  
   setState(state){
    super.setState(state)
    if (state.settings){
      localStorage.setItem("settings", JSON.stringify(state.settings))
    } 
    if (state.module){
      localStorage.setItem("module", state.module)
    }

  }

  componentDidMount() {
    const queryParameters = new URLSearchParams(window.location.search)
    const affiliate = queryParameters.get("affiliate")
    if (affiliate){
      const affiliateOld = localStorage.getItem("affiliate") ? JSON.parse(localStorage.getItem("affiliate")) : undefined
      // 30 days
      if(!affiliateOld || (affiliateOld && affiliateOld.time < Date.now() - 2592000000)){
      localStorage.setItem("affiliate", JSON.stringify({affiliate , time: Date.now()}))
      console.log(`Welcome to Broclan!`, affiliate)
    }
  }
  this.loadState()
}

  loadState(){
    const settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : this.state.settings
    this.setState({settings})
    const module = localStorage.getItem("module") ? localStorage.getItem("module") : this.state.module
    this.setState({module})
  }
  setModule(module){
    this.setState({module})
  }

  async setSettings(newSettings){
    const valid = await this.checkSettings(newSettings)
    if (!valid){
      throw ("Invalid settings");
      return
    }
    const settings = {...this.state.settings, ...newSettings}
    localStorage.setItem("settings", JSON.stringify(newSettings))

    this.setState({settings})
  }

  async checkSettings(settings){
    try{
      if (settings.provider === "Blockfrost"){
        const provider = new Blockfrost(settings.api.url, settings.api.projectId)
        await provider.getProtocolParameters()
      }else if (settings.provider === "Kupmios"){
        const provider = new Kupmios(settings.api.kupoUrl, settings.api.ogmiosUrl)
        await provider.getProtocolParameters()
      }else if (settings.provider === "MWallet"){
        const provider = new Blockfrost(settings.api.url, settings.api.projectId)
        await provider.getProtocolParameters()
      }
      return true
    }catch(e){
      console.log(e)
      return false
    }
  }

  showModal(modal){
    this.setState({modal})
  }
  async toggleSendAll(){
    const settings = this.state.settings
    settings.sendAll = !settings.sendAll
    this.setState({settings})
  }

  async toggleDisableSync(){
    const settings = this.state.settings
    settings.disableSync = !settings.disableSync
    this.setState({settings})
  }


  render() {
    return (
      <div className='App'>
       { this.state.modal === "settings" ? <SettingsModal setOpenModal={() => this.showModal()} root={this} /> : "" }

        <TestnetBanner />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          pauseOnHover
          theme="dark"
          />
        <NavBar root={this} />
        <br/>
     {this.state.module === "multisig" &&  <MultisigContainer root={this} settings={this.state.settings} /> }
     {this.state.module === "tokenVault" &&  <TokenVaultsContainer root={this} settings={this.state.settings} /> }
     {this.state.module === "minting" &&  <Minting root={this} settings={this.state.settings} /> }
      <TermsAndConditionsBanner key={this.state.settings} root={this}/>
   </div>
    );
    }

}

ReactDOM.render(<App />, document.getElementById('root'));