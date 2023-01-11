import React, { useState } from 'react';
import TokenElement from './TokenElement';
import "./Overview.css"
function Overview(props) {
  const wallet = props.wallet
  const initialState = [] 
  const ballances = wallet.getBalanceFull()
  console.log(ballances)

  
   
  return (
    
    <div>
      Overview:
      <div className='overviewTokensContainer'>
      {Object.keys(ballances).map((asset, index) => (
          <div className='overviewTokenContainer' key={index}><TokenElement tokenId={asset} amount={ballances[asset]}/></div>
        ))}

    </div>
    </div>
  );

}
export default Overview;