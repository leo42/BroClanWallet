import React, { useState } from 'react';

function WalletDelegation(props) {
  const wallet = props.wallet
  const initialState = [] 
  wallet.getSigners().map( () =>
    initialState.push(true)
  ) 
  const [pool, setPool] = useState('');
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

    props.root.createDelegationTx(pool, txSigners.filter((element, index) => signers[index]));
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
        poolId:
        <input
          type="text"
          name="amount"
          value={pool}
          onChange={event => setPool(event.target.value)}
        />
      </label>
      { SignersSelect}
      <br />
      <button type="submit">Delegate</button>
    </form>
  );

}
export default WalletDelegation;