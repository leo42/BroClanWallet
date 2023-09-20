
async function SearchPools(string){
    const settings = JSON.parse(localStorage.getItem("settings"))


  //  if (settings.metadataProvider !== "Koios"){
   //     return []
   // }

    const api = settings.network === "Mainnet" ? "https://api.koios.rest/api/v0/pool_list" : `https://${settings.network}.koios.rest/api/v0/pool_list`
    const responseTicker = await fetch(
        `${api}?ticker=like.${string}*`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })

    const responseId = await fetch(
        `${api}?pool_id_bech32=like.${string}*`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })

    const data = await responseTicker.json()
    
    const data2 = await responseId.json()
    //return sublist of data that matches string size 10
        
    return (data.length !== 0 ? data : data2).slice(0,10)


    }


export default SearchPools