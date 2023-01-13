import React, { useState } from "react";
import TokenElement from "./TokenElement";
import getTokenInfo from "../helpers/tokenInfo.js"

function TokenDropdownMenu(props) {
    // State to keep track of whether the menu is open or closed
    const [isOpen, setIsOpen] = useState(false);
    

    function handleClick(token,index ){ 
        props.f(token, index)
        setIsOpen(!isOpen)
    }

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)}>Add Token</button>
            {isOpen && (
                <ul>
                    {Object.keys(props.ballances).filter((token => token!=="lovelace")).map( (token,index) => 
                    <li key={index} ><div onClick={() =>handleClick(token, props.index)}><TokenElement tokenId={token} amount={props.ballances[token]}/></div> </li>

                    )}
                </ul>
            )}
        </div>
    );
}

export default TokenDropdownMenu;
