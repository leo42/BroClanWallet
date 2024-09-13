import React from "react";
import "./UpdateWalletModal.css";
import { Lucid, C } from "lucid-cardano";
import { toast } from "react-toastify";
import getTokenInfo from "../../helpers/tokenInfo"

type VerificationKeyHash = string;
type PolicyId = string;
type AssetName = string;

type SmartMultisigDescriptor = 
  | { type: "KeyHash"; keyHash: VerificationKeyHash , name: string}
  | { type: "NftHolder"; policy: PolicyId; name: AssetName }
  | { type: "AtLeast"; scripts: SmartMultisigDescriptor[]; m: number }
  | { type: "Before"; time: number }
  | { type: "After"; time: number };

interface AddWalletModalProps {
  root: any; // Replace with actual type
  moduleRoot: any; // Replace with actual type
  setOpenModal: (isOpen: boolean) => void;
  hostModal: (isHost: boolean) => void;
}

interface AddWalletModalState {
  json: SmartMultisigDescriptor;
  WName: string;
}

class UpdateWalletModal extends React.Component<AddWalletModalProps, AddWalletModalState> {
  state: AddWalletModalState = {
    json: {
      type: "AtLeast",
      scripts: [
        { type: "KeyHash", keyHash: "", name: "" },
        { type: "KeyHash", keyHash: "", name: "" },
      ],
      m: 1
    },
    WName: ""
  };

  lucid: Lucid | null = null;

  options = [
    { name: "KeyHash", value: "KeyHash" },
    { name: "NftHolder", value: "NftHolder" },
    { name: "AtLeast", value: "AtLeast" },
    { name: "Before", value: "Before" },
    { name: "After", value: "After" },
  ];

  presetOptions = [
    { name: "Examples", value: "None" },
    { name: "Social Recovery", value: "Social Recovery" },
    { name: "2 of 3", value: "2 of 3" },
    { name: "Shared Bank Account", value: "Shared Bank Account" },
    { name: "Paranoid Vault", value: "Paranoid Vault" },
  ];

  isAddressValid = (address: string): boolean => {
    try {
      C.Ed25519KeyHash.from_hex(address);
      return true;
    } catch (error) {
      try {
        this.lucid?.utils.getAddressDetails(address);
        return true;
      } catch {
        return false;
      }
    }
  };

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
    Lucid.new(
      undefined,
      this.props.root.state.settings.network
    ).then((lucid) => {
      this.lucid = lucid;
    });
  }

  setJson = (json: SmartMultisigDescriptor) => {
    this.setState({ json });
  };

  setWName = (WName: string) => {
    this.setState({ WName });
  };

  handleSubmit = () => {
    if (this.state.json.type === "AtLeast" && this.checkAllAddresses(this.state.json.scripts)) {
      this.props.moduleRoot.addWallet(this.state.json, this.state.WName);
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
            { type: "KeyHash", keyHash: "", name: "" },
            {
              type: "AtLeast",
              scripts: [
                { type: "KeyHash", keyHash: "", name: "" },
                { type: "KeyHash", keyHash: "", name: "" },
                { type: "KeyHash", keyHash: "", name: "" }
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
            { type: "KeyHash", keyHash: "", name: "" },
            { type: "KeyHash", keyHash: "", name: "" },
            { type: "KeyHash", keyHash: "", name: "" }
          ],
          m: 2
        };
        break;
      case "Shared Bank Account":
        json = {
          type: "AtLeast",
          scripts: [
            { type: "KeyHash", keyHash: "", name: "" },
            { type: "KeyHash", keyHash: "", name: "" }
          ],
          m: 1
        };
        break;
      case "Paranoid Vault":
        json = {
          type: "AtLeast",
          scripts: [
            { type: "KeyHash", keyHash: "", name: "" },
            { type: "KeyHash", keyHash: "", name: "" },
            { type: "KeyHash", keyHash: "", name: "" },
            { type: "KeyHash", keyHash: "", name: "" },
            { type: "KeyHash", keyHash: "", name: "" },
            { type: "KeyHash", keyHash: "", name: "" },
            { type: "KeyHash", keyHash: "", name: "" }
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

    current.scripts.push({ type: "KeyHash", keyHash: "", name: ""  });
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
    current.name = value;
    this.setState({ json });
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

  sigComponent = (json: SmartMultisigDescriptor, coordinates: number[]) => {
    if (json.type !== "KeyHash") {
      return null;
    }
    return (
      <div className="sigWrap">
        <div className="input_wrap">
          <input
            className="createWalletName"
            required
            type="text"
            placeholder="Nickname"
            name="amount"
            value={json.name}
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
    return (
      <div className="nftHolder">
        <input
          required  
          type="text"
          placeholder="Policy ID"
          name="amount"
          value={json.policy}
          onChange={(event) => this.handlePolicyChange(event.target.value, coordinates)}
        />
        <input
          required
          type="text"
          placeholder="Asset Name"
          name="amount"
          value={json.name}
          onChange={(event) => this.handleAssetNameChange(event.target.value, coordinates)}
        />
      </div>
    );
  };

  handlePolicyChange = (value: string, coordinates: number[]) => {
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
    this.debouncedhandleNftHolderChange(coordinates);
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
    this.debouncedhandleNftHolderChange(coordinates);
  };

  
  
  handleNftHolderChange = async (coordinates: number[]) => {
    const json = { ...this.state.json };
    let current = json;
    for (const index of coordinates) {
      if (current.type !== "AtLeast") return;
      current = current.scripts[index];
    }
    if (current.type !== "NftHolder") return;
    
    
    try {
      const tokenInfo = await getTokenInfo(current.policy + current.name);
      current.name = tokenInfo.name || '';
    } catch (error) {
      console.error("Error fetching token info:", error);
    }
    
    this.setState({ json });
  };
  
  debouncedhandleNftHolderChange = debounce((coordinates: number[]) => this.handleNftHolderChange(coordinates), 1000);

  
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
            { type: "KeyHash", keyHash: "", name: "" },
            { type: "KeyHash", keyHash: "", name: "" }
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
          keyHash: "",
          name: ""
        };
        break;
      case "NftHolder":
        newElement = {
          type: "NftHolder",
          policy: "",
          name: ""
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

  render() {
    return (
      <div className="modalBackground">
        <div className="modalContainer">
          <div className="titleCloseBtn">
            <button onClick={() => this.props.setOpenModal(false)}>X</button>
          </div>
          <div className="title">
            <h1 className="createWalletModalTitle">Create Wallet</h1>
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
          <div className="footer">
            <button onClick={this.handleSubmit}>Create</button>
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