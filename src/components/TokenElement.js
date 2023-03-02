import React from "react";
import "./TokenElement.css"
import getTokenInfo from "../helpers/tokenInfo.js"
import ReactDOMServer from 'react-dom/server';

function TokenElement(props){
    const [ tokenInfo, setTokenInfo] =  React.useState({})
    const [showTooltip, setShowTooltip] = React.useState(false);

    React.useEffect(() => {
        var tokenInfoFetch =  getTokenInfo(props.tokenId)
        tokenInfoFetch.then( info => 
          setTokenInfo(info)
        )
    },[])
    const tooltipinfo =<a  target="_blank" href={`https://preprod.cexplorer.io/asset/${props.tokenId}`  } >{props.tokenId}</a>


    if (tokenInfo === undefined) return (<div className="TokenElement">{props.tokenId}:{Number(props.amount)}  </div>)

    return (
    <div onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} className="TokenElement" > 
       <img className="TokenThumbnail" src={tokenInfo.image } />
       <span className="tokenElementName">{tokenInfo.name }</span>:
       <span className="tokenElementAmount">{((tokenInfo.decimals) ? Number(props.amount)  / (10**tokenInfo.decimals) : props.amount ).toString()} </span>
       {showTooltip && <div className="tooltip">{tooltipinfo}</div>}
     </div>)
}


export default TokenElement