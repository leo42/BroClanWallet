import React, { useEffect, useState } from 'react';
import PoolElement from './PoolElement';
import SearchPools from '../helpers/SearchPools';
import "./WalletDelegation.css"
import  { ReactComponent as LoadingIcon } from '../html/assets/loading.svg';
import WalletInterface from '../core/WalletInterface';
import SmartWalletContainer from './SmartWallet/SmartWalletContainer';
import MultisigContainer from './Multisig/MultisigContainer';
import { App } from '..';
import {Delegation } from '@lucid-evolution/core-types'

function WalletDelegation(props: {wallet: WalletInterface, moduleRoot: SmartWalletContainer | MultisigContainer,  root: App} ) {
  const wallet = props.wallet
  const initialState: boolean[] = []



  props.moduleRoot.getSigners().map( (signer: any) =>
    initialState.push(signer.isDefault)
  ) 
  const [pool, setPool] = useState('');
  const [signers, setCheckedState] = useState(initialState);
  const [delegation, setDelegation] = useState<Delegation>({} as Delegation);
  const [pools, setPools] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [delegationType, setDelegationType] = useState('Abstain');
  const [customDelegation, setCustomDelegation] = useState('');

  useEffect(() => {
    wallet.getDelegation().then( (delegation: Delegation) => {;
      setDelegation(delegation);
      setPool(delegation.poolId || '');
      
    })
  }, [wallet])


  useEffect(() => {
    setSearching(true);
    if (pool === '') {
      setPools([]);
      setSearching(false);
      return;
    }
    SearchPools(pool).then( (pools: string[]) => {
      setSearching(false);

      setPools(pools);
    })
  }, [pool, wallet])


  
  const handleOnChangeSigners = (position: number) => {
    const updatedCheckedState = [...signers]
    updatedCheckedState[position] = !updatedCheckedState[position]
    setCheckedState(updatedCheckedState);
  };


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
   
    const txSigners = signers.map((item, index) =>
        item ?  props.moduleRoot.getSigners()[index].hash : ""
    )
    const dRepId = delegationType === 'custom' ? customDelegation : delegationType;
    props.moduleRoot.createDelegationTx(pools[0], dRepId, txSigners.filter((element, index) => signers[index]));
  }

  const Undelegate = (event: React.MouseEvent<HTMLInputElement>) => {
    event.preventDefault();


    const txSigners = signers.map((item, index) =>
        item ? props.moduleRoot.getSigners()[index].hash : ""
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
        {delegation && delegation.poolId && <PoolElement key={delegation.poolId} root={props.root} poolId={delegation.poolId} />}


        <p>Rewards : {Number(delegation.rewards)/1_000_000}{props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  }  </p>
      </div>
    }
  }

  const searchingAnimation = () => {
      return <div className="searching"> 
      <LoadingIcon className="loadingIcon"  > </LoadingIcon>
      </div>
  } 
    const txSigners = signers.map((item, index) =>
      item ? props.moduleRoot.getSigners()[index].hash : ""
  )
    const signersValid = wallet.checkSigners(txSigners.filter((element, index) => signers[index]))

   const SignersSelect =  props.moduleRoot.getSigners().map( (item, index) => (
    <div key={index} >
   <label className='signerCheckbox'>
     {props.moduleRoot.getSigners()[index].name}:
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
    <div className='DelegationContainer'>
      <div className='BetaInfo'> 
Beta delegation is available for dReps. Delegation transactions now perform dRep and Stakepool delegation simultaneously. <br />
You have to enter the dRep CIP-129 ID (e.g., drep13846y7q7tng3endxhet9qdcz5w0fjs09ytcye4dm5g54wmyqeqr). <br />

      </div>
    <div className="DelegationCenter">
      <div className='DelegationInfo'>
        {delegationInfo()}
      </div>
     <div className='DelegationUpdate'>
    <form onSubmit={handleSubmit}>
      <h1> Manage Delegation </h1>
      <label>
       
        <input
          type="text"
          name="amount"
          placeholder='Search for a pool'
          value={pool}
          onChange={event => setPool(event.target.value)}
        />
      </label>
      {searching ? searchingAnimation() : pools.map( (pool: string) => (
          <div key={pool}>
            <PoolElement  key={pool} root={props.root} poolId={pool} />
             {pools.length !== 1 && <button type="button" className='commonBtn' onClick={() => setPool(pool)}>Select</button>}
            <br/>
          </div>
        )
      )}
     <div className='dRepDelegation'>
      <label>
        <select value={delegationType} onChange={event => setDelegationType(event.target.value)}>
          <option value="Abstain">Auto Abstain</option>
          <option value="NoConfidence">Auto Nonconfidence</option>
          <option value="custom">Custom</option>
        </select>
      </label>
      {delegationType === 'custom' && (
        <label>
          <input
            type="text"
            name="customDelegation"
            placeholder='dRep CIP129 Id'
            value={customDelegation}
            onChange={event => setCustomDelegation(event.target.value)}
          />
        </label>
      )}
</div>
      { props.moduleRoot.getSigners().length !== 0 && (
      <div className='SignersSelect' ><h2> Signers:</h2>
      <div className='SignersSelectList'>
      { SignersSelect}
      </div>
      </div>)}
     { signersValid && pools.length === 1 && <button  className='commonBtn' type="submit">Delegate</button> }
     {  signersValid && delegation.poolId !== null &&   <input className='commonBtn' type="button" value="Undelegate" onClick={Undelegate} /> }

    </form>
    </div>
    </div>
    </div>
  );

}
export default WalletDelegation;