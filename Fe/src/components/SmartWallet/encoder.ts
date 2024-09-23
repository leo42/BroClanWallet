import { Data, Constr } from "@lucid-evolution/lucid";
import { SmartMultisigJson, SmartMultisigDescriptorType } from './types'

export function encode(json: SmartMultisigJson): string {
    return Data.to(innerConstr(json))
    
}

export function decode(data: string): SmartMultisigJson {
    const decoded = Data.from(data);
    return innerDecode(decoded as Constr<any>);
}

function innerDecode(constr: Constr<any>): SmartMultisigJson {
    switch (constr.index) {
        case 0:
            return {
                Type: SmartMultisigDescriptorType.KeyHash,
                keyHash: {
                    name: "", // Name is not encoded, so we use an empty string
                    keyHash: constr.fields[0] as string
                }
            };
        case 1:
            return {
                Type: SmartMultisigDescriptorType.NftHolder,
                nftHolder: {
                    name: constr.fields[1] as string,
                    policy: constr.fields[0] as string
                }
            };
        case 2:
            return {
                Type: SmartMultisigDescriptorType.AtLeast,
                atLeast: {
                    scripts: (constr.fields[0] as Constr<any>[]).map(innerDecode),
                    m: Number(constr.fields[1])
                }
            };
        case 3:
            return {
                Type: SmartMultisigDescriptorType.Before,
                before: {
                    time: Number(constr.fields[0])
                }
            };
        case 4:
            return {
                Type: SmartMultisigDescriptorType.After,
                after: {
                    time: Number(constr.fields[0])
                }
            };
        default:
            throw new Error(`Unknown SmartMultisigDescriptorType: ${constr.index}`);
    }
}

function innerConstr(json: SmartMultisigJson) : Constr<any> {
   const encodeKeyHash = (keyHash: { name: string, keyHash: string }) => {
        return new Constr(0, [keyHash.keyHash])
    }

    const encodeNftHolder = (nftHolder: { name: string, policy: string }) => {
        return new Constr(1, [nftHolder.policy, nftHolder.name])
    }
    
    const encodeAtLeast = (atLeast: { m: number, scripts: SmartMultisigJson[] }) => {
        const encodedScripts = atLeast.scripts.map(script => innerConstr(script));
        console.log(encodedScripts);
        return new Constr(2, [encodedScripts, BigInt(atLeast.m)]);
    }

    const encodeBefore = (before: { time: number }) => {
        return new Constr(3, [BigInt(before.time)])
    }

    const encodeAfter = (after: { time: number }) => {
        return new Constr(4, [BigInt(after.time)])
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


