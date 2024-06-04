import { Lucid  } from "lucid-cardano";

async function getTransactionHistory(address, settings, page=0 , limit = 10){
    console.log("getTransactionHistory", address, settings, page, limit)
    if( settings.metadataProvider === "None" ){
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

        if (json.error) 
            return []
        json.sort((a,b) => b.block_height - a.block_height)
        return await getTransactionDetails(json.slice(page*limit,(page+1)*limit), settings, address)
    }else if(settings.metadataProvider === "Maestro")
    {
        const MaestroUrl = `https://${settings.network}.gomaestro-api.org`
        const MaestroTxHistory = await fetch(
            `${MaestroUrl}/v1/addresses/${address}/transactions?count=${limit}&order=desc` + (page > 0 ? `&cursor=${localStorage.getItem('next_cursor')}` : "" ),
            { headers: { 
              'Accept': 'application/json', 
              'api-key': settings.api.apiKey,
            } },
          ).then((res) => res.json());   
        if (MaestroTxHistory.error) 
            return []
          MaestroTxHistory.data.sort((a,b) => b.slot - a.slot)
         //write next_cursor to local storage 
         localStorage.setItem('next_cursor', MaestroTxHistory.next_cursor);

        

        return await getTransactionDetails(MaestroTxHistory.data, settings)
    }


}
    
async function getTransactionDetails(transactionIds, settings, address){
    let transactionInfo =  {...JSON.parse(localStorage.getItem('transactionInfo'))};
    const lucid =  await Lucid.new(
        null,
        settings.network
      );            
      

    let fullTransactionsInfo = transactionIds.map( async (transactionId) => {
        if (transactionInfo[transactionId.tx_hash] && transactionInfo[transactionId.tx_hash].provider === settings.metadataProvider ){
           return (transactionInfo[transactionId.tx_hash])
        }
        else
        {
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
            let withdraw 
            try{
                const withdrawResponce = await fetch(
                    `${api}/txs/${transactionId.tx_hash}/withdrawals`,
                    {

                        method: "GET",
                        headers: {
                            project_id: settings.api.projectId
                        }
                    }
                )
                withdraw = await withdrawResponce.json()
            }catch(e){
                console.log(e)
                withdraw = []
            }
            let fullTransactionInfo =  {...transactionId};
            fullTransactionInfo.utxos = await response.json();
            transactionInfo[transactionId.tx_hash] = fullTransactionInfo
            transactionInfo[transactionId.tx_hash].fetch_time = Date.now()
            transactionInfo[transactionId.tx_hash].withdrawals = {}
            transactionInfo[transactionId.tx_hash].withdrawals.amount = 0
            withdraw.forEach( w =>  {
                     if(lucid.utils.getAddressDetails(address).stakeCredential.hash === lucid.utils.getAddressDetails(w.address).stakeCredential.hash) { 
                        transactionInfo[transactionId.tx_hash].withdrawals.amount += Number(w.amount)}
                     })  
            
            // transactionInfo[transactionId.tx_hash].withdrawals = withdrawResponce.ok ? await withdrawResponce.json() : null
            transactionInfo[transactionId.tx_hash].provider = "Blockfrost"
            localStorage.setItem('transactionInfo', JSON.stringify(transactionInfo));
            return transactionInfo[transactionId.tx_hash]
        }else if (settings.metadataProvider === "Maestro"){

            const MaestroUrl = `https://${settings.network}.gomaestro-api.org`
            const MaestroTx = await fetch(
                `${MaestroUrl}/v1/transactions/${transactionId.tx_hash}`,
                { headers: { 
                  'Accept': 'application/json', 
                  'api-key': settings.api.apiKey,
                } },
              ).then((res) => res.json());   

       
              
            let fullTransactionInfo =  {...transactionId};
            fullTransactionInfo.utxos = {}
            fullTransactionInfo.utxos.inputs = MaestroTx.data.inputs.map(input =>  maestroUtxoToUtxo(input) )
            fullTransactionInfo.utxos.outputs = MaestroTx.data.outputs.map(input =>  maestroUtxoToUtxo(input) )
            transactionInfo[transactionId.tx_hash] = fullTransactionInfo
            transactionInfo[transactionId.tx_hash].fetch_time = Date.now()
            transactionInfo[transactionId.tx_hash].block_time =  lucid.utils.slotToUnixTime(transactionInfo[transactionId.tx_hash].slot);
            transactionInfo[transactionId.tx_hash].provider = "Maestro"
            transactionInfo[transactionId.tx_hash].withdrawals = MaestroTx.data.withdrawals[0];

            localStorage.setItem('transactionInfo', JSON.stringify(transactionInfo));

            return transactionInfo[transactionId.tx_hash]

        }
        }
    })

    fullTransactionsInfo = await Promise.all(fullTransactionsInfo)


    return fullTransactionsInfo
}

function maestroUtxoToUtxo(utxo){
    return {
        address: utxo.address,
        amount: utxo.assets.map(asset => ({ "unit": asset.unit, "quantity" : Math.abs(asset.amount) })),
        tx_hash: utxo.tx_hash,
        tx_index: utxo.tx_index,
        tx_output_index: utxo.tx_output_index
    }

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