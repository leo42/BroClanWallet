import React, { useEffect } from 'react';
import getTokenInfo from "../helpers/tokenInfo.js"
import TokenDropdownMenu from './TokenDropdownList.js';
import TokenElement from "./TokenElement";

class WalletCreateTx extends React.Component {

  state = {
    recipients: [{address :"", amount: {lovelace:0}}],
    signers: this.props.wallet.getSigners().map( () =>  true ),
    tokenData: {},
    sendFrom : this.props.wallet.getDefaultAddress()
    }

 
  async getTokenInfo(tokenId){
    let tokenData = {...this.state.tokenData}
    tokenData[tokenId] = await getTokenInfo(tokenId)
    this.setState({tokenData})
  }

  setAddress = (value,index) => {
      const recipients =   [...this.state.recipients]
      recipients[index].address = value
      this.setState({recipients})
  }


  setAmount = (value,token,index) => {
    const recipients =   [...this.state.recipients]

    let valueNew = token === "lovelace" ? value * 1000000 : (token in this.state.tokenData) ? ("metadata" in this.state.tokenData[token]  && this.state.tokenData[token].metadata !== null ) ? value * (10**this.state.tokenData[token].metadata.decimals)  : value : value
     valueNew= valueNew < 0 ? 0 : valueNew > this.props.wallet.getBalanceFull(this.state.sendFrom)[token] ? Number(this.props.wallet.getBalanceFull(this.state.sendFrom)[token]) : valueNew

    console.log(value,valueNew)
    recipients[index].amount[token] = valueNew
    this.setState({recipients})
  }


  handleOnChangeSigners = (position) => {
    const signers = [...this.state.signers]
    signers[position] = !signers[position]
    this.setState({signers});
  };

  handleChangeFrom = (event) => {
    console.log(event.target.value)
    this.setState({sendFrom : event.target.value})
  }

  handleSubmit = event => {
    event.preventDefault();
   
    const txSigners = this.state.signers.map((item, index) =>
        item ? this.props.wallet.getSigners()[index].hash : ""
    )



      this.props.root.createTx(this.state.recipients, txSigners.filter((element, index) => this.state.signers[index]),this.state.sendFrom);
  }


  deleteRecipient = (index) =>{
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

    
  addToken = (tokenId,index) => {
    this.getTokenInfo(tokenId)
    console.log(`Option selected:`, tokenId)
    if (!(tokenId in this.state.recipients[index].amount)) {
      const recipients = [...this.state.recipients]
      recipients[index].amount[tokenId] = 0
      this.setState({recipients})
    } 
  
  }

  addRecipient = () =>{
    const recipients =   [...this.state.recipients]
    recipients.push({address :"", amount: {lovelace:0}})
    this.setState({recipients})
  }

  RecipientJSX = () => this.state.recipients.map( (recipient, index) => (
    <div key={index}>
      <label>
    Address:
    <input
      type="text"
      name="cardano_address"
      value={recipient.address}
      onChange={event => this.setAddress(event.target.value,index)}
    />
  { index > 0 ? <button type="submit" onClick={ () =>  this.deleteRecipient(index)}>Delete recipient</button> : ""}

  </label>

  <label>
    ADA:
    <input
      type="number"
      name="amount"
      value={this.state.recipients[index].amount.lovelace/1000000}
      onChange={event => this.setAmount(event.target.value,"lovelace",index)}
    />
    
  </label>
    {Object.keys(this.state.recipients[index].amount).filter((token => token!=="lovelace")).map( (item,i) => (
<div key={i}>        
      <label >
      <TokenElement tokenId={item} amount={this.props.wallet.getBalanceFull(this.state.sendFrom)[item]}/>:
        <input
          type="number"
          name="amount"
          value={(item in this.state.tokenData) ? ("metadata" in this.state.tokenData[item] && this.state.tokenData[item].metadata!==null ) ? this.state.recipients[index].amount[item] / (10**this.state.tokenData[item].metadata.decimals)  : this.state.recipients[index].amount[item] :this.state.recipients[index].amount[item] }
          onChange={event => this.setAmount(event.target.value,item,index)}
        />
    <button type="submit" onClick={ () =>  this.deleteToken(item,index)}>Remove token</button>
    </label>
    </div>
    ))}
    <TokenDropdownMenu ballances={this.props.wallet.getBalanceFull(this.state.sendFrom)} f={this.addToken} index={index}></TokenDropdownMenu>



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
    <div>
      { this.RecipientJSX()}
      <button type="submit" onClick={this.addRecipient}>Add recipient</button>
      { this.SignersSelect()}
      <br />
      {this.AccountSelect()}
      <br/>

      <button type="submit" onClick={this.handleSubmit}>Create Transaction</button>
      </div>
  );
  }
}

export default WalletCreateTx;