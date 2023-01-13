import React from "react";
import "./Receive.css"
import { ToastContainer, toast } from 'react-toastify';
import QRCode from "qrcode";
function Receive(props){
    const [address, setAddress] = React.useState(props.wallet.getAddress())
    const [newStake, setNewStake] = React.useState(false)
    const [invalidStake, setInvalidStake] = React.useState(false)

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
            setAddress(props.wallet.getAddress())
        }else{
            setNewStake(false)
            setInvalidStake(false)
            setAddress(props.wallet.getAddress(event.target.value))
        } 
               console.log(event.target.value)
    }
    const handleNewAddressChange = (event) =>{
        try{
          setAddress(props.wallet.getAddress(event.target.value))
          setInvalidStake(false)
        }catch{
            setAddress("Invalid Stake Address")
            setInvalidStake(true)
        }
    }

    return <div>    
        <select onChange={handleStakingChange} defaultValue={null}>
            <option value="" >Unstaked</option>
            {props.wallet.getFundedAddress().map( (item, index) => (
                  <option key={index} value={item} >{props.wallet.getAddressName(item)}</option>
         ))}
            <option value="new" >New Staked Address</option>
            <option value="addr_test1qpceptsuy658a4tjartjqj29fhwgwnfkq2fur66r4m6fpc73h7m9jt9q7mt0k3heg2c6sckzqy2pvjtrzt3wts5nnw2q9z6p9m" >Donate rewards</option>
        </select>
        { newStake ? <input type="text" onChange={handleNewAddressChange}></input> : ""}
        
        <div className="ReseiveAddress "  onClick={() => handleClick(address)}>
        {address} 
        <svg className="copyIcon" id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg>
        <br/>
        <canvas ref={canvasRef} />
        </div>
        </div>

}

export default Receive