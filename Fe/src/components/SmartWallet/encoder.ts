import { Data, Constr } from "@lucid-evolution/lucid";
import { SmartMultisigJson, SmartMultisigDescriptorType } from './types'

export function encode(json: SmartMultisigJson): string {
    return Data.to(innerConstr(json))
    
}

function innerConstr(json: SmartMultisigJson) : Constr<any> {
   const encodeKeyHash = (keyHash: { name: string, keyHash: string }) => {
        return new Constr(0, [keyHash.keyHash])
    }

    const encodeNftHolder = (nftHolder: { name: string, policy: string }) => {
        return new Constr(1, [nftHolder.name, nftHolder.policy])
    }
    
    const encodeAtLeast = (atLeast: { m: number, scripts: SmartMultisigJson[] }) => {
        const encodedScripts = atLeast.scripts.map(script => innerConstr(script));
        console.log(encodedScripts);
        return new Constr(2, [encodedScripts, BigInt(atLeast.m)]);
    }

    const encodeBefore = (before: { time: number }) => {
        return new Constr(3, [before.time])
    }

    const encodeAfter = (after: { time: number }) => {
        return new Constr(4, [after.time])
    }

    switch (json.Type) {
        case SmartMultisigDescriptorType.KeyHash:
            return encodeKeyHash(json.keyHash)
        case SmartMultisigDescriptorType.NftHolder:
            return encodeNftHolder(json.nftHolder)
        case SmartMultisigDescriptorType.AtLeast:
            return encodeAtLeast(json.atLeast)
        case SmartMultisigDescriptorType.Before:
            return encodeBefore(json.before)
        case SmartMultisigDescriptorType.After:
            return encodeAfter(json.after)
        default:
            throw new Error('Unknown SmartMultisigDescriptorType')
    }
}


