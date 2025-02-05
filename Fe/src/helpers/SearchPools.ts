
async function SearchPools(string: string){
    const settings = JSON.parse(localStorage.getItem("settings") || "{}")


  //  if (settings.metadataProvider !== "Koios"){
   //     return []
   // }

    const api = settings.network === "Mainnet" ? "https://api.koios.rest/api/v1/pool_list" : `https://${settings.network}.koios.rest/api/v1/pool_list`
    try{
    const responseTicker = await fetch(
        `${api}?ticker=like.${string}*`,
        {
            method: "GET",
            headers: {
                "accept": "application/json",
                "authorization" : " Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyIjoic3Rha2UxdXkwNTA1NWRqMDczMHM4dXF0YzI2aDJ6N2hrcWswa2hsanhwd2p2ZWtxNzdjMnN1a3dhMnoiLCJleHAiOjE3Njc0NDQ5NjMsInRpZXIiOjEsInByb2pJRCI6IjZpVWJkMmJlVmx0WTVqdk0ifQ.LIwo8YGnK4sMst2PH_jfqZPq017LCKhz-Ah8B057MNQ",
            }
        })

    const responseId = await fetch(
        `${api}?pool_id_bech32=like.${string}*`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization" : " Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyIjoic3Rha2UxdXkwNTA1NWRqMDczMHM4dXF0YzI2aDJ6N2hrcWswa2hsanhwd2p2ZWtxNzdjMnN1a3dhMnoiLCJleHAiOjE3Njc0NDQ5NjMsInRpZXIiOjEsInByb2pJRCI6IjZpVWJkMmJlVmx0WTVqdk0ifQ.LIwo8YGnK4sMst2PH_jfqZPq017LCKhz-Ah8B057MNQ",
            }
        })

    const data = await responseTicker.json()
    
    const data2 = await responseId.json()
    //return sublist of data that matches string size 10
        
    return (data.length !== 0 ? data : data2).slice(0,10).map( (pool: any) => pool.pool_id_bech32)
    } catch(e){
        console.log(e)
        return [string]   
    }

    }


export default SearchPools