import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import MultisigContainer from './components/Multisig/MultisigContainer';
import SmartWalletContainer from './components/SmartWallet/SmartWalletContainer';
import { ToastContainer, toast } from 'react-toastify';
import './components/ReactToastify.css';
import TermsAndConditionsBanner from './components/TermsBanner';
import NavBar from './components/NavBar';
import { getNewLucidInstance } from './helpers/newLucid.js';
import SettingsModal from "./components/SettingsModal";
import Minting from './components/Minting/minting';
import WalletPicker from "./components/WalletPicker"
import AffiliateModal from "./components/Minting/affiliateModal";


class App extends React.Component {
  state= {
    modal: "",
    module : "",
    settings: { metadataProvider :"Blockfrost", 
                sendAll: false, 
                network: "Mainnet", 
                explorer: "https://cardanoscan.io/" , 
                provider: "Blockfrost" , 
                disableSync: false,
                termsAccepted: "NotAccepted",
                api :  {"url": "https://passthrough.broclan.io" , "projectId": "mainnet"} 
                },
    mode: "darkMode",
    syncService: "https://sync.broclan.io",
    walletPicker: undefined
  }
  
   setState(state){
    super.setState(state)
    if (state.settings){
      localStorage.setItem("settings", JSON.stringify(state.settings))
    } 
    if (state.module){
      localStorage.setItem("module", state.module)
    }
    if(state.mode){
      localStorage.setItem("mode", state.mode)
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
    }
  }
  this.loadState()
}

  loadState(){
    const mode = localStorage.getItem("mode") ? localStorage.getItem("mode") : this.state.mode
    this.setState({mode})
    const settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : this.state.settings
    this.setState({settings})
    const module = localStorage.getItem("module") ? localStorage.getItem("module") : "multisig" 
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

    this.setState({settings})
  }

  async checkSettings(settings){
    try{
      const provider = await getNewLucidInstance(settings)

      await provider.provider.getProtocolParameters()
      
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

  async setMode(mode){  
    this.setState({mode})
  }

  async toggleMode(){
    const mode = this.state.mode === "lightMode" ? "darkMode" : "lightMode"
    this.setState({mode})
  }

  openWalletPicker(operation){
    this.setState({walletPicker: operation})
    this.showModal("walletPicker")
  }





  render() {
    return (
      <div className={`App ${this.state.mode}`}>
        <div className="appBackground">
        { this.state.modal === "walletPicker"  && <WalletPicker setOpenModal={() => this.showModal()} operation={this.state.walletPicker} /> }
        {this.state.modal === "affiliate" &&  <AffiliateModal setOpenModal={() => this.showModal()} />}
        { this.state.modal === "settings" ? <SettingsModal setOpenModal={() => this.showModal()} root={this} /> : "" }

        <ToastContainer
          position="top-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          pauseOnHover
          theme="dark"
          />
        <br/>
     {this.state.module === "multisig" &&  <MultisigContainer root={this} settings={this.state.settings} /> }
     {this.state.module === "smartWallets" &&  <SmartWalletContainer root={this} settings={this.state.settings} /> }
     {this.state.module === "minting" &&  <Minting root={this} settings={this.state.settings} /> }
      <TermsAndConditionsBanner key={this.state.settings} root={this}/>
        <NavBar root={this} />
      </div>
   </div>
    );
    }

}

ReactDOM.render(<App />, document.getElementById('root'));