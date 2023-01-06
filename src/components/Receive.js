import React from "react";


function Receive(props){

    function handleClick(value){

    }

    return <div class="ResiveAddress" onClick={(event => handleClick(event.target.value))} value={props.wallet.getAddress()}>{props.wallet.getAddress()} </div>

}

export default Receive