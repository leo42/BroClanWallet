import React from "react";
import getPoolInfo from '../helpers/PoolInfo.js'
import "./PoolElement.css"
function PoolElement(props){
    const [ PoolInfo, setPoolInfo] =  React.useState(undefined)
    React.useEffect(() => {
        console.log("PoolElement", props)
        var poolInfoFetch =  getPoolInfo(props.poolId)
        poolInfoFetch.then( info => 
          setPoolInfo(info)
        )
    },[])
    console.log("PoolElement", PoolInfo)
    if (PoolInfo === undefined  ) return (<div className="PoolElementNotFound">Pool Not found </div>)

    const networkPrefix = props.root.state.settings.network === "Mainnet" ? "" : props.root.state.settings.network.toLowerCase() + "."
    return (
      //on click, open pool page in new tab
      <div className="PoolElementWrapper" onClick={() => window.open(`https://${networkPrefix}cexplorer.io/pool/${props.poolId}`)} >  
          <span className="PoolElementName"> {PoolInfo["name"]} </span>
        <span className="PoolElementTicker"> {PoolInfo["ticker"]} </span>
    <div className="PoolElement"> 
    
       <img className="PoolThumbnail" src={PoolInfo["img"]}  />
       <div className="PoolElementText">
          <span className="PoolElementPledge">Pledge:{PoolInfo["pledge"] / 1_000_000} </span>
          <span className="PoolElementMargin">Margin:{PoolInfo["tax_ratio"]}% </span>
          <span className="PoolElementCost">Cost:{PoolInfo["tax_fix"] / 1_000_000} </span>
          <span className="PoolElementROI">Lifetime ROI:{PoolInfo["roa_lifetime"]} </span>
        </div>

      </div>
     </div>)
}


export default PoolElement