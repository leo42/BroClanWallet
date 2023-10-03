async function getTransactionHistory(address, settings, page=0 , limit = 10){
    if( settings.metadataProvider === "None"){
        return []
    }

    if ( settings.metadataProvider === "Koios"){
        const api = settings.network === "Mainnet" ? "https://api.koios.rest/api/v0/address_txs" : `https://${settings.network}.koios.rest/api/v0/address_txs`
        const response = await fetch(
            `${api}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "no-cors": "true"
                },
                                
                body: JSON.stringify({
                    "_addresses": [address]
                })
            }
        );
        // return the first 10 transactions if page is not specified
        // sort by block height

        const json = await response.json();
        if (json.error) 
            return []

        json.sort((a,b) => b.block_height - a.block_height)
        return  await getTransactionDetails(json.slice(page*limit,(page+1)*limit), settings)
    }else if ( settings.metadataProvider === "Blockfrost"){
        const api = settings.api.url
        const response = await fetch(
            `${api}/addresses/${address}/transactions`,
            {
                method: "GET",
                headers: {
                    project_id: settings.api.projectId
                }
            }
        );
        const json = await response.json();
        // return the first 10 transactions if page is not specified 
        // sort by block height
    if (json.error) 
        return []
    json.sort((a,b) => b.block_height - a.block_height)
    return await getTransactionDetails(json.slice(page*limit,(page+1)*limit), settings)
    }


}
    
async function getTransactionDetails(transactionIds, settings){
    
    let transactionInfo =  {...JSON.parse(localStorage.getItem('transactionInfo'))};
     

    let fullTransactionsInfo = transactionIds.map( async (transactionId) => {
        if (transactionInfo[transactionId.tx_hash] && transactionInfo[transactionId.tx_hash].provider === settings.metadataProvider ){
            return (transactionInfo[transactionId.tx_hash])
        }else{
             
            if ( settings.metadataProvider === "Koios"){
                const api = settings.network === "Mainnet" ? "https://api.koios.rest/api/v0/tx_utxos" : `https://${settings.network}.koios.rest/api/v0/tx_utxos`
                const response = await fetch(
                    `${api}`,
                    {
                        
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "no-cors": "true"
                            },
                                            
                            body: JSON.stringify({
                                "_tx_hashes": [transactionId.tx_hash]
                            })
                        
                    }
                );
                let fullTransactionInfo =  {...transactionId};
                fullTransactionInfo.utxos = (await response.json())[0]
                fullTransactionInfo.utxos.inputs = fullTransactionInfo.utxos.inputs.map(input => {
                    return {
                        address: input.payment_addr.bech32,
                        amount: koiosUtxosToUtxos(  input.value ,input.asset_list ),
                        tx_hash: input.tx_hash,
                        tx_index: input.tx_index,
                        tx_output_index: input.tx_output_index
                    }
                })
                fullTransactionInfo.utxos.outputs = fullTransactionInfo.utxos.outputs.map(output => {
                    return {
                        address: output.payment_addr.bech32,
                        amount: koiosUtxosToUtxos(  output.value ,output.asset_list ),
                        tx_hash: output.tx_hash,
                        tx_index: output.tx_index,
                        tx_output_index: output.tx_output_index
                    }
                })
                transactionInfo[transactionId.tx_hash] = fullTransactionInfo
                transactionInfo[transactionId.tx_hash].fetch_time = Date.now()
                transactionInfo[transactionId.tx_hash].provider = "Koios"
                localStorage.setItem('transactionInfo', JSON.stringify(transactionInfo));

                return transactionInfo[transactionId.tx_hash]
            }else if ( settings.metadataProvider === "Blockfrost"){

            const api = settings.api.url
            const response = await fetch(
                `${api}/txs/${transactionId.tx_hash}/utxos`,
                {
                    method: "GET",
                    headers: {
                        project_id: settings.api.projectId
                    }
                }
            );
            let fullTransactionInfo =  {...transactionId};
            fullTransactionInfo.utxos = await response.json();
            transactionInfo[transactionId.tx_hash] = fullTransactionInfo
            transactionInfo[transactionId.tx_hash].fetch_time = Date.now()
            transactionInfo[transactionId.tx_hash].provider = "Blockfrost"
            localStorage.setItem('transactionInfo', JSON.stringify(transactionInfo));
            return transactionInfo[transactionId.tx_hash]
        }
        }
    })

    fullTransactionsInfo = await Promise.all(fullTransactionsInfo)


    return fullTransactionsInfo
}

function koiosUtxosToUtxos(lovelace,asset_list){

    let utxos = []
    utxos.push({
        unit: "lovelace",
        quantity: lovelace
    })
    asset_list.forEach(asset => {
        utxos.push({
            unit: asset.policy_id+asset.asset_name,
            quantity: asset.quantity
        })
    })
    return utxos
    

}

      
      
      export default getTransactionHistory