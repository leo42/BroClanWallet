import React from "react";
import "./TokenElement.css"
import getTokenInfo from "../helpers/tokenInfo.js"
import ReactDOMServer from 'react-dom/server';

function TokenElement(props){
    const [ tokenInfo, setTokenInfo] =  React.useState({})
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [image , setImage] = React.useState("https://icons-for-free.com/iconfiles/png/512/cardano+icon-1320162855683510157.png")
    const settings = JSON.parse(localStorage.getItem("settings"))

    const networkPrefix = settings.network === "Mainnet" ? "" : settings.network.toLowerCase() + "."
    React.useEffect(() => {
        var tokenInfoFetch =  getTokenInfo(props.tokenId)
        tokenInfoFetch.then( info => 
          setTokenInfo(info)
        )
    },[])

    React.useEffect(() => {
      if ( tokenInfo.fingerprint === ""  ){
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


    console.log(tokenInfo)
    const tooltipinfo =
     <div className="TokenToolTip">
      <span><a  target="_blank" href={`https://${networkPrefix}cexplorer.io/asset/${props.tokenId}`  }>{props.tokenId} </a><br/></span>
      <span> {tokenInfo.fingerprint} </span>
      </div>

    
    if(props.search !== "" && props.search !== undefined) {
      if (tokenInfo !== {}) 
       if (!props.tokenId.includes(props.search) && tokenInfo.name !== undefined && !tokenInfo.name.includes(props.search)  )
          if(tokenInfo.fingerprint !== undefined){
            if ( !tokenInfo.fingerprint.includes(props.search))
            return ("")
          } else return ("")
          
    }


    if (tokenInfo === undefined) return (<div className="TokenElement">{props.tokenId}:{Number(props.amount)}  </div>)
    if (props.filter === "NFTs" && !tokenInfo.isNft){
      return ""
    } else if (props.filter === "FTs" && tokenInfo.isNft){
      return ""
    }else  return (
    
    <div className="TokenElementWrapper" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}> 
    <div  className="TokenElement" > 
       <img className="TokenThumbnail" src={tokenInfo.image } />
       <div className="TokenElementText"> 
       <span className="tokenElementName">{tokenInfo.name }</span>
       { !tokenInfo.isNft && <span className="tokenElementAmount"> {((tokenInfo.decimals) ? Number(props.amount)  / (10**tokenInfo.decimals) : props.amount ).toString()} </span> }
     </div>
      </div>
       {showTooltip && <div className="tokenElementtooltip">{tooltipinfo}</div>}
     </div>)
}


export default TokenElement