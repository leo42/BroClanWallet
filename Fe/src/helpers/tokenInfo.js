
const ipfsGateWay = "https://ipfs.blockfrost.dev/ipfs/"

async function getTokenInfo(tokenId){
    let tokenMap =  {...JSON.parse(localStorage.getItem('tokenInfo'))};
    const settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : {metadataProvider: "koios"}

    if(tokenId == 'lovelace'){
        return   {
        "name": "ADA",
        "ticker": "ADA",
        "decimals": 6,
        "image": "https://icons-for-free.com/iconfiles/png/512/cardano+icon-1320162855683510157.png",
        "unit": "lovelace",

        "fetch_time": Date.now()
        }

        
    }if ( tokenId in tokenMap){
      //refresh token data if it is older than 10 min and fingerprint is empty
      if(tokenMap[tokenId].provider !== settings.metadataProvider || (tokenMap[tokenId].fingerprint === "" && tokenMap[tokenId].fetch_time < Date.now() - 600000 ) ){
        return fetchTokenData(tokenId)
      }else{
        return (tokenMap[tokenId])
      }
    }else{
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
                splitTokenId.push(tokenId.substring(0, 56))
                splitTokenId.push(tokenId.substring(56, tokenId.length))
                return splitTokenId
              }

              const tokenInfo = {}
              const settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : {metadataProvider: "koios"}
              try{
              if (settings.metadataProvider === "None"){
                const splitTokenName =  splitTokenId(tokenId)
                tokenInfo["name"] = hex2a(splitTokenName[1])
                tokenInfo["image"] = ""
                tokenInfo["fingerprint"] = ""
                tokenInfo["provider"] = settings.metadataProvider
                tokenInfo["fetch_time"] = Date.now()
                writeToLocalStorage(tokenId,tokenInfo)
                return tokenInfo
              }
              if ( settings.metadataProvider === "Koios"){
                const splitTokenName =  splitTokenId(tokenId)
                const api = settings.network === "Mainnet" ? "https://api.koios.rest/api/v0/asset_info" : `https://${settings.network}.koios.rest/api/v0/asset_info`
      
                  const koiosTokenInfo = await fetch(
                    `${api}?_asset_policy=${splitTokenName[0]}&_asset_name=${splitTokenName[1]}`,
                  ).then((res) => res.json());
      
                  
                tokenInfo["fetch_time"] = Date.now()
                if(koiosTokenInfo[0].token_registry_metadata){
                  tokenInfo["name"] = koiosTokenInfo[0].token_registry_metadata.name
                  tokenInfo["image"] = "data:image/jpeg;base64," +koiosTokenInfo[0].token_registry_metadata.logo.replace(/\s/g, ';')}
                else if (koiosTokenInfo[0].minting_tx_metadata){
                  const mintingTxMetadata = koiosTokenInfo[0].minting_tx_metadata["721"] ? koiosTokenInfo[0].minting_tx_metadata["721"] : koiosTokenInfo[0].minting_tx_metadata["20"]
                  if(mintingTxMetadata[splitTokenName[0]] && mintingTxMetadata[splitTokenName[0]][splitTokenName[1]]){
                    tokenInfo["name"] = mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].name ? mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].name : mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].ticker
                    tokenInfo["image"] = (mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].image ? mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].image  :mintingTxMetadata[splitTokenName[0]][splitTokenName[1]].icon )
                  }else if(mintingTxMetadata[splitTokenName[0]] && mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])]){
                    tokenInfo["name"] = mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].name ? mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].name : mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].ticker
                    tokenInfo["image"] = (typeof(mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].image) === "string" ? mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].image : typeof(mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].image) === "object" ?  mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].image.join("") : mintingTxMetadata[splitTokenName[0]][hex2a(splitTokenName[1])].icon )
                  }else if(mintingTxMetadata[`0x${splitTokenName[0]}`] && mintingTxMetadata[`0x${splitTokenName[0]}`][`0x${splitTokenName[1]}`] ){
                    tokenInfo["name"] =  mintingTxMetadata[`0x${splitTokenName[0]}`][`0x${splitTokenName[1]}`].name ? mintingTxMetadata[`0x${splitTokenName[0]}`][`0x${splitTokenName[1]}`].name : mintingTxMetadata[`0x${splitTokenName[0]}`][`0x${splitTokenName[1]}`].ticker
                    tokenInfo["image"] = (typeof(mintingTxMetadata[`0x${splitTokenName[0]}`][`0x${splitTokenName[1]}`].image) === "string" ? mintingTxMetadata[`0x${splitTokenName[0]}`][`0x${splitTokenName[1]}`].image : typeof(mintingTxMetadata[`0x${splitTokenName[0]}`][`0x${splitTokenName[1]}`].image) === "object" ?  mintingTxMetadata[`0x${splitTokenName[0]}`][`0x${splitTokenName[1]}`].image.join("") : mintingTxMetadata[`0x${splitTokenName[0]}`][`0x${splitTokenName[1]}`].icon )
                  }else{
                    tokenInfo["name"] = mintingTxMetadata[splitTokenName[0]].name
                    tokenInfo["image"] =(  mintingTxMetadata[splitTokenName[0]].image ? mintingTxMetadata[splitTokenName[0]].image : mintingTxMetadata[splitTokenName[0]].icon)
                  }
                }else if(koiosTokenInfo[0].asset_name_ascii){
                  tokenInfo["name"] = koiosTokenInfo[0].asset_name_ascii
      
                }else {
                  tokenInfo["name"] = tokenId
                }
      
      
             //   tokenInfo["image"] =  koiosTokenInfo[0].token_registry_metadata ?  "data:image/jpeg;base64," +koiosTokenInfo[0].token_registry_metadata.logo.replace(/\s/g, ';') : koiosTokenInfo[0].minting_tx_metadata ?  koiosTokenInfo[0].minting_tx_metadata["721"].image.replace("ipfs://",ipfsGateWay) : ""
                tokenInfo["decimals"] = koiosTokenInfo[0].token_registry_metadata ?   koiosTokenInfo[0].token_registry_metadata.decimals : null
                tokenInfo["isNft"] =  (koiosTokenInfo[0].total_supply) === "1" 

                tokenInfo["provider"] = "Koios"
                tokenInfo["fingerprint"] = koiosTokenInfo[0].fingerprint
                tokenInfo["image"] = typeof  tokenInfo["image"] === "object" ?  tokenInfo["image"].join('') : tokenInfo["image"]
                tokenInfo["image"] = tokenInfo["image"]?.replace("ipfs/",ipfsGateWay).replace("ipfs://",ipfsGateWay)
                writeToLocalStorage(tokenId,tokenInfo)
                return(tokenInfo)

              }else if ( settings.metadataProvider === "Blockfrost"){
              const BlockfrostTokenInfo = await fetch(
                  `${settings.api.url}/assets/${tokenId}`,
                  { headers: { project_id: settings.api.projectId } },
                ).then((res) => res.json());     
                   tokenInfo["fetch_time"] = Date.now()
      
                  if(BlockfrostTokenInfo.metadata){
                    tokenInfo["name"] = BlockfrostTokenInfo.metadata.name
                    tokenInfo["image"] = "data:image/jpeg;base64," +BlockfrostTokenInfo.metadata.logo.replace(/\s/g, ';')
                    tokenInfo["decimals"] = BlockfrostTokenInfo.metadata.decimals
                  }else if (BlockfrostTokenInfo.onchain_metadata){
                    tokenInfo["name"] = BlockfrostTokenInfo.onchain_metadata.name
                    tokenInfo["image"] = BlockfrostTokenInfo.onchain_metadata.image
                  }else{
                    tokenInfo["name"] = hex2a(BlockfrostTokenInfo.asset_name)
                    
                  }
                  
                    tokenInfo["decimals"] = BlockfrostTokenInfo.metadata ?   BlockfrostTokenInfo.metadata.decimals : null
                    tokenInfo["provider"] = "Blockfrost"
                    tokenInfo["fingerprint"] = BlockfrostTokenInfo.fingerprint
                    tokenInfo["isNft"] =  (BlockfrostTokenInfo.quantity) === "1"
                    tokenInfo["image"] = typeof  tokenInfo["image"] === "object" ?  tokenInfo["image"].join('') : tokenInfo["image"]
                    tokenInfo["image"] = tokenInfo["image"]?.replace("ipfs/",ipfsGateWay).replace("ipfs://",ipfsGateWay)
                writeToLocalStorage(tokenId,tokenInfo)
                return(tokenInfo)
              }
            }catch (error) {
              return {name: hex2a(splitTokenId(tokenId)[1]), image:"", decimals:0, isNft:false, provider: settings.metadataProvider, fingerprint:"", fetch_time:Date.now()}
            }
      
            }
      
      
      export default getTokenInfo