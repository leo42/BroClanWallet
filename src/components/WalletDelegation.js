import React, { useEffect, useState } from 'react';
import PoolElement from './PoolElement';
import SearchPools from '../helpers/SearchPools';
import "./WalletDelegation.css"
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

  useEffect(() => {
    wallet.getDelegation().then( (delegation) => {;
      setDelegation(delegation);
    })
  }, [wallet])

  useEffect(() => {
    if (pool === '') {
      setPools([]);
      return;
    }
    SearchPools(pool).then( (pools) => {
      
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

    props.root.createDelegationTx(pools[0].pool_id_bech32, txSigners.filter((element, index) => signers[index]));
  }

  const Undelegate = event => {
    event.preventDefault();

    const txSigners = signers.map((item, index) =>
        item ? wallet.getSigners()[index].hash : ""
    )

    props.root.createStakeUnregistrationTx(txSigners.filter((element, index) => signers[index]));
  }


  const delegationInfo = () => {
    if (delegation.poolId === null) {
      return <div> No Delegation </div>
    } else {
      return <div> 
        Delegated to  <br />
        {delegation && delegation.poolId && <PoolElement key={delegation} root={props.root} poolId={String(delegation.poolId)} />}

        <p>Rewards : {Number(delegation.rewards)/1_000_000}tA </p>
        <input type="button" value="Undelegate" onClick={Undelegate} />
      </div>
    }
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
    <div className="DelegationCenter">
      {delegationInfo()}
    <form onSubmit={handleSubmit}>

      <label>
        Search:
        <input
          type="text"
          name="amount"
          value={pool}
          onChange={event => setPool(event.target.value)}
        />
      </label>
      {pools.map( (pool) => (
          <div key={pool}>
            <PoolElement key={pool.pool_id_bech32} root={props.root} poolId={pool.pool_id_bech32} />
            <br/>
            {pools.length !== 1 && <button type="button" onClick={() => setPool(pool.pool_id_bech32)}>Select</button>}
          </div>
        )
      )}

      { SignersSelect}
      <br />
     {pools.length === 1 && <button type="submit">Delegate</button> }
    </form>
    </div>
  );

}
export default WalletDelegation;