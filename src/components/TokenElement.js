import React from "react";
import "./TokenElement.css"
import getTokenInfo from "../helpers/tokenInfo.js"

function TokenElement(props){
    const [ tokenInfo, setTokenInfo] =  React.useState({})
    React.useEffect(() => {
        var tokenInfoFetch =  getTokenInfo(props.tokenId)
        tokenInfoFetch.then( info => 
          setTokenInfo(info)
        )
    },[])
    console.log(tokenInfo,props.tokenId)
    if (tokenInfo === undefined) return (<div className="TokenElement">{props.tokenId}:{Number(props.amount)}  </div>)

    return (
    <div className="TokenElement"> 
       <img className="TokenThumbnail" src={tokenInfo.image } />
       <span className="tokenElementName">{tokenInfo.name }</span>:
       <span className="tokenElementAmount">{((tokenInfo.decimals) ? Number(props.amount)  / (10**tokenInfo.decimals) : props.amount ).toString()} </span>
     </div>)
}


export default TokenElement