import React from "react";
import "./AddWalletModal.css";
import { getAddressDetails , CML, Lucid, LucidEvolution, slotToUnixTime, Network, unixTimeToSlot} from "@lucid-evolution/lucid";
import { toast } from "react-toastify";
import { ReactComponent as CorrectIcon } from '../../html/assets/correct.svg';
import { ReactComponent as WrongIcon } from '../../html/assets/incorrect.svg';
import MultisigContainer from "./MultisigContainer";
import { App } from "../..";

type AddWalletModalProps = {
  moduleRoot: MultisigContainer;
  setOpenModal: (open: boolean) => void;
  hostModal: (open: boolean) => void;
  root: App;
};


export type  Native = {
  type: "sig";
  name: string;
  keyHash: string;
} | {
  type: "before";
  slot: number;
} | {
  type: "after";
  slot: number;
} | {
  type: "all";
  scripts: ReadonlyArray<Native>;
} | {
  type: "any";
  scripts: ReadonlyArray<Native>;
} | {
  type: "atLeast";
  required: number;
  scripts: ReadonlyArray<Native>;
};
type AddWalletModalState = {
  json: Native;
  WName: string;
};




class AddWalletModal extends React.Component<AddWalletModalProps> {
  state : AddWalletModalState = {  
    json: {
      "type": "all",

      "scripts":
      [
        {
          "type": "sig",
          "name" : "",
          "keyHash": ""
        },
        {
          "type": "sig",
          "name": "",
          "keyHash": ""
        },
      ]
    } , 
    WName : ""
  } 
  options = [{name:"All", value:"all"},
              {name:"Any", value:"any"},
              {name:"At least", value:"atLeast"},
              {name:"Before", value:"before"},
              {name:"After", value:"after"},
              {name:"Signatory", value:"sig"} ]

  presetOptions = [{name:"Examples", value: "None"},
                   {name:"Social Recovery", value: "Social Recovery"},
                   {name:"2 of 3", value: "2 of 3"},
                   {name:"Shared Bank Account", value: "Shared Bank Account"},
                   {name:"Paranoid Vault", value:  "Paranoid Vault"},
                                                                    
                ]

  isAddressValid = (address: string) => {
    try {
      CML.Ed25519KeyHash.from_hex( address)
      return true
    } catch (error) {
      try{

        getAddressDetails(address);
        return true
      }catch
      {
        return false;
      }

    }
  }

  checkAllAddresses = (script: Native) : boolean => {
    let valid = true
    if(script === undefined)


      return true
      if (script.type === "sig"){
        const validAddress = this.isAddressValid(script.keyHash)



        valid = valid && this.isAddressValid(script.keyHash)
        if(!validAddress){
           toast.error(`Invalid address: ${script.keyHash} for Signatory ${script.name}`) 
          }

      } else if(script.type === "all" || script.type === "any" || script.type === "atLeast"){
        for (const subScript of script.scripts){
          valid = valid && this.checkAllAddresses(subScript)
        }
      }

    return valid

  }



  setJson(json: any){
    this.setState({json})
  }


  setWName(WName: string){
    this.setState({WName})
  }  



  // change the address to a keyHash if it is an address and not a keyHash and update state with the new json




  handleSubmit(){
    if(this.checkAllAddresses(this.state.json)){
    this.props.moduleRoot.addWallet(this.state.json,this.state.WName)
    this.props.setOpenModal(false)
    this.props.hostModal(false)
    }
  }


  handlePresetChange(value: string){
    var json 
    switch(value){
      case "Social Recovery":
        json = {"type": "any", "scripts": [{"type": "sig", "name":"Me" , "keyHash": ""}, 
                                           {"type": "all",   "scripts": [{"type": "sig", "name":"Trusted Family Member" , "keyHash": ""},
                                                                         {"type": "sig", "name":"Trusted Friend" , "keyHash": ""},
                                                                         {"type": "sig", "name":"Trusted College" , "keyHash": ""}]}]}
        break;
      case "2 of 3":
        json =  {"type": "atLeast", "required": 2, "scripts": [{"type": "sig", "name":"Me" , "keyHash": ""},
                                                               {"type": "sig", "name":"Trusted Friend" , "keyHash": ""},
                                                               {"type": "sig", "name":"Trusted College" , "keyHash": ""}]}
        break;
      case "Shared Bank Account":
        json =  {"type": "any",  "scripts": [{"type": "sig", "name":"Me" , "keyHash": ""},
                                             {"type": "sig", "name":"My spouse" , "keyHash": ""}]}
        break;
      case "Paranoid Vault":
        json = {"type": "atLeast", "required": 5, "scripts": [{"type": "sig", "name":"My Paper wallet" , "keyHash": ""}, 
                                                              {"type": "sig", "name":"Paper wallet hidden In the dessert" , "keyHash": ""},
                                                              {"type": "sig", "name":"Paper wallet hidden In the sea" , "keyHash": ""},
                                                              {"type": "sig", "name":"Paper wallet hidden In the mountains" , "keyHash": ""},
                                                              {"type": "sig", "name":"Paper wallet hidden In the swamp" , "keyHash": ""},
                                                              {"type": "sig", "name":"Paper wallet hidden In the ice" , "keyHash": ""},
                                                              {"type": "sig", "name":"Paper wallet hidden In the forest" , "keyHash": ""}]}
        break;
            default:
              return
      }

      this.setState({json:json})
    }
    
  allComponent(json: Native,coordinates: number[]){
    if (json.type !== "all")
      return null
    return (
    <div className="input_wrap">
       {json.scripts.map( (item: Native,index: number) => (this.rootComponenent(item, [...coordinates,index])))}

       <button className="btn" onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }



  anyComponent(json: Native,coordinates: number[]){
    if(json.type !== "any")
      return null
    return (
    <div className="input_wrap">
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button className="btn" onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }




  atLeastComponent(json: Native,coordinates: number[]){
    if(json.type !== "atLeast")

      return null
    return (
    <div className="atLeast">
            <input
            required
              type="number"
              name="amount"

              value={json.required}
              onChange={event => this.handleRequiredChange(event.target.value, coordinates)}
            /> of {json.scripts.length}
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button className="btn" onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }
  
  handleAddScript(coordinates: number[]){
    const json=this.state.json;
    let current = this.state.json;
    for (const index of coordinates) {
          if (current.type === "all" || current.type === "any" || current.type === "atLeast"){
            current = current.scripts[index];
        }
    }
    if (current.type === "all" || current.type === "any" || current.type === "atLeast"){
      current.scripts = [...current.scripts, { "type": "sig", "name": "", "keyHash": "" }]
    }

    this.setState({json})
  }

  handleRequiredChange(value: string,coordinates: number[]){
    const json=this.state.json;
    let current = json;
    for (const index of coordinates) {
      if (current.type === "all" || current.type === "any" || current.type === "atLeast"){
        current = current.scripts[index];
      }
    }
    if (current.type === "atLeast"){
      current.required=Number.parseInt(value)
    }



    this.setState({json})
  }

  handleSignatoryNameChange(value: string,coordinates: number[]){
    const json=this.state.json;
    let current = json;
    for (const index of coordinates) {
      if (current.type === "all" || current.type === "any" || current.type === "atLeast"){
        current = current.scripts[index];
      }
    }
    if (current.type === "sig"){
      current.name=value
    }
    this.setState({json})
    

  }

  handleSlotChange(value: number,coordinates: number[]) {
    const json=this.state.json;
    
    if (value < 0 || value > 214748364700) {
      return;
    }
    let current = json;
    for (const index of coordinates) {
      if (current.type === "all" || current.type === "any" || current.type === "atLeast") {
        current = current.scripts[index];
      }
    }
    if (current.type === "before" || current.type === "after") {
      current.slot= Number(value) ?  Number(value)  : current.slot
    }



    this.setState({json})
    
  }

  handleKeyHashChange(value: string, coordinates: number[]) {
    const json=this.state.json;
    let current = json;
    for (const index of coordinates) {
      if (current.type === "all" || current.type === "any" || current.type === "atLeast") {
        current = current.scripts[index];
      }
    }
    if (current.type === "sig") {
    current.keyHash=value
    this.setState({json})
    
  }
}

  sigComponent(json: Native, coordinates: number[]) {
    if (json.type !== "sig") {
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
              onChange={event => this.handleSignatoryNameChange(event.target.value, coordinates)}
            />
          </div>
          
         <div className={"input_wrap " }>
            <input
            className="createWalletAddress"
              required
              placeholder="Address/ KeyHash"
              type="text"
              name="amount"
              value={ json.keyHash }
              

              onChange={event => this.handleKeyHashChange(event.target.value, coordinates)}
            />
            {   ( this.isAddressValid(json.keyHash) ? <CorrectIcon className="noticeIcon"  /> 
                                                    : <WrongIcon className={ json.keyHash === "" ? "invisibleIcon": "noticeIcon" } />) }
           
          </div>
        
        </div>
    )
  }
 
  beforeComponent(json: Native, coordinates: number[]) {
    if (json.type !== "before") {
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
               value={json.type === "before" ? json.slot : ""}
               onChange={event => this.handleSlotChange(Number(event.target.value), coordinates)}
             /> 
             <input

               type="datetime-local"
               name="amount"
               
               value={ new Date(slotToUnixTime( this.props.root.state.settings.network as Network ,json.slot) - (new Date().getTimezoneOffset() *60000)).toISOString().slice(0, 16) }
               onChange={event => this.handleSlotChange( unixTimeToSlot( this.props.root.state.settings.network as Network ,new Date( new Date(event.target.value) ).valueOf() ), coordinates)}
             />
             </div>


             <p> <span>Warning:</span> Using the "Before" type could result in a permanently locked wallet! You need to withdraw your money <span>before</span> the above date!</p>
         </div>
     
        </React.Fragment>
         
     )
   }

   afterComponent(json: Native, coordinates: number[]) {
     if (json.type !== "after") {
      return null;
    }
    return (
      <React.Fragment>
         <div className="input_wrap beforeAndAfterSlot">

             <input
             required
               type="text"
               name="amount"
               value={json.slot}
               placeholder="After Slot"
               onChange={event => this.handleSlotChange(Number(event.target.value), coordinates)}

             />
              <input
                type="datetime-local"
                name="amount"
                value={ new Date(slotToUnixTime( this.props.root.state.settings.network as Network ,json.slot) - (new Date().getTimezoneOffset() *60000)).toISOString().slice(0, 16) }
                onChange={event => this.handleSlotChange( unixTimeToSlot( this.props.root.state.settings.network as Network ,new Date( new Date(event.target.value) ).valueOf() ), coordinates)}
              />


         </div>
        
         </React.Fragment>
     )
   }

  deleteElement(coordinates: number[]) {
    const json=this.state.json;
    let current = json;
    let previus = json;
    for (const index of coordinates) {
      if (current.type === "all" || current.type === "any" || current.type === "atLeast") {
      previus = current
      current = current.scripts[index];
      }
    }
    if (previus.type === "all" || previus.type === "any" || previus.type === "atLeast") {
      previus.scripts.slice(coordinates[coordinates.length-1], 1)
    }
    this.setState({json})
  }



  handleTypeChange(value: 'all' | 'any' | 'atLeast' | 'before' | 'after' | 'sig',coordinates: number[]){
    const json=this.state.json;
    let current = json;
       for (const index of coordinates) {
        if (current.type === "all" || current.type === "any" || current.type === "atLeast") {
          current = current.scripts[index];
        }
      }
    let newJson : Native 
    switch(value){
      case "all": 
           newJson = { "type": "all", "scripts": [{ "type": "sig","name" : "","keyHash": "" },
           { "type": "sig","name": "", "keyHash": "" }] }

            break;
      case "any": 
            newJson = { "type": "any", "scripts": [{ "type": "sig","name" : "","keyHash": "" },
           { "type": "sig","name": "", "keyHash": "" }] }
            break;   

      case "atLeast": 
            newJson = { "type": "atLeast", "required": 1, "scripts": [{ "type": "sig","name" : "","keyHash": "" },
           { "type": "sig","name": "", "keyHash": "" }] }
            break;     

      case "before":
            newJson = { "type": "before", "slot": unixTimeToSlot( this.props.root.state.settings.network as Network ,new Date(  ).valueOf() ) }
            break;

      case "after":
            newJson = { "type": "after", "slot": unixTimeToSlot( this.props.root.state.settings.network as Network ,new Date(  ).valueOf() ) }
            break;

      case "sig":
            newJson = { "type": "sig", "name": "", "keyHash": "" }
            break;

    }
    this.setState({json})
    
  }
  
  rootComponenent(json: Native, coordinates: number[] = []){
   const extraClasses = "WalletCreateColor"+(coordinates.length % 2)  + " WalletCreateType"+json.type
    var content 
    
    switch (json.type) {
      case "all": 
            content =  this.allComponent(json,coordinates)
            break;
      case "any": 
            content =  this.anyComponent(json,coordinates)
            break;
      case "atLeast" :
            content =  this.atLeastComponent(json,coordinates)
            break;
      case "before" :
            content =  this.beforeComponent(json,coordinates)
            break;
      case "after" :
            content =  this.afterComponent(json,coordinates)
            break;
      case "sig":
            content =  this.sigComponent(json,coordinates)
            break;
  };

  
  return (
  <div key={coordinates.toString()} className={"rootElement "+  extraClasses}>
    
    {coordinates.length === 0 ? "" :  <div className="deleteBtn"> <button onClick={() => this.deleteElement(coordinates)}>x</button></div>}
    <div className="cardSelect">
    <select value={json.type } onChange={(event) => this.handleTypeChange(event.target.value as 'all' | 'any' | 'atLeast' | 'before' | 'after' | 'sig',coordinates)}>

      {this.options.map(option => (
        <option key={option.name} value={option.value} > 
          {option.name}
        </option>
      ))}
    </select>
    </div>
    {content}
  </div>
  )
}


  render() { 
    return  (
    <div className="modalBackground">
      <div className="modalContainer"  >
        <div className="titleCloseBtn">
          <button
            onClick={() => {this.props.setOpenModal(false) }}>
            X
          </button>
        </div>
  
      <div className="title">
          <h1 className="createWalletModalTitle">Create Wallet</h1>
        </div>
        
        <div className="body">
        <select value={"Examples"} onChange={(event) => this.handlePresetChange(( event.target.value))}>
      {this.presetOptions.map(option => (
        <option key={option.name} value={option.value} > 
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
          onChange={event => this.setWName(event.target.value)}
        />
      <label>Name your Wallet</label>
      </div >
     
          <div className="rootRoot">
             {this.rootComponenent(this.state.json)}
            </div>
        </div>
        <div className="footer">
      <button onClick={() => this.handleSubmit()}>Create</button>
     <button onClick={() => {this.props.setOpenModal(false);}}id="cancelBtn">Cancel</button>
        </div>
      </div>
    </div>
    );
}}

export default AddWalletModal;