import React from "react";
import { toast } from "react-toastify";
import "./ImportModule.css";

interface ImportProps {
  root: any;
  moduleRoot: any;
}

interface ImportState {
  walletId: string;
}

class ImportModule extends React.Component<ImportProps, ImportState> {
  state: ImportState = {
    walletId: "",
  };

  closeModule = () => {
    this.props.moduleRoot.showModal("newWallet");
  };

  importWallet = () => {
    if (!this.state.walletId.trim()) {
      toast.error("Please enter a wallet ID");
      return;
    }
    this.props.moduleRoot.addWallet(this.state.walletId, this.state.walletId);
    this.closeModule();
  };

  render() {
    return (
      <div className="modalBackground" onClick={this.closeModule}>
        <div className="ImportModule" onClick={(e) => e.stopPropagation()}>
          <div className="ImportModule-content">
            <div className="titleCloseBtn">
              <button onClick={this.closeModule}>X</button>
            </div>
            <div className="importDescription">
              <h1>Import Smart Wallet</h1>
              <p>Enter your wallet ID to import an existing smart wallet</p>
              <input
                type="text"
                placeholder="Enter your wallet ID *"
                value={this.state.walletId}
                onChange={(e) => this.setState({ walletId: e.target.value })}
                required
              />
              <button className="commonBtn" onClick={this.importWallet}>
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ImportModule;
