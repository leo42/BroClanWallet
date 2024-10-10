import React, { useEffect } from 'react';
import getTokenInfo from "../helpers/tokenInfo.js"
import TokenDropdownMenu from './TokenDropdownList.js';
import TokenElement from "./TokenElement";
import { ReactComponent as RecipientIcon } from '../html/assets/recipient.svg';
import "./WalletCreateTx.css"
import AddressSelect from './AddressSelect';
class WalletCreateTx extends React.Component {

  state = {
    recipients: [{address :"", amount: {lovelace:0n}}],
    signers: this.props.wallet.getSigners().filter( (signer) => (signer.isDefault) ),
    tokenData: {},
    sendFrom : this.props.wallet.getDefaultAddress(),
    sendAll: null,
    hovering: ""
  }

  setHovering = (value) => {
    this.setState({hovering: value})
  } 

  isAddressValid = (address) => {

      try{
        
        return address === ""? true : this.props.wallet.isAddressValid(address);
      }catch(e  )
      { 
        return false;
      }
  }
  
  componentDidMount() {
    for(const token of Object.keys(this.props.wallet.getBalanceFull())) {
      if (token !== "lovelace") {
        getTokenInfo(token).then( (data) => {
          const tokenData = {...this.state.tokenData}
          tokenData[token] = data
          this.setState({tokenData})
        })
      }
    }
    console.log(this.props.wallet.getSigners())
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
    valueNew = BigInt(Math.round(valueNew))
    valueNew= valueNew < 0n ? 0n : valueNew > this.props.wallet.getBalanceFull(this.state.sendFrom)[token] ? Number(this.props.wallet.getBalanceFull(this.state.sendFrom)[token]) : valueNew
    recipients[index].amount[token] = valueNew
    this.setState({recipients})
  }


  handleOnChangeSigners = (position) => {
    const signers = [...this.state.signers]
    signers[position] = !signers[position]
    this.setState({signers});
  };

  handleChangeFrom = (value ) => {
    const newBalance = this.props.wallet.getBalanceFull(value)
    this.state.recipients.map( (recipient,index) => {
       Object.keys(recipient.amount).map( (token) => {
        if (newBalance[token] < recipient.amount[token]) {
          const recipients = [...this.state.recipients]
          recipients[index].amount[token] = newBalance[token]
          this.setState({recipients})
        }
        if (!Object.keys(newBalance).includes(token)) {
          const recipients = [...this.state.recipients]
          delete recipients[index].amount[token]
          this.setState({recipients})
        }

       })
    })
    this.setState({sendFrom : value})
  }

  handleSubmit = event => {
    event.preventDefault();
   
    const txSigners = this.state.signers.map((item, index) =>
        item ? this.props.wallet.getSigners()[index].hash : ""
    )



      this.props.moduleRoot.createTx( this.state.recipients, txSigners.filter((element, index) => this.state.signers[index]),this.state.sendFrom,this.state.sendAll);
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
    <div className='createTxRecipientContainer createTxRecipientContainerSend' key={index}>
      <div className='deleteRecipientWrapper'>
       { index > 0 ?<div   > <button className='deleteRecipient' type="submit" onClick={ () =>  this.deleteRecipient(index)}>x</button> </div>: ""}
      </div>
      <div className="addressWrap">
      <div className={"address_wrap "  + ( this.isAddressValid(recipient.address) ? "sendInputValidAddress" : "sendInputInvalidValidAddress")} >
        <input className='createTxAddressInputField' 
          type="text"
          name="cardano_address"
          placeholder='Address'
          value={recipient.address}
          onChange={event => this.setAddress(event.target.value,index)}
        />
     </div>
    </div>

  <div className="addressWrap ADAAmountContainer">
  <div className="address_wrap">
  <span className="overVeiwTokenSearch"> <input className='createTxADAInputField'
      type="number"
      name="amount"
      placeholder='ADA'
      value={this.state.recipients[index].amount.lovelace === 0n ? "" : Number(this.state.recipients[index].amount.lovelace)/1_000_000   }
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
      <TokenElement key={item+this.state.sendFrom} className='CreateTxTokenContainer' tokenId={item} amount={this.props.wallet.getBalanceFull(this.state.sendFrom)[item]}/>
       {!this.state.tokenData[item].isNft && <div className='tokenAmount'> <input
          type="number"
          name="amount"
          value={ this.state.recipients[index].amount[item] === 0n ? "" : (this.state.tokenData[item] && this.state.tokenData[item].decimals ) ?  this.state.recipients[index].amount[item] / (10**this.state.tokenData[item].decimals)  : this.state.recipients[index].amount[item] }
          onChange={event => this.setAmount(event.target.value,item,index)}
          /> 
          <button type="submit" className='maxButton' onClick={ () =>  this.setMax(item,index)}>max</button>
          </div>
        }
       <button type="submit" className='deleteTokenButton' onClick={ () =>  this.deleteToken(item,index)}>x</button>
    </div>

    </div>
    </div>
    ))}
    </div>
    { Object.values(this.props.wallet.getBalanceFull(this.state.sendFrom)).length > 1 && <TokenDropdownMenu ballances={this.props.wallet.getBalanceFull(this.state.sendFrom)} f={ (tokenId) => this.addToken(tokenId,index )} index={index+this.state.sendFrom}></TokenDropdownMenu>}
    { this.props.root.state.settings.sendAll ? <label> Send all: <input type="checkbox" checked={this.state.sendAll === index ? true : false } onChange={()=> this.handleSendAlltoggle(index)}></input>  </label> : ""}
  </div>
  ))
    

   SignersSelect = () => this.props.wallet.getSigners().map( (item, index) => (
    <div key={index} >
   <label className='signerCheckbox'>
     {this.props.wallet.getSigners()[index].name}:
     <input
       type="checkbox"
       name="value"
       value={index}
       className='signerCheckbox'
       checked={this.state.signers[index]} 
       onChange={  () =>  this.handleOnChangeSigners(index)  }
      
     />
   </label>
   </div>
  ) ) 
  
  render(){

  return (
    <div className='CreateTransactionContainer'>
      <h1> Account Balance : {this.props.wallet.getBalance(this.state.sendFrom)/1_000_000} {this.props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  }  </h1>
      { this.props.wallet.getFundedAddress().length > 1 && <AddressSelect
          wallet={this.props.wallet}
          moduleRoot={this.props.moduleRoot}
          selectedAddress={this.state.sendFrom}
          onAddressChange={this.handleChangeFrom}
        />}
     
     
      { this.RecipientJSX()}

      <div onMouseEnter={() => this.setHovering("recipient")} onMouseLeave={() => this.setHovering("") } onClick={() => this.addRecipient()} className='addRecipientWraper recipientButton'>
        <RecipientIcon className="icon" alt="recipientIcon" />
        {  <label className='iconLabel'>Add Recipient</label> }
        < br/>   
      </div>
      {this.props.wallet.getSigners().length !== 0 && <div className='SignersSelect' ><h2> Signers:</h2>
      <div className='SignersSelectList'>
      { this.SignersSelect()}
      </div>
      </div>
  }
      <br/>

      <button className='commonBtn' type="submit" onClick={this.handleSubmit}>Create Transaction</button>
      </div>
  );
  }
}

export default WalletCreateTx;