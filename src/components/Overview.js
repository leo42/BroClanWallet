import React, { useState } from 'react';

function Overview(props) {
  const wallet = props.wallet
  const initialState = [] 
  const ballances = wallet.getBalanceFull()
  console.log(ballances)

  
   
  return (
    
    <div>
      Overview:
      {Object.keys(ballances).map((asset, index) => (
            <div key={index}>{asset}:{ballances[asset].toString()}</div>
      ))}

    </div>
  );

}
export default Overview;