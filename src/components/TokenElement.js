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
      const name = tokenInfo.metadata ? tokenInfo.metadata.name : tokenInfo.onchain_metadata ?  tokenInfo.onchain_metadata.name : props.tokenId
      const image =  tokenInfo.metadata ?  "data:image/jpeg;base64," +tokenInfo.metadata.logo.replace(/\s/g, ';') : tokenInfo.onchain_metadata ?  tokenInfo.onchain_metadata.image.replace("ipfs://","https://ipfs.io/ipfs/") : ""

    return (<div className="TokenElement"> 
       <img className="TokenThumbnail" src={image } />
       <span className="tokenElementName">{name }</span>:
       <span className="tokenElementAmount">{((tokenInfo.metadata) ? Number(props.amount)  / (10**tokenInfo.metadata.decimals) : props.amount ).toString()} </span>
     </div>)
}


export default TokenElement