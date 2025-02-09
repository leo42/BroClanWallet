import "./SettingsModal.css";
import { useState} from 'react';
import {  toast } from 'react-toastify';
import { App } from '../index';

const MwalletPassthrough = "https://passthrough.broclan.io" 
function SettingsModal(props: {root : App, setOpenModal: (modal: string) => void}) {
  const [network, setNetwork] = useState(props.root.state.settings.network);
  const [provider, setProvider] = useState(props.root.state.settings.api.url === MwalletPassthrough ? "MWallet" :  props.root.state.settings.provider);
  const [providerConnection, setProviderConnection] = useState(props.root.state.settings.api);
  const [metadataProvider, setMetadataProvider] = useState(props.root.state.settings.metadataProvider);
  
  function networkChange(network: string){
    setNetwork(network)
  }

//  useEffect(() => {
//    setDefaultValues()
//  }, [provider, network, metadataProvider])


  function setDefaultValues(){
    if (provider === "Blockfrost"){
      setProviderConnection( {"projectId": ""})
    }else if (provider === "MWallet"){
      setProviderConnection({})
    }else if (provider === "Kupmios"){
      if (network === "Mainnet"){
        setProviderConnection({kupoUrl: "https://kupo-mainnet-wmalletmainnet-c8be04.us1.demeter.run" , ogmiosUrl: "wss://ogmios-wmalletmainnet-c8be04.us1.demeter.run"})
      }else if (network === "Preprod"){
        setProviderConnection({kupoUrl: "https://kupo-preprod-mwallet-e048ec.us1.demeter.run" , ogmiosUrl: "wss://ogmios-mwallet-e048ec.us1.demeter.run"})
      }else {
      setProviderConnection({"kupoUrl": "" , "ogmiosUrl": ""})
    }}

    if(metadataProvider==="Blockfrost"){
      const providerConnectionNew = {...providerConnection}
      providerConnectionNew.projectId = ""
      setProviderConnection( providerConnectionNew )
  }
}

  function resetSettings(){
    setProvider("MWallet")
    setMetadataProvider("Blockfrost")
    networkChange("Mainnet")

  }

  function changeProvider(provider: string){
    setProvider(provider)
    if(provider === "Blockfrost"){
      setProviderConnection({
        url: "",
        projectId: ""


      } )
    }else if(provider === "MWallet"){
      setProviderConnection({})
    }
    setDefaultValues()
  }
  
  function applyNetworkSettings() {
    try {
    let localproviderConnection = providerConnection
    if (provider === "Blockfrost"){
      if (providerConnection.url === "" || providerConnection.projectId === ""){

        toast.error("Please fill all fields");
        return
      }
      switch (network) {
        case "Mainnet": 
          localproviderConnection.url = "https://cardano-mainnet.blockfrost.io/api/v0"  
          break;
        case "Preview":
          localproviderConnection.url = "https://cardano-preview.blockfrost.io/api/v0"
          break;
        case "Preprod":
          localproviderConnection.url = "https://cardano-preprod.blockfrost.io/api/v0"
          break;
        case "Custom":
          localproviderConnection.url = providerConnection.url
          break;
        default:
          localproviderConnection.url = "https://cardano-preprod.blockfrost.io/api/v0"
          break;
      }

    }
    else if (provider === "Kupmios"){
      if (providerConnection.kupoUrl === "" || providerConnection.ogmiosUrl === ""){
        toast.error("Please fill all fields");
        return
      }
    }else if (provider === "MWallet"){
      localproviderConnection.url =  MwalletPassthrough

      switch (network) {
      case "Mainnet": 
      localproviderConnection.projectId = "mainnet"
      break;
    case "Preview":
      localproviderConnection.projectId = "preview"
      break;
    case "Preprod":
      localproviderConnection.projectId = "preprod"
      break;
    default:
      localproviderConnection.projectId = "custom"
      break;


  }
    }

      

    const applySetting = props.root.setSettings({
      "network": network,
      "provider": provider,
      "api": providerConnection,
      "metadataProvider": metadataProvider,
      "sendAll": props.root.state.settings.sendAll,
      "explorer": props.root.state.settings.explorer,
      "disableSync": props.root.state.settings.disableSync,
      "termsAccepted": props.root.state.settings.termsAccepted
    })
    toast.promise(applySetting, { pending: "Applying settings", 
                                  success: "Settings applied", 
                                  error: "Connection Failure" });


    } catch (error) {
      toast.error("Connection Failure");
    }



  }

  function providerSettings(){
    
    
    return (
      <div> {  
    ((provider === "Blockfrost" || metadataProvider === "Blockfrost" ) && provider !== "MWallet") && (
        <div>
          {network === "Custom" && <input type="text" placeholder="url" value={providerConnection.url ? providerConnection.url : ""} onChange={(event) => setProviderConnection({...providerConnection, url: event.target.value})} />} <br />
          <input type="text" placeholder="projectId" value={providerConnection.projectId ? providerConnection.projectId :  "" } onChange={(event) => setProviderConnection({...providerConnection, projectId: event.target.value})} />
        </div>)  }
    { provider === "Kupmios" &&( <div>
          <input type="text" placeholder="kupoUrl" value={providerConnection.kupoUrl ? providerConnection.kupoUrl : ""} onChange={(event) => setProviderConnection({...providerConnection, kupoUrl: event.target.value})} />    
          <br/>
          <input type="text" placeholder="ogmiosUrl" value={providerConnection.ogmiosUrl ? providerConnection.ogmiosUrl : "" } onChange={(event) => setProviderConnection({...providerConnection, ogmiosUrl: event.target.value})} />
          </div>
      )}
      { (provider === "Maestro" || metadataProvider === "Maestro") &&( <div> 
          <input type="text" placeholder="apiKey" value={providerConnection.apiKey ? providerConnection.apiKey : ""} onChange={(event) => setProviderConnection({...providerConnection, apiKey: event.target.value})} />    
          </div>
      )}
      </div>
    )
  }  



  return (
    <div className="modalBackground" onClick={() => { props.setOpenModal(""); }}>
      <div className="modalContainer"  onClick={ (e) => e.stopPropagation()}   >
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              props.setOpenModal("");
            }}
          >
            X

          </button>
        </div>
  
     
        <div className="body settingsModal">
          <h1>Settings</h1>
          <span> Network</span>   
        <select onChange={(event) => networkChange(event.target.value)} value={network} defaultValue={network}>
          <option value="Preprod">Preprod</option>
          <option value="Preview">Preview</option>
          <option value="Mainnet">Mainnet</option>
          { provider !== "MWallet" ? <option value="Custom">Custom</option>  : ""   }
        </select>
          {  network === "Mainnet" && ["alpha.broclan.io","beta.broclan.io","testnet.broclan.io"].includes(window.location.hostname)   && 
          <span className="warning">WARNING: This is a testnet deployment, make sure you understand the risks before using it on the mainnet.</span>   }

        <span> Provider</span>   
        <select onChange={(event) => changeProvider(event.target.value)} value={provider} defaultValue={provider}>
          <option value="Blockfrost">Blockfrost</option>
          <option value="MWallet">BroClan</option>
          <option value="Kupmios">Kupmios</option>
          <option value="Maestro">Maestro</option>
        </select>
        <span>Metadata Provider</span>
            <select onChange={(event) => setMetadataProvider(event.target.value)} value={metadataProvider} defaultValue={metadataProvider}>
              <option value="None">None</option>
              {/* <option value="Koios">Koios</option> */}
              <option value="Maestro">Maestro</option>
             { provider && <option value="Blockfrost">Blockfrost</option> }
            </select>

            {providerSettings()}

            <div className="sendAll">
          <label htmlFor="sendAll">Enable Send All</label>
           <input type="checkbox" id="sendAll" name="sendAll" checked={props.root.state.settings.sendAll} onChange={ () => props.root.toggleSendAll()} />
        </div>
        <div className="DisableSync">
          <label htmlFor="DisableSync">Disable All Sync</label>
          <input type="checkbox" name="EnableSync" checked={props.root.state.settings.disableSync} onChange={ () => props.root.toggleDisableSync()} />
        </div>
        <div className="footer">
         <button
            onClick={() => {
              applyNetworkSettings();
            }}
            id="applyButton">
            Apply
          </button>
          <br/>          
          <br/>

          <button
            onClick={() => {
              resetSettings();
            }}
            id="resetButton">
            Reset
          </button>
          </div> 
        
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;