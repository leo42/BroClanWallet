import React, { useEffect, useState } from 'react';
import PoolElement from './PoolElement';
import SearchPools from '../helpers/SearchPools';
import "./WalletDelegation.css"
import  { ReactComponent as LoadingIcon } from '../html/assets/loading.svg';

function WalletDelegation(props) {
  const wallet = props.wallet
  const initialState = [] 

  wallet.getSigners().map( () =>
    initialState.push(true)
  ) 
  const [pool, setPool] = useState('');
  const [signers, setCheckedState] = useState(initialState);
  const [delegation, setDelegation] = useState({});
  const [pools, setPools] = useState([]);
  const [searching, setSearching] = useState(false);
  
  useEffect(() => {
    wallet.getDelegation().then( (delegation) => {;
      setDelegation(delegation);
      
    })
  }, [wallet])

  useEffect(() => {
    setSearching(true);
    if (pool === '') {
      setPools([]);
      setSearching(false);
      return;
    }
    SearchPools(pool).then( (pools) => {
      setSearching(false);
      setPools(pools);
    })
  }, [pool, wallet])


  
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

    props.moduleRoot.createDelegationTx(pools[0].pool_id_bech32, txSigners.filter((element, index) => signers[index]));
  }

  const Undelegate = event => {
    event.preventDefault();

    const txSigners = signers.map((item, index) =>
        item ? wallet.getSigners()[index].hash : ""
    )

    props.moduleRoot.createStakeUnregistrationTx(txSigners.filter((element, index) => signers[index]));
  }


  const delegationInfo = () => {
    if (Object.keys(delegation).length === 0) {
      return <h1> Loading </h1>
    }

    if (delegation.poolId === null) {
      return <h1> No Delegation </h1>
    } else {
      return <div className='currentDelegation'> 
        Delegated to  <br />
        {delegation && delegation.poolId && <PoolElement key={delegation} root={props.root} poolId={String(delegation.poolId)} />}

        <p>Rewards : {Number(delegation.rewards)/1_000_000}{props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  }  </p>
        <input className='commonBtn' type="button" value="Undelegate" onClick={Undelegate} />
      </div>
    }
  }

  const searchingAnimation = () => {
      return <div className="searching"> 
      <LoadingIcon className="loadingIcon"  > </LoadingIcon>
      </div>
  } 

 
   const SignersSelect =  wallet.getSigners().map( (item, index) => (
    <div key={index} >
   <label className='signerCheckbox'>
     {wallet.getSigners()[index].name}:
     <input
       type="checkbox"
       name="value"
       value={index}
       className='signerCheckbox'
       checked={signers[index]} 
       onChange={  () =>  handleOnChangeSigners(index)  }
      
     />
   </label>
   </div>
  ) ) 

  return (
    <div className="DelegationCenter">

      {delegationInfo()}
    <form onSubmit={handleSubmit}>

      <label>
       
        <input
          type="text"
          name="amount"
          placeholder='Search for a pool'
          value={pool}
          onChange={event => setPool(event.target.value)}
        />
      </label>
      {searching ? searchingAnimation() : pools.map( (pool) => (
          <div key={pool}>
            <PoolElement  key={pool.pool_id_bech32} root={props.root} poolId={pool.pool_id_bech32} />
             {pools.length !== 1 && <button type="button" className='commonBtn' onClick={() => setPool(pool.pool_id_bech32)}>Select</button>}
            <br/>
          </div>
        )
      )}
      {wallet.getSigners().length !== 0 && (
      <div className='SignersSelect' ><h2> Signers:</h2>
      <div className='SignersSelectList'>
      { SignersSelect}
      </div>
      </div>)}
     {pools.length === 1 && <button  className='commonBtn' type="submit">Delegate</button> }
    </form>
    </div>
  );

}
export default WalletDelegation;