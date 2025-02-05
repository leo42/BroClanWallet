async function getPoolInfo(poolId: string) {
    const settings = JSON.parse(localStorage.getItem("settings") || "{}")


    const networkPrefix = settings.network === "Mainnet" ? "" : settings.network.toLowerCase() + "-"
    try{
    const json = await (await fetch(`https://${networkPrefix}js.cexplorer.io/api-static/pool/${poolId}.json`)).json()
    return json.data
    }catch(e){
        return undefined
    }
}
export default getPoolInfo
