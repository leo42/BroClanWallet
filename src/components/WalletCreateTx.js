import React, { useEffect } from 'react';
import getTokenInfo from "../helpers/tokenInfo.js"
import TokenDropdownMenu from './TokenDropdownList.js';
import TokenElement from "./TokenElement";
import "./WalletCreateTx.css"
class WalletCreateTx extends React.Component {

  state = {
    recipients: [{address :"", amount: {lovelace:0}}],
    signers: this.props.wallet.getSigners().map( () =>  true ),
    tokenData: {},
    sendFrom : this.props.wallet.getDefaultAddress(),
    sendAll: null
  }

  
  isAddressValid = (address) => {

      try{
        this.props.wallet.isAddressValid( address);
        return true
      }catch(e  )
      { 
        return false;
      }
  }
  componentDidMount() {
    for(const token of Object.keys(this.props.wallet.getBalanceFull(this.state.sendFrom))) {
      if (token !== "lovelace") {
        getTokenInfo(token).then( (data) => {
          const tokenData = {...this.state.tokenData}
          tokenData[token] = data
          this.setState({tokenData})
        })
      }
    }
  }

   

  setAddress = (value,index) => {
      const recipients =   [...this.state.recipients]
      recipients[index].address = value
      this.setState({recipients})
  }


  setAmount = (value,token,index) => {
    const recipients =   [...this.state.recipients]
    //if the last character is a dot, add a zero
    if (value[value.length-1] === ".") {
      value = value + "0"
    }
    if (isNaN(value) ) {
      return
    }

    let valueNew = token === "lovelace" ? value * 1000000 : (token in this.state.tokenData)  ? value * (10**this.state.tokenData[token].decimals)  : value 
    valueNew = Math.round(valueNew)
    valueNew= valueNew < 0 ? 0 : valueNew > this.props.wallet.getBalanceFull(this.state.sendFrom)[token] ? Number(this.props.wallet.getBalanceFull(this.state.sendFrom)[token]) : valueNew
    recipients[index].amount[token] = valueNew
    this.setState({recipients})
  }


  handleOnChangeSigners = (position) => {
    const signers = [...this.state.signers]
    signers[position] = !signers[position]
    this.setState({signers});
  };

  handleChangeFrom = (event) => {
    this.setState({sendFrom : event.target.value})
  }

  handleSubmit = event => {
    event.preventDefault();
   
    const txSigners = this.state.signers.map((item, index) =>
        item ? this.props.wallet.getSigners()[index].hash : ""
    )



      this.props.root.createTx( this.state.recipients, txSigners.filter((element, index) => this.state.signers[index]),this.state.sendFrom,this.state.sendAll);
  }


  deleteRecipient = (index) =>{
    // rerender all the recipients after deleting one   
    
    const recipients =   [...this.state.recipients]
    recipients.splice(index, 1)
    this.setState({recipients})
  }


  deleteToken = (tokenId,index) => {
    if ((tokenId in this.state.recipients[index].amount)) {
      const recipients = [...this.state.recipients]
      delete recipients[index].amount[tokenId]
      this.setState({recipients})
    } 
  
  }

  setMax = (tokenId,index) => {

    console.log(tokenId,index ,this.props.wallet.getBalanceFull(this.state.sendFrom)[tokenId])
    if ((tokenId in this.state.recipients[index].amount)) {
      const recipients = [...this.state.recipients]
      recipients[index].amount[tokenId] = Number( this.props.wallet.getBalanceFull(this.state.sendFrom)[tokenId])
      this.setState({recipients})
    }
  }
    
  addToken = (tokenId,index) => {
    if (!(tokenId in this.state.recipients[index].amount)) {
      const recipients = [...this.state.recipients]
      recipients[index].amount[tokenId] =  this.state.tokenData[tokenId].isNft ? 1 : 0 
      this.setState({recipients})
    } 
  
  }
  handleSendAlltoggle = (index) => {
    if (this.state.sendAll === index) {
      this.setState({sendAll: null})
    } else {
      this.setState({sendAll: index})
    }
  }

  addRecipient = () =>{
    const recipients =   [...this.state.recipients]
    recipients.push({address :"", amount: {lovelace:0}})
    this.setState({recipients})
  }

  RecipientJSX = () => this.state.recipients.map( (recipient, index) => (
    <div className='createTxRecipientContainer' key={index}>
      <div className="addressWrap">
        <label>Address:</label>
      <div className={"address_wrap "  + ( this.isAddressValid(recipient.address) ? "sendInputValidAddress" : "sendInputInvalidValidAddress")} >
        <input className='createTxAddressInputField' 
          type="text"
          name="cardano_address"
          value={recipient.address}
          onChange={event => this.setAddress(event.target.value,index)}
        />
     </div>
    </div>

  <div className="addressWrap">
  <div className="address_wrap">
  <span className="overVeiwTokenSearch">ADA: <input className='createTxADAInputField'
      type="number"
      name="amount"
      value={this.state.recipients[index].amount.lovelace === 0 ? "" :this.state.recipients[index].amount.lovelace/1_000_000 }
      onChange={event => this.setAmount(event.target.value,"lovelace",index)}
    /> </span>
    </div>
    </div>
  <br/>
  
  <div className="createTxSelectedTokenList">
      {Object.keys(this.state.recipients[index].amount).filter((token => token!=="lovelace")).map( (item,i) => (
        <div key={i}>        
    
  <div className="addressWrap">
     <div className="CreateTxSelectedToken">
     <div key={item} className='CreateTxTokenContainer'> <TokenElement tokenId={item} amount={this.props.wallet.getBalanceFull(this.state.sendFrom)[item]}/></div>
       {!this.state.tokenData[item].isNft &&  <input
          type="number"
          name="amount"
          value={ this.state.recipients[index].amount[item] === 0 ? "" : (this.state.tokenData[item] && this.state.tokenData[item].decimals ) ?  this.state.recipients[index].amount[item] / (10**this.state.tokenData[item].decimals)  : this.state.recipients[index].amount[item] }
          onChange={event => this.setAmount(event.target.value,item,index)}
          />
        }
    <button type="submit" onClick={ () =>  this.deleteToken(item,index)}>x</button>
    {!this.state.tokenData[item].isNft &&  <button type="submit" onClick={ () =>  this.setMax(item,index)}>max</button>}
    </div>
    </div>
    </div>
    ))}
    </div>
    <TokenDropdownMenu ballances={this.props.wallet.getBalanceFull(this.state.sendFrom)} f={ (tokenId) => this.addToken(tokenId,index )} index={index}></TokenDropdownMenu>
    { this.props.root.state.settings.sendAll ? <label> Send all: <input type="checkbox" checked={this.state.sendAll === index ? true : false } onChange={()=> this.handleSendAlltoggle(index)}></input>  </label> : ""}

  { index > 0 ? <button type="submit" onClick={ () =>  this.deleteRecipient(index)}>Delete recipient</button> : ""}


  </div>
  ))
    

   SignersSelect = () => this.props.wallet.getSigners().map( (item, index) => (
    <div key={index}>
   <br />
   <label>
     {this.props.wallet.getSigners()[index].name}:
     <input
       type="checkbox"
       name="value"
       value={index}
       
       checked={this.state.signers[index]} 
       onChange={  () =>  this.handleOnChangeSigners(index)  }
      
     />
   </label>
   </div>
  ) ) 

  
  AccountSelect = () => 
    <div>
   <br />
      <span>Send From</span>
      <select defaultValue={this.props.wallet.getDefaultAddress()} onChange={this.handleChangeFrom} >
                <option value="" >All</option>

                {this.props.wallet.getFundedAddress().map( (item, index) => (
                  <option key={index} value={item} >{this.props.wallet.getAddressName(item)}</option>
            ))}
      </select>

      <br />
   </div>
  
  
  render(){

  return (
    <div className='CreateTransactionContainer'>
      <div> Account Balance : {this.props.wallet.getBalance(this.state.sendFrom)/1_000_000} tA </div>
      { this.RecipientJSX()}
      <button type="submit" onClick={this.addRecipient}>Add recipient</button>
      { this.SignersSelect()}
      <br />
      { this.props.wallet.getFundedAddress().length > 1 ? this.AccountSelect(): ""}
      <br/>

      <button type="submit" onClick={this.handleSubmit}>Create Transaction</button>
      </div>
  );
  }
}

export default WalletCreateTx;