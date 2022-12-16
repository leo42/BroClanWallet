import React, { useState } from 'react';

function MWalletCreateTx(props) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = event => {
    event.preventDefault();
    props.root.createTx(amount,address);
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
      <br />
      <button type="submit">Create Transaction</button>
    </form>
  );
}

export default MWalletCreateTx;