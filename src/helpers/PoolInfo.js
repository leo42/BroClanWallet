async function getPoolInfo(poolId) {
    const settings = JSON.parse(localStorage.getItem("settings"))

    const networkPrefix = settings.network === "Mainnet" ? "" : settings.network.toLowerCase() + "-"
    try{
    const json = await (await fetch(`https://${networkPrefix}js.cexplorer.io/api-static/pool/${poolId}.json`)).json()
    return json.data
    }catch(e){
        return undefined
    }
}
export default getPoolInfo


async function getPoolInfoOld(poolId) {    const settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : {metadataProvider: "koios"}
let json
console.log("getPoolInfo", poolId, settings)
if(settings.metadataProvider === "Koios"){
    const api = settings.network === "Mainnet" ? "https://api.koios.rest/api/v0/pool_info" : `https://${settings.network}.koios.rest/api/v0/pool_info`
    const response = await fetch(
        `${api}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "no-cors": "true"
            },
            body: JSON.stringify({
                "_pool_bech32_ids": [poolId]
            })
        }
    );
    json = await response.json();
    
}else if ( settings.metadataProvider === "Blockfrost"){
    const response = await fetch(
        `${settings.api.url}/pools/${poolId}`,
        {
            method: "GET",
            headers: {
                project_id: settings.api.projectId
            }
        }
    );
    const json = await response.json();
    return json
}
// make request no-cors to get metadata
json[0].metadata = await (await fetch(json[0].meta_url)).json()
//          

json[0].extendedMetadata = await (await fetch( json[0].metadata.extended)).json()
}