async function getPoolInfo(poolId) {
    const settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : {metadataProvider: "koios"}

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
        const json = await response.json();
        return json
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

}

export default getPoolInfo