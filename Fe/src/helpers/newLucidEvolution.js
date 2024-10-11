import { Lucid, Blockfrost  ,Kupmios, Maestro} from "@lucid-evolution/lucid";


async function getNewLucidInstance(settings){
    return new Promise(async (resolve, reject) => {
        const provider = getProvider(settings);
        let lucid = await Lucid(
            provider,
            settings.network,
        );  
        resolve(lucid);
          
    });
}

async function changeProvider(lucid, settings){
    return new Promise(async (resolve, reject) => {
        const provider = getProvider(settings);
        await lucid.switchProvider(provider);
        resolve(lucid);
    });
   
}

function getProvider(settings){
    switch(settings.provider){
        case "Blockfrost":
            return new Blockfrost(settings.api.url, settings.api.projectId);
        case "Kupmios":
            return new Kupmios(settings.api.kupoUrl, settings.api.ogmiosUrl);
        case "MWallet":
            return  new Blockfrost(settings.api.url, settings.api.projectId);
        case "Maestro":
            return new Maestro( {network: settings.network, apiKey : settings.api.apiKey});
        default:
            throw new Error('Invalid provider');
    }
}

export { getNewLucidInstance, changeProvider }