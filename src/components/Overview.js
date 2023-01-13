import React, { useState } from 'react';
import TokenElement from './TokenElement';
import "./Overview.css"
function Overview(props) {
  const wallet = props.wallet
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
     {wallet.getFundedAddress().map((address,index)  => (
      <div key={index}> {address} 

           <div  className='overviewTokensContainer'>
           {Object.keys(wallet.getBalanceFull(address)).map((asset, index) => (
               <div className='overviewTokenContainer' key={index}><TokenElement tokenId={asset} amount={wallet.getBalanceFull(address)[asset]}/></div>
             ))}
        </div>
     </div>
    ))}
    </div>
  );

}
export default Overview;