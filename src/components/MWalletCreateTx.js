import React, { useState } from 'react';

function MWalletCreateTx(props) {
  const wallet = props.wallet
  const initialState = [] 
  wallet.getSigners().map( () =>
    initialState.push(true)
  ) 
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [signers, setCheckedState] = useState(initialState);

  const handleOnChangeSigners = (position) => {
    const updatedCheckedState = [...signers]
    updatedCheckedState[position] = !updatedCheckedState[position]
    setCheckedState(updatedCheckedState);
  };

  const handleSubmit = event => {
    event.preventDefault();
   
    const txSigners = signers.map((item, index) =>
        item ? wallet.getSigners()[index].hash : ""
    )
    console.log( "Leooo", signers)

    props.root.createTx(amount,address, txSigners.filter((element, index) => signers[index]));
  }
 
   const SignersSelect =  wallet.getSigners().map( (item, index) => (
    <div key={index}>
   <br />
   <label>
     {wallet.getSigners()[index].name}:
     <input
       type="checkbox"
       name="value"
       value={index}
       checked={signers[index]} 
       onChange={  () =>  handleOnChangeSigners(index)  }
      
     />
   </label>
   </div>
  ) ) 
  
   
  return (
    
    <form onSubmit={handleSubmit}>
      <label>
        Address:
        <input
          type="text"
          name="cardano_address"
          value={address}
          onChange={event => setAddress(event.target.value)}
        />
      </label>
      <br />
      <label>
        Amount:
        <input
          type="text"
          name="amount"
          value={amount}
          onChange={event => setAmount(event.target.value)}
        />
      </label>
      { SignersSelect}
      <br />
      <button type="submit">Create Transaction</button>
    </form>
  );

}
export default MWalletCreateTx;