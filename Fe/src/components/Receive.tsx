import React, { useEffect } from "react";
import "./Receive.css"
import {  toast } from 'react-toastify';
import QRCode from "qrcode" ;
import copyTextToClipboard from "../helpers/copyTextToClipboard";
import WalletInterface from "../core/WalletInterface";

function Receive(props: {wallet: WalletInterface}){
    const [address, setAddress] = React.useState(props.wallet.getDefaultAddress() === "" ? props.wallet.getAddress() : props.wallet.getDefaultAddress())
    const [newStake, setNewStake] = React.useState(false)
    const [options, setOptions] = React.useState<string[]>([])
    const [optionsNames, setOptionsNames] = React.useState<{[key: string]: string}>({})


    const donationAddress = "addr1q9jae9tlky2gw97hxqkrdm5lu0qlasrzw5u5ju9acpazk3ev94h8gqswgsgfp59e4v0z2dapyamyctfeyzykr97pajdq0nanuq"

    function handleClick(value: string){
        copyTextToClipboard(value)
        toast.info("Address copied to clipboard!")
    }
    
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
        QRCode.toCanvas(
          canvasRef.current,
          // QR code doesn't work with an empty string
          // so we are using a blank space as a fallback
          address || " ",
          (error: any) => error && console.error(error)
        );
      }, [address]);


    const handleStakingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        
        if (event.target.value === "new" ){
            setNewStake(true)
            setAddress("Enter an address of the wallet that will receive the rewards")
        }else{
            setNewStake(false)
            setAddress(props.wallet.getAddress(event.target.value))
        } 
    }
    const handleNewAddressChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
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
            const optionsNames = {} as {[key: string]: string}

            options.map( (option: string) => { optionsNames[option] = props.wallet.getAddressName(option) })
            

            // add the unstaked address only if it is not already in the list of funded addresses 
            
            options.includes( props.wallet.getAddress())?   "" :  options.push(props.wallet.getAddress())
            optionsNames[props.wallet.getAddress()] = "Regular Address"
      


            options.includes(props.wallet.getAddress(donationAddress))  ? "" : options.push(props.wallet.getAddress(donationAddress))
            props.wallet.getAddress(donationAddress) in optionsNames && optionsNames[props.wallet.getAddress(donationAddress)] !== props.wallet.getAddress(donationAddress) ?  "" :  optionsNames[props.wallet.getAddress(donationAddress)] = "Donate rewards" 

        
        
        
            options.push("new")
            optionsNames["new"] = "New Externaly Staked Address"
            setOptions(options)
            setOptionsNames(optionsNames)
    }, [props.wallet])

    

    return <div className="receiveTab">    
        <select onChange={handleStakingChange} className="addressSelect" defaultValue={props.wallet.getAddress()}>
            {options.map( (item, index) => (
                  <option key={index} value={item} >{optionsNames[item]}</option>
         ))}
        </select>
        { newStake ? <input type="text" onChange={handleNewAddressChange}></input> : ""}
        { props.wallet.getAddress(donationAddress) === address ? <div className="donationMessage">By using this address your Staking rewards will support the development of this software! </div> : ""}
        <div className="ReseiveAddress "  onClick={() => handleClick(address)}>
        <canvas ref={canvasRef} />
        <br/>
        {address} 
        <svg className="copyIcon" id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg>
        </div>
        </div>

}

export default Receive