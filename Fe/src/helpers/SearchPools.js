
async function SearchPools(string){
    const settings = JSON.parse(localStorage.getItem("settings"))


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
                "authorization" : " Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyIjoic3Rha2UxdTk4cGp2eDduYTRmZDRoZzJtbTk1c2RycTZ6czk5NHduaGR2bGVtemR3ajRuOWNqMnd1bmEiLCJleHAiOjE3MzQ3MDM1MzAsInRpZXIiOjEsInByb2pJRCI6Im5SNXhkbWJrQlRUR3ZQN3gifQ.VAPc1HyKwiClRB0E9Sn5tjc2Im2g1p1hNSp1mxdbPHE",
            }
        })

    const responseId = await fetch(
        `${api}?pool_id_bech32=like.${string}*`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization" : " Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyIjoic3Rha2UxdTk4cGp2eDduYTRmZDRoZzJtbTk1c2RycTZ6czk5NHduaGR2bGVtemR3ajRuOWNqMnd1bmEiLCJleHAiOjE3MzQ3MDM1MzAsInRpZXIiOjEsInByb2pJRCI6Im5SNXhkbWJrQlRUR3ZQN3gifQ.VAPc1HyKwiClRB0E9Sn5tjc2Im2g1p1hNSp1mxdbPHE",
            }
        })

    const data = await responseTicker.json()
    
    const data2 = await responseId.json()
    //return sublist of data that matches string size 10
        
    return (data.length !== 0 ? data : data2).slice(0,10).map( pool => pool.pool_id_bech32)
    } catch(e){
        console.log(e)
        return [string]   
    }

    }


export default SearchPools