
async function getTokenInfo(tokenId){
    let tokenMap =  {...JSON.parse(localStorage.getItem('tokenInfo'))};
    if(tokenId == 'lovelace'){
      console.log("tokenId",tokenId)
        return   {
        "name": "ADA",
        "ticker": "ADA",
        "decimals": 6,
        "image": "https://icons-for-free.com/iconfiles/png/512/cardano+icon-1320162855683510157.png",
        "unit": "lovelace",

        "fetch_time": Date.now()
        }

        
    }if ( tokenId in tokenMap){
      //refresh token info every 4 hours 14400000
      if(Date.now() - tokenMap[tokenId].fetch_time > 14400000){
        console.log("fetching from api", tokenId)
        return fetchTokenData(tokenId)
      }else{

        console.log("fetching from local storage",tokenMap[tokenId])
        return (tokenMap[tokenId])
      }
    }else{
      console.log("fetching from api", tokenId)
      return fetchTokenData(tokenId)            
    };
}
      
      
            async function fetchTokenData(tokenId){
              function hex2a(hexx) {
                var hex = hexx.toString();//force conversion
                var str = '';
                for (var i = 0; i < hex.length; i += 2)
                    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                return str;
            }
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

              function splitTokenId(tokenId){
                const splitLength = 56
                const splitTokenId = []
                for (let i = 0; i < tokenId.length; i += splitLength) {
                  splitTokenId.push(tokenId.substring(i, i + splitLength))
                }
                return splitTokenId
              }

              const settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : {metadataProvider: "koios"}
              const tokenInfo = {}
      
              if ( settings.metadataProvider === "Koios"){
                const splitTokenName =  splitTokenId(tokenId)
                const api = settings.network === "Mainnet" ? "https://api.koios.rest/api/v0/asset_info" : `https://${settings.network}.koios.rest/api/v0/asset_info`
      
                  const koiosTokenInfo = await fetch(
                    `${api}?_asset_policy=${splitTokenName[0]}&_asset_name=${splitTokenName[1]}`,
                  ).then((res) => res.json());
      
                  
                console.log("KoiosTokenInfo",koiosTokenInfo)
                tokenInfo["fetch_time"] = Date.now()
                if(koiosTokenInfo[0].token_registry_metadata){
                  tokenInfo["name"] = koiosTokenInfo[0].token_registry_metadata.name
                  tokenInfo["image"] = "data:image/jpeg;base64," +koiosTokenInfo[0].token_registry_metadata.logo.replace(/\s/g, ';')}
                else if (koiosTokenInfo[0].minting_tx_metadata){
                  const mintingTxMetadata = koiosTokenInfo[0].minting_tx_metadata["721"] ? koiosTokenInfo[0].minting_tx_metadata["721"] : koiosTokenInfo[0].minting_tx_metadata["20"]
                  console.log("mintingTxMetadata",mintingTxMetadata)
                  if(mintingTxMetadata[splitTokenName[0]][splitTokenName[1]]){
                    tokenInfo["name"] = mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].name ? mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].name : mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].ticker
                    tokenInfo["image"] = (mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].image ? mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].image  :mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].icon ).replace("ipfs/","https://gateway.pinata.cloud/ipfs/").replace("ipfs://","https://gateway.pinata.cloud/ipfs/")
                  }else if(mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])]){
                    tokenInfo["name"] = mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].name ? mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].name : mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].ticker
                    tokenInfo["image"] = (mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].image ? mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].image  :mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].icon ).replace("ipfs/","https://gateway.pinata.cloud/ipfs/").replace("ipfs://","https://gateway.pinata.cloud/ipfs/")
                  }else{
                    tokenInfo["name"] = mintingTxMetadata[splitTokenName[0]].name
                    tokenInfo["image"] =(  mintingTxMetadata[splitTokenName[0]].image ? mintingTxMetadata[splitTokenName[0]].image : mintingTxMetadata[splitTokenName[0]].icon).replace("ipfs/","https://gateway.pinata.cloud/ipfs/").replace("ipfs://","https://gateway.pinata.cloud/ipfs/")
                  }
                }else if(koiosTokenInfo[0].asset_name_ascii){
                  tokenInfo["name"] = koiosTokenInfo[0].asset_name_ascii
      
                }else {
                  tokenInfo["name"] = tokenId
                }
      
      
             //   tokenInfo["image"] =  koiosTokenInfo[0].token_registry_metadata ?  "data:image/jpeg;base64," +koiosTokenInfo[0].token_registry_metadata.logo.replace(/\s/g, ';') : koiosTokenInfo[0].minting_tx_metadata ?  koiosTokenInfo[0].minting_tx_metadata["721"].image.replace("ipfs://","https://gateway.pinata.cloud/ipfs/") : ""
                tokenInfo["decimals"] = koiosTokenInfo[0].token_registry_metadata ?   koiosTokenInfo[0].token_registry_metadata.decimals : null
                console.log("tokenInfo",tokenId,tokenInfo)
      
                writeToLocalStorage(tokenId,tokenInfo)
                return(tokenInfo)
              
              }else if ( settings.metadataProvider === "Blockfrost"){
                console.log("fetching from blockfrost")
              const BlockfrostTokenInfo = await fetch(
                  `${settings.api.url}/assets/${tokenId}`,
                  { headers: { project_id: settings.api.projectId } },
                ).then((res) => res.json());     
                  console.log("BlockfrostTokenInfo",BlockfrostTokenInfo)
                   tokenInfo["fetch_time"] = Date.now()
      
                  if(BlockfrostTokenInfo.metadata){
                    tokenInfo["name"] = BlockfrostTokenInfo.metadata.name
                    tokenInfo["image"] = "data:image/jpeg;base64," +BlockfrostTokenInfo.metadata.logo.replace(/\s/g, ';')
                    tokenInfo["decimals"] = BlockfrostTokenInfo.metadata.decimals
                  }else if (BlockfrostTokenInfo.onchain_metadata){
                    tokenInfo["name"] = BlockfrostTokenInfo.onchain_metadata.name
                    tokenInfo["image"] = BlockfrostTokenInfo.onchain_metadata.image.replace("ipfs/","https://gateway.pinata.cloud/ipfs/").replace("ipfs://","https://gateway.pinata.cloud/ipfs/")
                  }else{
                    tokenInfo["name"] = hex2a(BlockfrostTokenInfo.asset_name)
                    
                  }
                  
                    tokenInfo["decimals"] = BlockfrostTokenInfo.metadata ?   BlockfrostTokenInfo.metadata.decimals : null
      
                console.log("tokenInfo",tokenId,tokenInfo)
                writeToLocalStorage(tokenId,tokenInfo)
                return(tokenInfo)
              }
      
            }
      
      
      export default getTokenInfo