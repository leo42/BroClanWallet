import React from "react";
import "./TokenElement.css"
import getTokenInfo from "../helpers/tokenInfo"
import { TokenInfo } from "../helpers/tokenInfo";

type TokenElementProps = {
  tokenId: string;
  amount: number;
  filter?: string;
  search?: string;
  className?: string;
  expanded?: boolean;
  index?: number;
  f?: (tokenId: string) => void;
}


function TokenElement(props: TokenElementProps): JSX.Element | null {

    const [ tokenInfo  , setTokenInfo] =  React.useState({} as TokenInfo)
    const [showTooltip, setShowTooltip] = React.useState(false);
    let settings = JSON.parse(localStorage.getItem("settings") || "{}")
    if (settings === null || settings === undefined) {
      settings = {network: "Mainnet"}
    }
    const networkPrefix = ""; //= settings.network === "Mainnet" ? "" : settings.network.toLowerCase() + "."
    React.useEffect(() => {
        var tokenInfoFetch =  getTokenInfo(props.tokenId)
        tokenInfoFetch.then( info => 
          setTokenInfo(info)
        )
    },[])

    const handleThumpnailClick = () => {
      // prevent default  behaviour
      window.open(`https://${networkPrefix}cexplorer.io/asset/${props.tokenId}`,'_blank')
    }

    const handleClick = () => {
      if(props.f !== undefined) {
        props.f(props.tokenId)
      }
    }
    
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


    const tooltipinfo =
     <div onClick={handleThumpnailClick}  className="TokenToolTip">
      <span><a  >{props.tokenId} </a><br/></span>
      <span> {tokenInfo && tokenInfo.fingerprint} </span>
      </div>

    
    // Search filter look for props.search in tokenId, name and fingerprint
    // make name case insensitive
    if(props.search !== "" && props.search !== undefined) {
      if (tokenInfo && Object.keys(tokenInfo).length !== 0) 
       if (!props.tokenId.toLowerCase().startsWith(props.search.toLowerCase()) && tokenInfo.name !== undefined && !tokenInfo.name.toLowerCase().startsWith(props.search.toLowerCase())  )
          if( tokenInfo.fingerprint !== undefined){
            if ( !tokenInfo.fingerprint.toLowerCase().includes(props.search.toLowerCase()))
            return null
          } else 
            return null
          

    }


    if (tokenInfo === undefined) return (<div className="TokenElement">{props.tokenId}:{Number(props.amount)}  </div>)
    if (props.filter === "NFTs" && !tokenInfo.isNft){
      return null
    } else if (props.filter === "FTs" && tokenInfo.isNft){
      return null
    }else  return (

    <div className={ props.className ? props.className : " "} key={props.index}>
    <div className="TokenElementWrapper" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}> 
    <div  className="TokenElement" onClick={handleClick} > 
       <img className="TokenThumbnail" src={tokenInfo.image } />
       <div className={"TokenElementText" } > 
        <div className={(tokenInfo.name && tokenInfo.name.length > 20) ? " scroll-container" : ""}>
          <span className="tokenElementName">{tokenInfo.name }</span>
        </div>
       { !tokenInfo.isNft && <span className={"tokenElementAmount" + (props.amount > 0 ? " tokenElementAmountPositive" : " tokenElementAmountNegative") } > {((tokenInfo.decimals) ? Number(props.amount)  / (10**tokenInfo.decimals) : props.amount ).toString()} </span> }
     </div>
      </div>
       {( showTooltip || props.expanded === true ) && props.expanded !== false && <div className="tokenElementtooltip">{tooltipinfo}</div>}
     </div>
     </div>
     )
}


export default TokenElement