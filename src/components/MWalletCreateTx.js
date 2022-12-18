import React, { useState } from 'react';

function MWalletCreateTx(props) {
  const wallet = props.root.state.wallets[props.root.state.selectedWallet]
  
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const [signers, setCheckedState] = useState(
    new Array(wallet.getSigners().length).fill(true)
  );

  const handleOnChangeSigners = (position) => {
    const updatedCheckedState = signers.map((item, index) =>
      index === position ? !item : item
    );
   setCheckedState(updatedCheckedState);
  };

  const handleSubmit = event => {
    event.preventDefault();
    const signersMap = wallet.getSigners()
    const txSigners = signers.map((item, index) =>
        item ? signersMap[index].hash : ""
    )

    console.log(signers)
    props.root.createTx(amount,address, txSigners.filter((element, index) => signers[index]));
    // submit form data to the server
  };

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
      {wallet.getSigners().map( (item, index) => (
        <div key={index}>
       <br />
       <label>
         {item.name}:
         <input
           type="checkbox"
           name="value"
           value={index}
           checked={signers[index]} 
           onChange={  () =>  handleOnChangeSigners(index)  }
         />
       </label>
       </div>
      ) ) }
      <br />
      <button type="submit">Create Transaction</button>
    </form>
  );
}

export default MWalletCreateTx;