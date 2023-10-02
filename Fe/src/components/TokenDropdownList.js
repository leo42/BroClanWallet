import React, { useState } from "react";
import TokenElement from "./TokenElement";
import "./TokenDropdownList.css";
import { ReactComponent as TokenIcon } from '../html/assets/token.svg';

function TokenDropdownMenu(props) {
    // State to keep track of whether the menu is open or closed
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [hovering, setHovering] = useState("");
    function handleClick(token ){ 
        props.f(token)
        setIsOpen(!isOpen)
    }


    return (
        <div className="TokenLisWrapper">
        <div  onMouseEnter={() => setHovering("addToken")} onMouseLeave={() => setHovering("") } onClick={() => setIsOpen(!isOpen)}  className='iconWraper tokenIconButton'>
            <TokenIcon className="icon"  alt="downloadIcon" />
        {  hovering === "addToken" &&  <label className='iconLabel'>Add Token</label> }
        <br/>
          </div>
            {isOpen && (
                <div>
                    <span className="overVeiwTokenSearch"><input type="text"  defaultValue={search} placeholder="Search" onChange={(event) => setSearch(event.target.value)} /></span>
                    <br/>
                <div  className="TokenList">
                    {Object.keys(props.ballances).filter((token => token!=="lovelace")).map( (token,index) => 
                     <TokenElement tokenId={token} f={handleClick} className="TokenListTokenContainer" key={index+props.index}  search={search} amount={props.ballances[token]}  expanded={true}/>

                    )}
                </div>
                </div>

            )}
        </div>
        
    );
}

export default TokenDropdownMenu;
