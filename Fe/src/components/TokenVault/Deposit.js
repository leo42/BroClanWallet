import React, { useEffect , useState} from 'react';
import { Lucid , Data , C } from 'lucid-cardano';
import {  toast } from 'react-toastify';
import getTokenInfo from "../../helpers/tokenInfo.js"
import TokenDropdownMenu from '../TokenDropdownList.js';
import TokenElement from "../TokenElement";

function Deposit(props) {
    const [utxos, setUtxos] = useState([])
    const [amount, setAmount] = useState({ lovelace: 10000000})
    const [tokenData, setTokenData] = useState({})
    const [fullBalance, setFullBalance] = useState({})
    const [options, setOptions] = React.useState([])
    const [newStake, setNewStake] = React.useState(false)
    const [optionsNames, setOptionsNames] = React.useState({})
    const [address, setAddress] = React.useState( props.wallet.getAddress() )

    const donationAddress = "addr1q9jae9tlky2gw97hxqkrdm5lu0qlasrzw5u5ju9acpazk3ev94h8gqswgsgfp59e4v0z2dapyamyctfeyzykr97pajdq0nanuq"

    const api = props.moduleRoot.state.connectedWallet.api
    const lucid = props.moduleRoot.state.connectedWallet.lucid
    const activeToken = props.moduleRoot.state.wallet.getToken()
    
    useEffect(() => {
        const options =  props.wallet.getFundedAddress()
        const optionsNames = {}

        options.map( option => { optionsNames[option] = props.wallet.getAddressName(option) })
        
        // add the unstaked address only if it is not already in the list of funded addresses 
        
        options.includes( props.wallet.getAddress())?   "" :  options.push(props.wallet.getAddress())
        props.wallet.getAddress() in optionsNames && optionsNames[props.wallet.getAddress()] !== props.wallet.getAddress() ?  "" :  optionsNames[props.wallet.getAddress()] = "Regular Address" 
    


        options.includes(props.wallet.getAddress(donationAddress))  ? "" : options.push(props.wallet.getAddress(donationAddress))
        props.wallet.getAddress(donationAddress) in optionsNames && optionsNames[props.wallet.getAddress(donationAddress)] !== props.wallet.getAddress(donationAddress) ?  "" :  optionsNames[props.wallet.getAddress(donationAddress)] = "Donate rewards" 

    
    
    
        options.push("new")
        optionsNames["new"] = "New Externaly Staked Address"
        setOptions(options)
        setOptionsNames(optionsNames)
}, [props.wallet])

    useEffect(() => {
        async function getUtxos() {
            if (lucid){
                const utxos = await lucid.wallet.getUtxos()
               setUtxos(utxos)
            }
        }
        getUtxos()
        getFullBalance()
    }, [lucid, api])

    async function performDeposit() {
    try {
        console.log("performing deposit", props.moduleRoot.state.connectedWallet.lucid)
        const lucid = await props.moduleRoot.state.wallet.newLucidInstance(props.root.state.settings)
        lucid.selectWallet(props.moduleRoot.state.connectedWallet.api)
        const tx = await lucid.newTx().payToContract(address ,{ inline : Data.void()}, amount).complete()
        const signedTx = await tx.sign().complete()
        const txHash = await signedTx.submit()
    } catch (error) {
        toast.error(error.message)
       }
    }

    async function getFullBalance() {
        const UTxOs = await props.moduleRoot.state.connectedWallet.lucid.wallet.getUtxos()
        let fullBalance = {}
        for(const utxo of UTxOs) {
            for(const token of Object.keys(utxo.assets)) {
                if (activeToken !== token){ 
                    if (token in fullBalance) {
                        fullBalance[token] += utxo.assets[token]
                    } else {
                        fullBalance[token] = utxo.assets[token]
                    }
                }
            }
        }

        setFullBalance(fullBalance)
    }

    async function getAllTokenInfo() {
        for(const token of Object.keys(fullBalance)) {
          if (token !== "lovelace") {
            const data = await getTokenInfo(token)
              const tokenData = {...tokenData}
              tokenData[token] = data
              setTokenData(tokenData)
            }
          }
        }
    

    useEffect(() => {
        getAllTokenInfo()
        
      },[fullBalance])

    const addToken = (tokenId) => {
        const localAmount = {...amount}
        localAmount[tokenId] = 0
        setAmount(localAmount)
    }

    const deleteToken = (tokenId) => {
        const localAmount = {...amount}
        delete localAmount[tokenId]
        setAmount(localAmount)
    }
    
    const setMax = (tokenId) => {
        const localAmount = {...amount}
        localAmount[tokenId] = Number(fullBalance[tokenId])
        setAmount(localAmount)
    }

    const updateAmount = (value,tokenId) => {
        const localAmount = {...amount}
        const ajustedValue = tokenId === "lovelace" ? Number(value) * 1_000_000 : Number(value) * (10**tokenData[tokenId].decimals)  
        if (Number(ajustedValue) > Number(fullBalance[tokenId])) {
            localAmount[tokenId] = Number(fullBalance[tokenId])
        }else{
            localAmount[tokenId] = Number(ajustedValue)
        }   
        
        setAmount(localAmount)
    }
    const handleNewAddressChange = (event) => {
        if(props.wallet.isAddressValid(event.target.value)){
            setAddress(props.wallet.getAddress(event.target.value))
        }else{
            setAddress("Invalid Stake Address: " + event.target.value )
        }
    }

    const handleStakingChange = (event) => {
        if (event.target.value === "new" ){
            setNewStake(true)
            setAddress("")
        }else{
            setNewStake(false)
            setAddress(props.wallet.getAddress(event.target.value))
        }
    }


    const RecipientJSX = () => (
        <div className='createTxRecipientContainer'>
          <div className='deleteRecipientWrapper'>
  
          </div>
        
      <div className="addressWrap ADAAmountContainer">
      <div className="address_wrap">
      <span className="overVeiwTokenSearch">ADA: <input className='createTxADAInputField'
          type="number"
          name="amount"
          value={amount.lovelace === 0 ? "" : amount.lovelace/1_000_000 }
          onChange={event => updateAmount(event.target.value,"lovelace")}
        /> </span>
        </div>
        </div>
      <br/>
      
      <div className="createTxSelectedTokenList">
          {Object.keys(amount).filter((token => token!=="lovelace")).map( (item,i) => (
            <div key={i}>        
        
      <div className="addressWrap">
         <div className="CreateTxSelectedToken">
         <div key={item} className='CreateTxTokenContainer'> 
         <TokenElement tokenId={item} amount={fullBalance[item]}/></div>
           {!tokenData[item].isNft && <div className='tokenAmount'> <input
              type="number"
              name="amount"
              value={ amount[item] === 0 ? "" : (tokenData[item] && tokenData[item].decimals ) ? amount[item] / (10**tokenData[item].decimals)  : amount[item] }
              onChange={event => updateAmount(event.target.value,item)}
              /> 
              <button type="submit" className='maxButton' onClick={ () =>  setMax(item)}>max</button>
              </div>
            }
           <button type="submit" className='deleteTokenButton' onClick={ () =>  deleteToken(item)}>x</button>
        </div>
    
        </div>
        </div>
        ))}
        </div>
        <TokenDropdownMenu ballances={fullBalance} f={ (tokenId) => addToken(tokenId )}></TokenDropdownMenu>
      </div>
      )

    return(
        <div>
            <h1>Deposit</h1>
            <select onChange={handleStakingChange} className="addressSelect" defaultValue={props.wallet.getDefaultAddress()}>
            {options.map( (item, index) => (
                  <option key={index} value={item} >{optionsNames[item]}</option>
         ))}
        </select>
        { newStake ? <input type="text" onChange={handleNewAddressChange}></input> : ""}
        { props.wallet.getAddress(donationAddress) === address ? <div className="donationMessage">By using this address your Staking rewards will support the development of this software! </div> : ""}
       
            <p>Deposit your tokens to the vault</p>
            {RecipientJSX()}
            <button className='commonBtn' onClick={() => { performDeposit() }}>Deposit</button>
            <p> </p>
            </div>
            )
        }

export default Deposit;