import React from "react";
import getPoolInfo from '../helpers/PoolInfo.js'

function PoolElement(props){
    const [ PoolInfo, setPoolInfo] =  React.useState({})
    React.useEffect(() => {
        console.log("PoolElement", props)
        var poolInfoFetch =  getPoolInfo(props.poolId)
        poolInfoFetch.then( info => 
          setPoolInfo(info)
        )
    },[])

    if (PoolInfo === undefined) return (<div className="PoolElement">{props.poolId} </div>)

    return (
    <div className="PoolElement"> 
       <img className="PoolThumbnail"  />
       <span className="PoolElementName"> {JSON.stringify(PoolInfo)} </span>:
     </div>)
}


export default PoolElement