import React from "react";
import "./TokenElement.css"


function TokenElement(tokenId,amount){
    const [ tokenInfo, setTokenInfo] =  React.useState({})
  

    async function writeToLocalStorage(key, value) {

        let lock = localStorage.getItem('lock');
        while (lock === 'true') {
          await new Promise(r => setTimeout(r, 100));
          lock = localStorage.getItem('lock');
        }
      
        localStorage.setItem('lock', 'true');
        let tokenMap =  {...JSON.parse(localStorage.getItem('tokenInfo'))};
        tokenMap[key] = value
        localStorage.setItem('tokenInfo', JSON.stringify(tokenMap));
      
        localStorage.setItem('lock', 'false');
      }

    React.useEffect(() => {

     


        let tokenMap =  {...JSON.parse(localStorage.getItem('tokenInfo'))};
        console.log(tokenMap)
        if ( tokenId in tokenMap){
            setTokenInfo(tokenMap[tokenId])
        }else{
            const tokenInfo = fetch(
                `https://cardano-preprod.blockfrost.io/api/v0/assets/${tokenId}`,
                { headers: { project_id: "preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp" } },
              ).then((res) => res.json());     
              tokenInfo.then( (tokenInfo) => {
                writeToLocalStorage(tokenId,tokenInfo)
                console.log(tokenInfo) 
                setTokenInfo(tokenInfo)
              }

              )
        };
    }
, []);

    const name = tokenInfo.metadata ? tokenInfo.metadata.name : tokenInfo.onchain_metadata ?  tokenInfo.onchain_metadata.name : tokenId
    const image =  tokenInfo.metadata ?  "data:image/jpeg;base64," +tokenInfo.metadata.logo.replace(/\s/g, ';') : tokenInfo.onchain_metadata ?  tokenInfo.onchain_metadata.image.replace("ipfs://","https://ipfs.io/ipfs/") : ""
   
    // getTokenInfo(tokenId)
    return (<div className="TokenElement"> 
       <img className="TokenThumbnail" src={image } />
       <span className="tokenElementAmount">{((tokenInfo.metadata) ? Number(amount)  / (10**tokenInfo.metadata.decimals) : amount ).toString()} </span><br/>
       <span className="tokenElementName">{name }</span>
     </div>)
}


export default TokenElement