import React from "react";
import "./AddWalletModal.css";
import { Lucid, C  } from "lucid-cardano";
import { toast } from "react-toastify";



class AddWalletModal extends React.Component {
  state = {  
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

  isAddressValid = (address) => {
    try {
      C.Ed25519KeyHash.from_hex( address)
      return true
    } catch (error) {
      try{
        this.lucid.utils.getAddressDetails(address);
        return true
      }catch
      {
        return false;
      }
    }
  }

  checkAllAddresses = (scripts) => {
    let valid = true
    if(scripts === undefined)
      return true
    for (const script of scripts){
      if (script.type === "sig"){
        const validAddress = this.isAddressValid(script.keyHash)

        valid = valid && this.isAddressValid(script.keyHash)
        if(!validAddress){
           toast.error(`Invalid address: ${script.keyHash} for Signatory ${script.name}`) 
          }
      }else{
        valid = valid && this.checkAllAddresses(script.scripts)
      }
    }
    return valid
  }


  componentDidMount(){
    const lucidLoad =  Lucid.new(
      null,
      this.props.root.state.settings.network
    );

    lucidLoad.then((lucid) => {
      this.lucid = lucid;
    });
  }


  setJson(json){
    this.setState({json})
  }

  setWName(WName){
    this.setState({WName})
  }  

  handleSubmit(event){
    if(this.checkAllAddresses(this.state.json.scripts)){
    event.preventDefault();
    this.props.root.addWallet(this.state.json,this.state.WName)
    this.props.setOpenModal(false)
    this.props.hostModal(false)
    }
  }

  handlePresetChange(value){
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
    
  allComponent(json,coordinates){
    return (
    <div className="input_wrap">
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button className="btn" onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }

  anyComponent(json,coordinates){
    return (
    <div className="input_wrap">
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button className="btn" onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }

  atLeastComponent(json,coordinates){
    return (
    <div className="atLeast">
            <input
            required
              type="number"
              name="amount"
              value={json.required}
              onChange={event => this.handleRequiredChange(event.target.value, coordinates)}
            />
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button className="btn" onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }
  
  handleAddScript(coordinates){
    const json=this.state.json;
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.scripts.push({ "type": "sig","name" : "","keyHash": "" })

    this.setState({json})
  }

  handleRequiredChange(value,coordinates){
    const json=this.state.json;
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.required=Number.parseInt(value)

    this.setState({json})
  }

  handleSignatoryNameChange(value,coordinates){
    const json=this.state.json;
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.name=value
    this.setState({json})
    
  }

  handleSlotChange(value,coordinates){
    const json=this.state.json;
    
    if (value < 0 || value > 214748364700) {
      return;
    }
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.slot= Number(value) ?  Number(value) : value==="" ? "" : current.slot

    this.setState({json})
    
  }

  handleKeyHashChange(value,coordinates){
    const json=this.state.json;
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.keyHash=value

    this.setState({json})
    
  }

  sigComponent(json,coordinates){
    return (
        <div className="sigWrap">
          <div className="input_wrap">
            <input
              className="createWalletName"
              required
              type="text"
              name="amount"
              value={json.name}
              onChange={event => this.handleSignatoryNameChange(event.target.value, coordinates)}
            />
            <label>Nickname</label>
          </div>
          
         <div className={"input_wrap " + ( this.isAddressValid(json.keyHash) ? "inputValidAddress" : "inputInvalidValidAddress")}>
            <input
            className="createWalletAddress"
              required
              type="text"
              name="amount"
              value={json.keyHash}
              
              onChange={event => this.handleKeyHashChange(event.target.value, coordinates)}
            />
            <label>Address/ KeyHash</label>
          </div>
        
        </div>
    )
  }
 
  beforeComponent(json,coordinates){
     return (
      <React.Fragment>
         <div className="input_wrap beforeSlot">
             <div className="beforeAndAfterSlot">
              <input
             required
               type="text"
               name="amount"
               value={json.slot}
               onChange={event => this.handleSlotChange(event.target.value, coordinates)}
             /> 
             <input
               type="datetime-local"
               name="amount"
               
               value={ new Date(this.lucid.utils.slotToUnixTime(json.slot) - (new Date().getTimezoneOffset() *60000)).toISOString().slice(0, 16) }
               onChange={event => this.handleSlotChange( this.lucid.utils.unixTimeToSlot(new Date( new Date(event.target.value) )), coordinates)}
             />
             <label >Before Slot</label>
             </div>
             <p> <span>Warning:</span> Using the "Before" type could result in a permanently locked wallet! You need to withdraw your money <span>before</span> the above date!</p>
         </div>
     
        </React.Fragment>
         
     )
   }

   afterComponent(json,coordinates){
     return (
      <React.Fragment>
         <div className="input_wrap beforeAndAfterSlot">
             <input
             required
               type="text"
               name="amount"
               value={json.slot}
               onChange={event => this.handleSlotChange(event.target.value, coordinates)}
             />
              <input
                type="datetime-local"
                name="amount"
                value={ new Date(this.lucid.utils.slotToUnixTime(json.slot) - (new Date().getTimezoneOffset() *60000)).toISOString().slice(0, 16) }
                onChange={event => this.handleSlotChange( this.lucid.utils.unixTimeToSlot(new Date( new Date(event.target.value) )), coordinates)}
              />
              <label> After Slot</label>
         </div>
        
         </React.Fragment>
     )
   }

  deleteElement(value,coordinates){
    const json=this.state.json;
    let current = json;
    let previus
    for (const index of coordinates) {
      previus = current
      current = current.scripts[index];
    }
    previus.scripts.splice(coordinates[coordinates.length-1], 1)
    this.setState({json})
  }

  handleTypeChange(value,coordinates){
    const json=this.state.json;
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    

    current.type=value
    switch(value){
      case "all": 
           current.scripts=[{ "type": "sig","name" : "","keyHash": "" },
          { "type": "sig","name": "", "keyHash": "" }]
            delete current.name
            delete current.keyHash
            delete current.required

            break;
      case "any": 
           current.scripts=[{ "type": "sig","name" : "","keyHash": "" },
          { "type": "sig","name": "", "keyHash": "" }]
            delete current.name
            delete current.keyHash
            delete current.required

            break;   
      case "atLeast": 
            current.scripts=[{ "type": "sig","name" : "","keyHash": "" },
           { "type": "sig","name": "", "keyHash": "" }]
            current.required=1
             delete current.name
             delete current.keyHash
             break;     
      case "before":
            current.slot="0"
            delete current.name
            delete current.required
            delete current.keyHash
            delete current.scripts
            break;
      case "after":
            current.slot="0"
            delete current.name
            delete current.keyHash
            delete current.scripts  
            delete current.required
            break;
      case "sig":
            current.name=""
            current.keyHash=""
            delete current.scripts
            delete current.required
            delete current.slot
            break;
    }
    this.setState({json})
    
  }
  
  rootComponenent(json, coordinates=[]){
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
  <div key={coordinates} className={"rootElement "+  extraClasses}>
    
    {coordinates.length === 0 ? "" :  <div className="deleteBtn"> <button onClick={(event) => this.deleteElement(event.target.value,coordinates)}>x</button></div>}
    <div className="cardSelect">
    <select value={json.type } onChange={(event) => this.handleTypeChange(event.target.value,coordinates)}>
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

  anyComponenent(json){

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
          value={this.WName}
          onChange={event => this.setWName(event.target.value)}
        />
      <label>Name your Wallet</label>
      </div >
     
          <div className="rootRoot">
             {this.rootComponenent(this.state.json)}
            </div>
        </div>
        <div className="footer">
      <button onClick={(event) => this.handleSubmit(event)}>Create</button>
          <button
            onClick={() => {
              this.props.setOpenModal(false);
              
            }}
            id="cancelBtn">
            Cancel
          </button>
        </div>
      </div>
    </div>
    );
}}

export default AddWalletModal;