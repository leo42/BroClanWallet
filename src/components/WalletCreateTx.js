import React, { useEffect } from 'react';
import getTokenInfo from "../helpers/tokenInfo.js"
import TokenDropdownMenu from './TokenDropdownList.js';
import TokenElement from "./TokenElement";

class WalletCreateTx extends React.Component {

  state = {
    recipients: [{address :"", amount: {lovelace:0}}],
    signers: this.props.wallet.getSigners().map( () =>  true ),
    tokenData: {} 
  }

  ballances = this.props.wallet.getBalanceFull()


  setAddress = (value,index) => {
      const recipients =   [...this.state.recipients]
      recipients[index].address = value
      this.setState({recipients})
  }


  setAmount = (value,token,index) => {
    const recipients =   [...this.state.recipients]
    recipients[index].amount[token] = value
    this.setState({recipients})
  }


  handleOnChangeSigners = (position) => {
    const signers = [...this.state.signers]
    signers[position] = !signers[position]
    this.setState({signers});
  };

  handleSubmit = event => {
    event.preventDefault();
   
    const txSigners = this.state.signers.map((item, index) =>
        item ? this.props.wallet.getSigners()[index].hash : ""
    )



      this.props.root.createTx(this.state.recipients, txSigners.filter((element, index) => this.state.signers[index]));
  }


  deleteRecipient = (index) =>{
    const recipients =   [...this.state.recipients]
    recipients.splice(index, 1)
    this.setState({recipients})
  }


    
  addToken = (tokenId,index) => {
    
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
      value={this.state.recipients[index].amount.lovelace}
      onChange={event => this.setAmount(event.target.value,"lovelace",index)}
    />
    
  </label>
    {Object.keys(this.state.recipients[index].amount).filter((token => token!=="lovelace")).map( (item,i) => (
<div>        
      <label key={i} >
      <TokenElement tokenId={item} amount={this.ballances[item]}/>:
        <input
          type="number"
          name="amount"
          value={this.state.recipients[index].amount.item}
          onChange={event => this.setAmount(event.target.value,item,index)}
        />

    </label>
    </div>
    ))}
    <TokenDropdownMenu ballances={this.ballances} f={this.addToken} index={index}></TokenDropdownMenu>



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
  
  render(){

  return (
    <div>
      { this.RecipientJSX()}
      <button type="submit" onClick={this.addRecipient}>Add recipient</button>
      { this.SignersSelect()}
      <br />
      <button type="submit" onClick={this.handleSubmit}>Create Transaction</button>
      </div>
  );
  }
}

export default WalletCreateTx;