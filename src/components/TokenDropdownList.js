import React, { useState } from "react";
import TokenElement from "./TokenElement";
import "./TokenDropdownList.css";

function TokenDropdownMenu(props) {
    // State to keep track of whether the menu is open or closed
    const [isOpen, setIsOpen] = useState(false);
    

    function handleClick(token ){ 
        props.f(token)
        setIsOpen(!isOpen)
    }

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)}>Add Token</button>
            {isOpen && (
                <div  className="TokenList">
                    {Object.keys(props.ballances).filter((token => token!=="lovelace")).map( (token,index) => 
                    <div className="TokenListTokenContainer" key={index} > <div ><TokenElement tokenId={token} f={handleClick} amount={props.ballances[token]}  expanded={true}/></div> </div>

                    )}
                </div>
            )}
        </div>
    );
}

export default TokenDropdownMenu;
