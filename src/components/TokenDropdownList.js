import React, { useState } from "react";
import TokenElement from "./TokenElement";
import getTokenInfo from "../helpers/tokenInfo.js"

function TokenDropdownMenu(props) {
    // State to keep track of whether the menu is open or closed
    const [isOpen, setIsOpen] = useState(false);
    
    console.log(props.ballances)



    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)}>Add Token</button>
            {isOpen && (
                <ul>
                    {Object.keys(props.ballances).map( (token,index) => 
                    <li key={index} ><div onClick={() => props.f(token, props.index)}><TokenElement tokenId={token} amount={props.ballances[token]}/></div> </li>

                    )}
                </ul>
            )}
        </div>
    );
}

export default TokenDropdownMenu;
