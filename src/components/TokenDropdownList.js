import React, { useState } from "react";
import TokenElement from "./TokenElement";
import "./TokenDropdownList.css";

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
                <div  className="TokenList">
                    {Object.keys(props.ballances).filter((token => token!=="lovelace")).map( (token,index) => 
                    <div className="TokenListTokenContainer" key={index} ><div onClick={() =>handleClick(token, props.index)}><TokenElement tokenId={token} amount={props.ballances[token]}/></div> </div>

                    )}
                </div>
            )}
        </div>
    );
}

export default TokenDropdownMenu;
