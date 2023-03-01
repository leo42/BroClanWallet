import React, { useEffect } from "react";
import "./Receive.css"
import {  toast } from 'react-toastify';
import QRCode from "qrcode";
function Receive(props){
    const [address, setAddress] = React.useState(props.wallet.getDefaultAddress() === "" ? props.wallet.getAddress() : props.wallet.getDefaultAddress())
    const [newStake, setNewStake] = React.useState(false)
    const [options, setOptions] = React.useState([])
    const [optionsNames, setOptionsNames] = React.useState({})

    const donationAddress = "addr_test1qpy8h9y9euvdn858teawlxuqcnf638xvmhhmcfjpep769y60t75myaxudjacwd6q6knggt2lwesvc7x4jw4dr8nmmcdsfq4ccf"

    function handleClick(value){
        navigator.clipboard.writeText(value)
        toast.info("Address copied to clipboard!")
    }
    const canvasRef = React.useRef();

    React.useEffect(() => {
        QRCode.toCanvas(
          canvasRef.current,
          // QR code doesn't work with an empty string
          // so we are using a blank space as a fallback
          address || " ",
          (error) => error && console.error(error)
        );
      }, [address]);

    const handleStakingChange = (event) => {
        
        if (event.target.value === "new" ){
            setNewStake(true)
            setAddress("Enter an address of the wallet that will receive the rewards")
        }else{
            setNewStake(false)
            setAddress(props.wallet.getAddress(event.target.value))
        } 
               console.log(event.target.value)
    }
    const handleNewAddressChange = (event) =>{
        try{
        if(event.target.value === ""){
            setAddress("Enter an address of the wallet that will receive the rewards")
            return
        }
          setAddress(props.wallet.getAddress(event.target.value))
        }catch{
            setAddress("Invalid Stake Address")
        }
    }

    useEffect(() => {
            const options =  props.wallet.getFundedAddress()
            const optionsNames = {}
            console.log(options,optionsNames)

            options.map( option => { optionsNames[option] = props.wallet.getAddressName(option) })
            
            // add the unstaked address only if it is not already in the list of funded addresses 
            console.log()
            
            console.log(props.wallet.getAddress())
            options.includes( props.wallet.getAddress())?   "" :  options.push(props.wallet.getAddress())
            props.wallet.getAddress() in optionsNames && optionsNames[props.wallet.getAddress()] !== props.wallet.getAddress() ?  "" :  optionsNames[props.wallet.getAddress()] = "Regular Address" 
        
            console.log(options,optionsNames)


            options.includes(props.wallet.getAddress(donationAddress))  ? "" : options.push(props.wallet.getAddress(donationAddress))
            props.wallet.getAddress(donationAddress) in optionsNames && optionsNames[props.wallet.getAddress(donationAddress)] !== props.wallet.getAddress(donationAddress) ?  "" :  optionsNames[props.wallet.getAddress(donationAddress)] = "Donate rewards" 

        
            console.log(options,optionsNames)
        
        
            options.push("new")
            optionsNames["new"] = "New Externaly Staked Address"
            setOptions(options)
            setOptionsNames(optionsNames)
            console.log(options,optionsNames)
    }, [props.wallet])

    

    return <div>    
        <select onChange={handleStakingChange} defaultValue={props.wallet.getDefaultAddress()}>
            {options.map( (item, index) => (
                  <option key={index} value={item} >{optionsNames[item]}</option>
         ))}
        </select>
        { newStake ? <input type="text" onChange={handleNewAddressChange}></input> : ""}
        { props.wallet.getAddress(donationAddress) === address ? <div className="donationMessage">By using this address your Staking rewards will support the development of this software! </div> : ""}
        <div className="ReseiveAddress "  onClick={() => handleClick(address)}>
        {address} 
        <svg className="copyIcon" id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg>
        <br/>
        <canvas ref={canvasRef} />
        </div>
        </div>

}

export default Receive