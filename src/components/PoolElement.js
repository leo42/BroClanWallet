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

function handleClick(e) {
    e.preventDefault();
    console.log('The link was clicked.');
    window.open(`https://cexplorer.io/pool/${props.poolId}`, '_blank');
  }

    console.log("PoolElement", PoolInfo)
    if (PoolInfo === undefined  ) return (<div className="PoolElementNotFound">Pool Not found </div>)

    const networkPrefix = props.root.state.settings.network === "Mainnet" ? "" : props.root.state.settings.network.toLowerCase() + "."
    return (
      //on click, open pool page in new tab
      
      <div className="PoolElementWrapper"   >  
          <span className="PoolElementName"> {PoolInfo["name"]} </span>
        <span className="PoolElementTicker"> {PoolInfo["ticker"]} </span>
    <div className="PoolElement"> 
    
       <img className="PoolThumbnail" src={PoolInfo["img"]}  />
       <div className="PoolElementText">
          <span className="PoolElementPledge">Pledge:{PoolInfo["pledge"] / 1_000_000} </span>
          <span className="PoolElementMargin">Margin:{PoolInfo["tax_ratio"]}% </span>
          <span className="PoolElementCost">Cost:{PoolInfo["tax_fix"] / 1_000_000} </span>
          <span className="PoolElementROI">Lifetime ROI:{PoolInfo["roa_lifetime"]} </span>
          <span className="Saturation">Saturation:{PoolInfo["saturation"]} </span>
        </div>

      </div>
      <div className="PoolElementAtribution"  onClick={handleClick}>
        <span className="PoolElementAtributionText">Pool data provided by 
        <img className="PoolElementAtributionImg" src="cexplorer.svg" ></img> 
        </span>
         </div>
     </div>)
}


export default PoolElement