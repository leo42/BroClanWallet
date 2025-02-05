import { Lucid, Blockfrost  ,Kupmios, Maestro, LucidEvolution, Network ,Provider, MaestroSupportedNetworks} from "@lucid-evolution/lucid";
import {Settings} from "../index"

async function getNewLucidInstance(settings : Settings) : Promise<LucidEvolution>{
    return new Promise(async (resolve, reject) => {
        const provider = getProvider(settings);
        let lucid = await Lucid(
            provider,
            settings.network as Network,
        );  
        resolve(lucid);
          
    });
}

async function changeProvider(lucid : LucidEvolution, settings : Settings){
    return new Promise(async (resolve, reject) => {
        const provider = getProvider(settings);
        await lucid.switchProvider(provider);
        resolve(lucid);
    });
   
}

function getProvider(settings : Settings) : Provider{
    switch(settings.provider){
        case "Blockfrost":
            return new Blockfrost(settings.api.url ?? "", settings.api.projectId ?? "");
        case "Kupmios":
            return new Kupmios(settings.api.kupoUrl ?? "", settings.api.ogmiosUrl ?? "");
        case "MWallet":

            return  new Blockfrost(settings.api.url ?? "", settings.api.projectId ?? "");
        case "Maestro":
            return new Maestro( {network: settings.network as MaestroSupportedNetworks, apiKey : settings.api.apiKey ?? ""});

        default:
            throw new Error('Invalid provider');
    }
}

export { getNewLucidInstance, changeProvider }