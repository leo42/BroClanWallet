import React from "react";
import "./UpdateWalletModal.css";
import { toast } from "react-toastify";
import getTokenInfo from "../../helpers/tokenInfo";
import { TokenInfo } from "../../helpers/tokenInfo";
import SmartWallet from "./smartWallet"; // Changed to default import
import SmartWalletContainer from "./SmartWalletContainer";
import { SmartMultisigJson, SmartMultisigDescriptorType } from "./types";
import { getAddressDetails } from "@lucid-evolution/lucid";
type VerificationKeyHash = string;
type PolicyId = string;
type AssetName = string;

type SmartMultisigDescriptor = 
  | { type: "KeyHash"; keyHash: VerificationKeyHash }
  | { type: "NftHolder"; policy: PolicyId; name: AssetName , tokenData: TokenInfo | null }      
  | { type: "AtLeast"; scripts: SmartMultisigDescriptor[]; m: number }
  | { type: "Before"; time: number }
  | { type: "After"; time: number }
  | { type: "Script"; scriptHash: string }

interface AddWalletModalProps {
  root: any; // Replace with actual type
  moduleRoot: SmartWalletContainer; // Replace with actual type
  wallet: SmartWallet; // Replace with actual type
  setOpenModal: (isOpen: boolean) => void;
  hostModal: (isHost: boolean) => void;
}

interface AddWalletModalState {
  json: SmartMultisigDescriptor;
  WName: string;
  signers: { hash: string; name: string; isDefault: boolean; }[];
}

class UpdateWalletModal extends React.Component<AddWalletModalProps, AddWalletModalState> {
  state: AddWalletModalState = {
    json: {
      type: "AtLeast",
      scripts: [
        { type: "NftHolder", policy: "", name: "" , tokenData: null},
        { type: "KeyHash", keyHash: "" },
      ],
      m: 1
    },
    WName: "",
    signers: this.props.moduleRoot.getSigners(),
  };

  policyMap : Map<string, string> = new Map([
      ["adaHandle", "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a"],
      ["Custom", ""]
    ]);

  
  options = [
    { name: "KeyHash", value: "KeyHash" },
    { name: "NftHolder", value: "NftHolder" },
    { name: "AtLeast", value: "AtLeast" },
    { name: "Before", value: "Before" },
    { name: "After", value: "After" },
    { name: "Script", value: "Script" },
  ];

  presetOptions = [
    { name: "Examples", value: "None" },
    { name: "Social Recovery", value: "Social Recovery" },
    { name: "2 of 3", value: "2 of 3" },
    { name: "Shared Bank Account", value: "Shared Bank Account" },
    { name: "Paranoid Vault", value: "Paranoid Vault" },
  ];

  debouncedFunctions: Map<string, (...args: typeof debounce[]) => void> = new Map();

  isAddressValid = (address: string): boolean => {
     return this.ifValidKeyHash(this.keyHashOff(address))
  };

  keyHashOff(addressOrKeyHash: string): string {
    try{
    const details = getAddressDetails(addressOrKeyHash)
    return details.paymentCredential?.hash || ''
  }
  catch(error: any){
    console.log("error", error)
  }
    return addressOrKeyHash
  }

  ifValidKeyHash(keyHash: string): boolean {
    // KeyHash is fixed length hex string
    return /^[0-9a-fA-F]{56}$/.test(keyHash);
  }

  checkAllAddresses = (scripts: SmartMultisigDescriptor[]): boolean => {
    let valid = true;
    for (const script of scripts) {
      if (script.type === "KeyHash") {
        const validAddress = this.isAddressValid(script.keyHash);
        valid = valid && validAddress;
        if (!validAddress) {
          toast.error(`Invalid address: ${script.keyHash}`);
        }
      } else if (script.type === "AtLeast") {
        valid = valid && this.checkAllAddresses(script.scripts);
      }
    }
    return valid;
  };

  componentDidMount() {
    // get current config
    this.props.wallet.getConfig().then((config) => {
      this.setState({ json: this.toSmartMultisigDescriptor(config) })
    })

  }

  setJson = (json: SmartMultisigDescriptor) => {
    this.setState({ json });
  };

  setWName = (WName: string) => {
    this.setState({ WName });
  };

// ... existing code ...

toSmartMultisigDescriptor = (json: SmartMultisigJson): SmartMultisigDescriptor => {
  switch (json.Type) {
    case SmartMultisigDescriptorType.KeyHash:
      return { type: "KeyHash", keyHash: json.keyHash };
    case SmartMultisigDescriptorType.NftHolder:
      return { type: "NftHolder", policy: json.policy, name: json.name, tokenData: null };
    case SmartMultisigDescriptorType.AtLeast:
      return { type: "AtLeast", scripts: json.scripts.map(script => this.toSmartMultisigDescriptor(script)), m: json.m };
    case SmartMultisigDescriptorType.Before:
      return { type: "Before", time: json.time };
    case SmartMultisigDescriptorType.After:
      return { type: "After", time: json.time };
    case SmartMultisigDescriptorType.ScriptRef:
      return { type: "Script", scriptHash: json.scriptHash };
    default:
      throw new Error("Invalid SmartMultisigDescriptor type");
  }
};

toSmartMultisigJson = (json: SmartMultisigDescriptor): SmartMultisigJson => {
  switch (json.type) {
    case "KeyHash":
      return {
        Type: SmartMultisigDescriptorType.KeyHash,
        keyHash: json.keyHash
      };
    case "NftHolder":
      return {
        Type: SmartMultisigDescriptorType.NftHolder,
        name: json.name,
        policy: json.policy
      };
    case "AtLeast":
      return {
        Type: SmartMultisigDescriptorType.AtLeast,
          m: json.m,
          scripts: json.scripts.map(script => this.toSmartMultisigJson(script))
      };
    case "Before":
      return {
        Type: SmartMultisigDescriptorType.Before,
          time: json.time
      };
    case "After":
      return {
        Type: SmartMultisigDescriptorType.After,
          time: json.time
      };
    case "Script":
      return {
        Type: SmartMultisigDescriptorType.ScriptRef,
        scriptHash: json.scriptHash
      };
    default:
      throw new Error("Invalid SmartMultisigDescriptor type");
    }
  };

  handleSubmit = () => {
    if (this.state.json.type === "AtLeast" && this.checkAllAddresses(this.state.json.scripts)) {
      const signers = this.state.signers.filter(signer => signer.isDefault).map(signer => signer.hash);
      this.props.moduleRoot.createUpdateTx(signers, this.toSmartMultisigJson(this.state.json));
      this.props.setOpenModal(false);
      this.props.hostModal(false);
    }
  };

  handlePresetChange = (value: string) => {
    let json: SmartMultisigDescriptor;
    switch (value) {
      case "Social Recovery":
        json = {
          type: "AtLeast",
          scripts: [
            { type: "KeyHash", keyHash: "" },
            {
              type: "AtLeast",
              scripts: [
                { type: "KeyHash", keyHash: "" },
                { type: "KeyHash", keyHash: "" },
                { type: "KeyHash", keyHash: "" }
              ],
              m: 3
            }
          ],
          m: 1
        };
        break;
      case "2 of 3":
        json = {
          type: "AtLeast",
          scripts: [
            { type: "KeyHash", keyHash: "" },
            { type: "KeyHash", keyHash: "" },
            { type: "KeyHash", keyHash: "" }
          ],
          m: 2
        };
        break;
      case "Shared Bank Account":
        json = {
          type: "AtLeast",
          scripts: [
            { type: "KeyHash", keyHash: "" },
            { type: "KeyHash", keyHash: "" }
          ],
          m: 1
        };
        break;
      case "Paranoid Vault":
        json = {
          type: "AtLeast",
          scripts: [
            { type: "KeyHash", keyHash: "" },
            { type: "KeyHash", keyHash: "" },
            { type: "KeyHash", keyHash: "" },
            { type: "KeyHash", keyHash: "" },
            { type: "KeyHash", keyHash: "" },
            { type: "KeyHash", keyHash: "" },
            { type: "KeyHash", keyHash: "" }
          ],
          m: 5
        };
        break;
      default:
        return;
    }

    this.setState({ json });
  };


  atLeastComponent = (json: SmartMultisigDescriptor, coordinates: number[]) => {
    if (json.type !== "AtLeast" || json.scripts === undefined) {
      return null;
    }
    return (
      <div className="atLeast">
        <input
          required
          type="number" 
          name="amount"
          value={json.m}
          onChange={(event) => this.handleRequiredChange(event.target.value, coordinates)}
        /> of {json.scripts.length}
        {json.scripts.map((item, index) => (this.rootComponenent(item, [...coordinates, index])))}
        <button className="btn" onClick={() => this.handleAddScript(coordinates)}>Add</button>
      </div>
    );
  };

  

  handleAddScript = (coordinates: number[]) => {
    const json = { ...this.state.json };
    let current = json;


    for (const index of coordinates) {
      if (current.type !== "AtLeast") {
        return;
      }
      current = current.scripts[index];
    } 
    if (current.type !== "AtLeast") {
      return;
      }

    current.scripts.push({ type: "KeyHash", keyHash: ""  });
    this.setState({ json });
  };

  handleRequiredChange = (value: string, coordinates: number[]) => {
    const json = { ...this.state.json };
    let current = json;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") {
        return;
      }
      current = current.scripts[index];
    }
    if (current.type !== "AtLeast") {
      return;
    }
    current.m = Number.parseInt(value);
    this.setState({ json });
  };

  handleSignatoryNameChange = (value: string, coordinates: number[]) => {
    const json = { ...this.state.json };
    let current = json;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") {
        return;
      }
      current = current.scripts[index];
    }
    if (current.type !== "KeyHash") {
      return;
    }
    this.props.moduleRoot.updateSignerName(this.keyHashOff(current.keyHash), value)
  };

  handleSlotChange = (value: number, coordinates: number[]) => {
    const json = { ...this.state.json };
    if (Number(value) < 0 || Number(value) > 214748364700) {
      return;
    }
    let current = json;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") {
        return;
      }
      current = current.scripts[index];
    }
    if (current.type !== "Before" && current.type !== "After") {
      return;
    }

    current.time = value ? value :  current.time;
    this.setState({ json });
  };


  handleKeyHashChange = (value: string, coordinates: number[]) => {
    const json = { ...this.state.json };
    let current = json;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") {
        return;
      }
      current = current.scripts[index];
    }
    if (current.type !== "KeyHash") {
      return;
    }
    current.keyHash = value;
    this.setState({ json });
  };

  handlePolicyTypeChange = (value: string, coordinates: number[]) => {
    const json = { ...this.state.json };
    let current = json;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") {
        return;
      }
      current = current.scripts[index];
    }

    if (current.type !== "NftHolder") {
      return;
    }
    current.policy = this.policyMap.get(value) || "";
    this.setState({ json });
    this.debouncedhandleNftHolderChange(coordinates);

  }

  
  sigComponent = (json: SmartMultisigDescriptor, coordinates: number[]) => {
    if (json.type !== "KeyHash") {
      return null;
    }
    const validAddress = this.isAddressValid(json.keyHash);
    return (
      <div className={validAddress ? " sigWrap valid" : "sigWrap invalid"} >
        <div className="input_wrap" > 
          <input
            className="createWalletName"
            required
            type="text"
            placeholder="Nickname"
            name="amount"
            value={this.props.moduleRoot.getSignerName(json.keyHash)}
            onChange={(event) => this.handleSignatoryNameChange(event.target.value, coordinates)}
          />
        </div>
        <div className={"input_wrap "}>
          <input
            className="createWalletAddress"
            required
            placeholder="Address/ KeyHash"
            type="text"
            name="amount"
            value={json.keyHash}
            onChange={(event) => this.handleKeyHashChange(event.target.value, coordinates)}
          />
          
        </div>
      </div>
    );
  };

  beforeComponent = (json: SmartMultisigDescriptor, coordinates: number[]) => {
    if (json.type !== "Before") {
      return null;
    }
    return (
      <React.Fragment>
        <div className="input_wrap beforeSlot">
          <div className="beforeAndAfterSlot">
            <input
              required
              type="text"
              placeholder="Before Slot"
              name="amount"
              value={json.time}
              onChange={(event) => this.handleSlotChange(Number(event.target.value), coordinates)}
            />
            <input
              type="datetime-local"
              name="amount"
              value={new Date(json.time ).toISOString().slice(0, 16)}
              onChange={(event) => this.handleSlotChange(Number(event.target.value), coordinates)}
            />
          </div>
          <p> <span>Warning:</span> Using the "Before" type could result in a permanently locked wallet! You need to withdraw your money <span>before</span> the above date!</p>
        </div>
      </React.Fragment>
    );
  };

  afterComponent = (json: SmartMultisigDescriptor, coordinates: number[]) => {
    if (json.type !== "After") {
      return null;
    }
    return (
      <React.Fragment>
        <div className="input_wrap beforeAndAfterSlot">
          <input
            required
            type="text"
            name="amount"
            value={json.time}
            placeholder="After Slot"
            onChange={(event) => this.handleSlotChange(Number(event.target.value), coordinates)}
          />
          <input
            type="datetime-local"
            name="amount"
            value={new Date(json.time - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
            onChange={(event) => this.handleSlotChange(new Date(new Date(event.target.value)).getTime(), coordinates)}
          />
        </div>
      </React.Fragment>
    );
  };

  nftHolderComponent = (json: SmartMultisigDescriptor, coordinates: number[]) => {
    if (json.type !== "NftHolder") {
      return null;
    }
    console.log(json.policy, "policy", Array.from(this.policyMap.keys()))
    const foundKey = Array.from(this.policyMap.values()).find(value => value === json.policy);
    console.log(foundKey, "foundKey")
    const policyType = foundKey ? foundKey : "Custom";
    const policyValid = /^[0-9a-fA-F]{56}$/.test(json.policy);

    return (
      <div className={`nftHolder`} >
        <div className="nftHolderInput">
        <div className={`policy ${policyValid ? 'policyValid' : 'policyInvalid'}`} >
        <select
          name="policyType"
          value={policyType}
          onChange={(event) => this.handlePolicyTypeChange(event.target.value, coordinates)}
        >
          {Array.from(this.policyMap.keys()).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
        {policyType === "Custom" && (
          <input
            required  
            type="text"
            placeholder="Policy ID"
            name="amount"
            value={json.policy}
            onChange={(event) => this.handlePolicyChange(event.target.value, coordinates)}
          />
        )}
        </div>
        <input
          required
          type="text"
          placeholder="Asset Name"
          name="amount"
          value={json.name}
          onChange={(event) => this.handleAssetNameChange(event.target.value, coordinates)}
        />
        </div>


        <div className="nftInfo">
          {json.tokenData ? <img src={json.tokenData.image} alt="NFT" /> : <p>No NFT found</p>}
        </div>

      </div>
    );
  };

  scriptComponent = (json: SmartMultisigDescriptor, coordinates: number[]) => {
    if (json.type !== "Script") {
      return null;
    }
    return (
      <div className="sigWrap">
        <div className="input_wrap">
          <input
            required
            type="text"
            placeholder="Script Hash"
            name="amount"
            className="scriptHash"
            value={json.scriptHash}
            onChange={(event) => this.handleScriptHashChange(event.target.value, coordinates)}
          />
        </div>
      </div>
    );
  };  

  handleScriptHashChange = (value: string, coordinates: number[]) => {
    const json = { ...this.state.json };
    let current = json;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") {
        return;
      }
      current = current.scripts[index];
    }
    if (current.type !== "Script") {
      return;
    }
    current.scriptHash = value;
    this.setState({ json });
  };

  handlePolicyChange = (value: string, coordinates: number[]) => {
    console.log(value, "policy")
    const json = { ...this.state.json };
    let current = json;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") {
        return;
      }
      current = current.scripts[index];
    }
    if (current.type !== "NftHolder") {
      return;
    }
    current.policy = value;
    this.setState({ json });
    try {
      this.debouncedhandleNftHolderChange(coordinates);
    } catch (error) {
      console.error("Error in debouncedhandleNftHolderChange:", error);
    }
  };

  handleAssetNameChange = (value: string, coordinates: number[]) => {
    const json = { ...this.state.json };
    let current = json;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") {
        return;
      }
      current = current.scripts[index];
    }
    if (current.type !== "NftHolder") {
      return;
    }
    current.name = value;
    this.setState({ json });
    try {
      this.debouncedhandleNftHolderChange(coordinates);
    } catch (error) {
      console.error("Error in debouncedhandleNftHolderChange:", error);
    }
  };

  handleNftHolderChange = async (coordinates: number[]) => {
    console.log("handleNftHolderChange called with coordinates:", coordinates);
    const json = { ...this.state.json };
    let current = json;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") return;
      current = current.scripts[index];
    }
    if (current.type !== "NftHolder") return;
    
    try {
      const hexName = /^[0-9a-fA-F]+$/.test(current.name) ? current.name : current.name.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      const tokenInfo = await getTokenInfo(current.policy + hexName);
      current.tokenData = tokenInfo.image === "" ? null : tokenInfo;
    } catch (error) {
      console.error("Error fetching token info:", error);
    }
    
    this.setState({ json });
  };

  debouncedhandleNftHolderChange = (coordinates: number[]) => {
    const key = coordinates.join(',');
    if (!this.debouncedFunctions.has(key)) {
      this.debouncedFunctions.set(
        key,
        debounce(() => this.handleNftHolderChange(coordinates), 1000)
      );
    }
    const debouncedFn = this.debouncedFunctions.get(key);
    if (debouncedFn) debouncedFn();
  };

  deleteElement = (value: any, coordinates: number[]) => {
    const json = { ...this.state.json };
    let current = json;
    let previus;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") {
        return;
      }
      previus = current;
      current = current.scripts[index];
    }
    previus!.scripts.splice(coordinates[coordinates.length - 1], 1);
    this.setState({ json });
  };

  handleTypeChange = (value: string, coordinates: number[]) => {
    const json = { ...this.state.json };
    let current: SmartMultisigDescriptor = json;
    let parent: any = null;
    
    // Navigate to the correct node
    for (let i = 0; i < coordinates.length; i++) {
      const index = coordinates[i];
      if (current.type !== "AtLeast") {
        return;
      }
      parent = current;
      current = current.scripts[index];
    }

    // Create new element based on selected type
    let newElement: SmartMultisigDescriptor;
    switch (value) {
      case "AtLeast":
        newElement = { 
          type: "AtLeast",
          scripts: [
            { type: "KeyHash", keyHash: "" },
            { type: "KeyHash", keyHash: "" }
          ],
          m: 1
        };
        break;
      case "Before":
        newElement = {
          type: "Before",
          time: Math.floor(Date.now() / 1000) // Current timestamp in seconds
        };
        break;
      case "After":
        newElement = {  
          type: "After",
          time: Math.floor(Date.now() / 1000) // Current timestamp in seconds
        };
        break;
      case "KeyHash":
        newElement = {
          type: "KeyHash",
          keyHash: ""
        };
        break;
      case "NftHolder":
        newElement = {
          type: "NftHolder",
          policy: "",
          name: "",
          tokenData: null
        };
        break;
      case "Script":
        newElement = {
          type: "Script",
          scriptHash: ""
        };
        break;
      default:
        return; // Invalid type
    }

    // Update the node
    if (parent) {
      parent.scripts[coordinates[coordinates.length - 1]] = newElement;
    } else {
      // If we're at the root level
      this.setState({ json: newElement });
      return;
    }

    this.setState({ json });
  };

  rootComponenent = (json: SmartMultisigDescriptor, coordinates: number[] = []) => {
    const extraClasses = `WalletCreateColor${coordinates?.length % 2} WalletCreateType${json.type}`;
    let content;

    switch (json.type) {
      case "AtLeast":
        content = this.atLeastComponent(json, coordinates);
        break;
      case "Before":
        content = this.beforeComponent(json, coordinates);
        break;
      case "After":
        content = this.afterComponent(json, coordinates);
        break;
      case "KeyHash":
        content = this.sigComponent(json, coordinates);
        break;
      case "NftHolder":
        content = this.nftHolderComponent(json, coordinates);
        break;
      case "Script":
        content = this.scriptComponent(json, coordinates);
        break;
    }

    return (
      <div key={coordinates.join(',')} className={`rootElement ${extraClasses}`}>
        {coordinates.length === 0 ? "" : (
          <div className="deleteBtn">
            <button onClick={() => this.deleteElement(null, coordinates)}>x</button>
          </div>
        )}
        <div className="cardSelect">
          <select value={json.type} onChange={(event) => this.handleTypeChange(event.target.value, coordinates)}>
            {this.options.map(option => (
              <option key={option.name} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        {content}
      </div>
    );
  };

  handleOnChangeSigners(index: number) {
    const signers = [...this.state.signers];
    signers[index].isDefault = !signers[index].isDefault;
    this.setState({ signers });
  }
  

  SignersSelect = () => this.props.moduleRoot.getSigners().map( (item, index) => (
    
    <div key={index} >
   <label className='signerCheckbox'>
     {this.props.moduleRoot.getSigners()[index].name}:
     <input
       type="checkbox"
       name="value"
       value={index}
       className='signerCheckbox'
       checked={this.state.signers[index].isDefault} 
       onChange={  () =>  this.handleOnChangeSigners(index)  }
      
     />
   </label>
   </div>
  ) ) 

  render() {
    return (
      <div className="modalBackground">
        <div className="modalContainer">
          <div className="titleCloseBtn">
            <button onClick={() => this.props.setOpenModal(false)}>X</button>
          </div>
          <div className="title">
            <h1 className="createWalletModalTitle">Update Wallet</h1>
          </div>
          <div className="body">
            <select value="Examples" onChange={(event) => this.handlePresetChange(event.target.value)}>
              {this.presetOptions.map(option => (
                <option key={option.name} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
            <div className="input_wrap walletName">
              <input
                required
                type="text"
                name="name"
                value={this.state.WName}
                onChange={(event) => this.setWName(event.target.value)}
              />
              <label>Name your Wallet</label>
            </div>
            <div className="rootRoot">
              {this.rootComponenent(this.state.json)}
            </div>
          </div>
          {this.props.wallet.getSigners().length !== 0 && <div className='SignersSelect' ><h2> Signers:</h2>
      <div className='SignersSelectList'>
      { this.SignersSelect()}
      </div>
      </div>
  }          <div className="footer">
            <button onClick={this.handleSubmit}>Create Update Transaction</button>
            <button onClick={() => this.props.setOpenModal(false)} id="cancelBtn">Cancel</button>
          </div>
        </div>
      </div>
    );
  }
}

export default UpdateWalletModal;

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}