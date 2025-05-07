import { ReactComponent as DetailsIcon } from '../../html/assets/details.svg';
import React, { useRef } from 'react';
import { ReactComponent as DownloadIcon } from '../../html/assets/download.svg';
import { ReactComponent as DeleteIcon } from '../../html/assets/delete.svg';
import './walletSetting.css'
import SmartWallet from '../../core/smartWallet';


interface WalletSettingsProps {
  wallet: SmartWallet;
  moduleRoot: any;
  closeSettings: () => void;
}



interface WalletSettingsState {
  closeSettings: () => void;
  wallet: SmartWallet;
  hovering: string;
  moduleRoot: any;
  showingDetails: string;
  isMobile: boolean;

}

class WalletSettings extends React.Component<WalletSettingsProps> {
  state: WalletSettingsState = {
    closeSettings: this.props.closeSettings,
    wallet: this.props.wallet,
    hovering: "",
    showingDetails: "",
    isMobile: false,
    moduleRoot: this.props.moduleRoot,
  };



  handleExport = () => {
    const element = document.createElement('a');
    const blob = new Blob([JSON.stringify(this.state.wallet.getId())], { type: "application/json" });
    element.href = URL.createObjectURL(blob);
    element.download = this.state.wallet.getName() + ".json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  
  
  walletJson = (json: any) => {
    const formattedData = JSON.stringify(json, null, 2);

    return (
      <div className="ImportWalletJsonInner" style={{ whiteSpace: 'pre-wrap' }}>
        {formattedData}
      </div>
    );

  };

  toggleDefultSigner = (ChangedSigner: string) => {
    const defaultSigners =  this.state.wallet.getSigners().map((signer: any) => { 
      if(signer.hash === ChangedSigner){
        signer.isDefault = !signer.isDefault
      }
      //return sigherHash if it is default
      return signer.isDefault ? signer.hash : ""
    }).filter((signer) => (signer !== ""))
    this.state.moduleRoot.setDefaultSigners(defaultSigners)
  }

  render() {
    return (
      <div className="modalBackground" onClick={() => this.props.closeSettings()} >
      <div className="walletSettingModalContainer" onClick={ (e) => e.stopPropagation()} >
     
      <div className="titleCloseBtn">
          <button
            onClick={() => {
              this.props.closeSettings();
            }}
          >X
          </button>
        </div>
      <div className="walletSettings">
        <h1>Wallet Settings</h1>
        <h2>{this.state.wallet.getId()}</h2>
        <label>
          <span>Wallet Name :</span>


            <input type="text" style={{width: "100px"}}  value={this.state.wallet.getName()} onChange={(event) => this.props.moduleRoot.changeWalletName(event.target.value)}></input>
        </label>
        {/* {this.props.r.state.module === "smartWallets" && <span className="smartWalletLabel">Id : {this.props.wallet.getId()}</span>} */}

        <div key= {JSON.stringify(this.state.wallet.defaultSignersValid())} className={this.state.wallet.defaultSignersValid() !== false ? "validSignerContainer" : "invalidSignerContainer" }> 
        <label>Default Signers</label>
        <br/>
        <div className='signerContainer'>    
          {this.state.wallet.getSigners().map((signer, index: number) => (
          <div className='signerContainerItem' key={index + this.state.wallet.getAddressName(signer.hash)}  >
            <input type="checkbox" checked={signer.isDefault} onChange={() => this.toggleDefultSigner(signer.hash)}></input>
           <input type="text" value={this.state.moduleRoot.getSignerName(signer.hash)} onChange={(event) => this.state.moduleRoot.updateSignerName(signer.hash, event.target.value)}></input> 
          </div>
        ))}
         </div>

        </div>
        <label>Collateral Donor :
          <select key={this.state.wallet.getCollateralDonor()} value={this.state.wallet.getCollateralDonor()} onChange={(event)=> this.props.moduleRoot.setCollateralDonor(event.target.value)} >
            <option value="" >None</option>
            {this.state.wallet.getSigners().filter((sighener: any) => sighener.isDefault).map( (item: any, index: number) => (
              <option key={index} value={item.hash} >{this.state.moduleRoot.getSignerName(item.hash)}</option>
            ))}
          </select>

        </label>
        <div className='overviewButtons'>      
        {/* <button onClick={() => this.props.moduleRoot.deleteWallet(this.props.moduleRoot.state.selectedWallet)}> Delete Wallet</button> */}
       
         <div  onMouseEnter={() => this.setState({hovering: "details"} )} onMouseLeave={() => this.setState({hovering: ""})} onClick={() => {
                              this.props.moduleRoot.setState({ modal : "updateWallet"})
                            }}  className='iconWraper detailsButton'> 
                        <DetailsIcon className="icon"  />
          {  (this.state.hovering === "details" || this.state.isMobile ) &&  <label className='iconLabel'>Update</label>}
          </div>
 
 
        <div  onMouseEnter={() => this.setState({hovering: "delete"} )} onMouseLeave={() => this.setState({hovering: ""})} onClick={() => this.props.moduleRoot.deleteWallet(this.props.moduleRoot.state.selectedWallet)}  className='iconWraper deleteButton'>
               
               <DeleteIcon className="icon"  />
               {  (this.state.hovering === "delete" || this.state.isMobile ) && <label className='iconLabel'>Delete</label> }
            </div>
            

       

      </div>
  
      </div>

      </div>
      </div>
    );
  }
}



export default WalletSettings;
