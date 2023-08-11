import React from "react";

import getTokenInfo from "../helpers/tokenInfo.js"

function TokenThumbnail(props) {

    const [ tokenInfo, setTokenInfo] =  React.useState({})

    React.useEffect(() => {
        var tokenInfoFetch =  getTokenInfo(props.tokenId)
        tokenInfoFetch.then( info => 
          setTokenInfo(info)
        )
    },[])
    React.useEffect(() => {
        if (tokenInfo && tokenInfo.fingerprint === ""  ){
          //set 10 sec timeout to prevent too many requests
          setTimeout(() => {
            
          var tokenInfoFetch =  getTokenInfo(props.tokenId)
          tokenInfoFetch.then( info =>  
            setTokenInfo(info)
          )
        }
        ,10000)
        }
      },[tokenInfo])



    return (
        <div className="TokenThumbnailElement" onClick={() => props.f(props.tokenId)}> 
        <img className="TokenThumbnail" src={tokenInfo.image } />
        <span className="TokenThumbnailName">{tokenInfo.name}</span></div>
    );
}

export default TokenThumbnail;