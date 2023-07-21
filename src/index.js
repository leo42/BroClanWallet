import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import MultisigContainer from './components/MultisigContainer';
import { ToastContainer, toast } from 'react-toastify';
import './components/ReactToastify.css';
import TermsAndConditionsBanner from './components/TermsBanner';
import TestnetBanner from './components/TestnetBanner';
import NavBar from './components/NavBar';
import {  Blockfrost ,Kupmios} from "lucid-cardano";
import SettingsModal from "./components/SettingsModal";


class App extends React.Component {
  state= {
    modal: "",
    settings: { metadataProvider :"Blockfrost", 
                sendAll: false, 
                network: "Preprod", 
                explorer: "https://preprod.cardanoscan.io/" , 
                provider: "Blockfrost" , 
                disableSync: false,
                termsAccepted: "NotAccepted",
                api :  {"url": "https://passthrough.broclan.io" , "projectId": "preprod"} 
                }
  }


  componentDidMount() {
    this.loadState()
  }

  loadState(){
    this.state.settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : this.state.settings
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
     
      <MultisigContainer root={this} settings={this.state.settings} />
      <TermsAndConditionsBanner root={this}/>
   </div>
    );
    }

}

ReactDOM.render(<App />, document.getElementById('root'));