import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import MultisigContainer from './components/Multisig/MultisigContainer';
import SmartWalletContainer from './components/SmartWallet/SmartWalletContainer';
import { ToastContainer, toast } from 'react-toastify';
import './components/ReactToastify.css';
import TermsAndConditionsBanner from './components/TermsBanner';
import NavBar from './components/NavBar';

import { getNewLucidInstance } from './helpers/newLucidEvolution';
import SettingsModal from "./components/SettingsModal";
// import Minting from './components/Minting/minting';
import WalletPicker from "./components/WalletPicker"


export type Settings = { metadataProvider: string; 
                        sendAll: boolean;
                        network: string;
                        explorer: string;
                        provider: string;
                        disableSync: boolean;
                        termsAccepted: string;
                        api: {
                          url?: string;
                          projectId?: string;
                          apiKey?: string;
                          kupoUrl?: string;
                          ogmiosUrl?: string;
                        }
                      }




export type AppState = {
  modal: string;
  module: string;
  settings: Settings;
  mode: string;
  syncService: string;
  smartSyncService: string;
  walletPicker: (wallet: string) => void | undefined;

};

export class App extends React.Component<{}, AppState> {
  state: AppState = {
    modal: "",
    module: "",
    settings: { metadataProvider: "Blockfrost",

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
    smartSyncService: "localhost:3001",
    walletPicker: (wallet: string) => { }
  }
  
  setState(state: AppState){
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
      const affiliateOld = localStorage.getItem("affiliate") ? JSON.parse(localStorage.getItem("affiliate") || "{}") : undefined
      // 30 days
      if(!affiliateOld || (affiliateOld && affiliateOld.time < Date.now() - 2592000000)){
      localStorage.setItem("affiliate", JSON.stringify({affiliate , time: Date.now()}))
    }
  }
  this.loadState()
}

  loadState(){
    const state = this.state
    const mode = localStorage.getItem("mode") 
    state.mode = mode !== null ? mode : "darkMode"
    const settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings") || "{}") : this.state.settings
    state.settings = settings
    const termsAccepted = localStorage.getItem("termsAccepted") ? localStorage.getItem("termsAccepted") : this.state.settings.termsAccepted
    state.settings.termsAccepted = termsAccepted !== null ? termsAccepted : "NotAccepted"
    const module = localStorage.getItem("module") ? localStorage.getItem("module") : "multisig" 
    state.module = module !== null ? module : "multisig"
    this.setState(state)
  }

  setModule(module: string){
    const state = this.state
    state.module = module
    this.setState(state)
  }


  acceptTerms(version: string){
    const state = this.state
    state.settings.termsAccepted = version
    this.setState(state)
  }



  async setSettings(newSettings: Settings){
    const valid = await this.checkSettings(newSettings)
    if (!valid){
      throw ("Invalid settings");
    }
    const settings = {...this.state.settings, ...newSettings}
    const state = this.state
    state.settings = settings
    this.setState(state)
  }


  async checkSettings(settings: Settings){
    try{
      const provider = await getNewLucidInstance(settings)
      await provider.config().provider?.getProtocolParameters()
      


      return true
    }catch(e){
      console.log(e)
      return false
    }
  }

  showModal(modal: string){
    console.log("showModal", modal)
    const state = this.state
    state.modal = modal
    this.setState(state)
  }


  async toggleSendAll(){
    const state = this.state
    state.settings.sendAll = !state.settings.sendAll
    this.setState(state)
  }


  async toggleDisableSync(){
    const state = this.state
    state.settings.disableSync = !state.settings.disableSync
    this.setState(state)
  }


  async setMode(mode: string){  
    const state = this.state
    state.mode = mode
    this.setState(state)
  }



  async toggleMode(){
    const mode = this.state.mode === "lightMode" ? "darkMode" : "lightMode"
    const state = this.state
    state.mode = mode
    this.setState(state)
  }


  openWalletPicker(operation: (wallet: string) => void){
    const state = this.state
    state.walletPicker = operation
    this.setState(state)
    this.showModal("walletPicker")
  }







  render() {
    return (
      <div className={`App ${this.state.mode}`}>
        <div className="appBackground">
        { this.state.modal === "walletPicker"  && <WalletPicker setOpenModal={(modal) => this.showModal(modal)} operation={this.state.walletPicker} /> }
        {/* {this.state.modal === "affiliate" &&  <AffiliateModal setOpenModal={() => this.showModal} />} */}

        { this.state.modal === "settings" ? <SettingsModal setOpenModal={(modal) => this.showModal(modal)} root={this} /> : "" }


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
     {this.state.module === "smartWallets" &&  <SmartWalletContainer root={this}   settings={this.state.settings} /> }
      <TermsAndConditionsBanner key={this.state.settings.termsAccepted} root={this}/>
        <NavBar root={this} />
      </div>
   </div>
    );
    }

}

ReactDOM.render(<App />, document.getElementById('root'));