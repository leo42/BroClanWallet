async function getTokenInfo(tokenId){
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

        let tokenMap =  {...JSON.parse(localStorage.getItem('tokenInfo'))};
        console.log(tokenMap[tokenId])
        if ( tokenId in tokenMap){
            return (tokenMap[tokenId])
        }else{
            const tokenInfo = await fetch(
                `https://cardano-preprod.blockfrost.io/api/v0/assets/${tokenId}`,
                { headers: { project_id: "preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp" } },
              ).then((res) => res.json());     
              
              writeToLocalStorage(tokenId,tokenInfo)
              return(tokenInfo)
            

              
        };
    }

   

export default getTokenInfo