import { Data, Constr } from "@evolution-sdk/lucid";
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
                keyHash: constr.fields[0] as string
            };
        case 1:
            return {
                Type: SmartMultisigDescriptorType.NftHolder,
                name: constr.fields[1] as string,
                policy: constr.fields[0] as string
            };
        case 2:
            return {
                Type: SmartMultisigDescriptorType.AtLeast,
                m: Number(constr.fields[1]),
                scripts: (constr.fields[0] as Constr<any>[]).map(innerDecode)
            };
        case 3:
            return {
                Type: SmartMultisigDescriptorType.Before,
                time: Number(constr.fields[0])
            };
        case 4:
            return {
                Type: SmartMultisigDescriptorType.After,
                time: Number(constr.fields[0])
            };
        case 5:
            return {
                Type: SmartMultisigDescriptorType.ScriptRef,
                scriptHash: constr.fields[0] as string
            };
        default:
            throw new Error(`Unknown SmartMultisigDescriptorType: ${constr.index}`);
    }
}

function innerConstr(json: SmartMultisigJson) : Constr<any> {
   const encodeKeyHash = (  keyHash: string ) => {
        return new Constr(0, [keyHash])
    }

    const encodeNftHolder = (name: string, policy: string ) => {
        return new Constr(1, [policy, name])
    }
    
    const encodeAtLeast = ( m: number, scripts: SmartMultisigJson[] ) => {
        const encodedScripts = scripts.map(script => innerConstr(script));
        console.log(encodedScripts);
        return new Constr(2, [encodedScripts, BigInt(m)]);
    }

    const encodeBefore = ( time: number ) => {
        return new Constr(3, [BigInt(time)])
    }

    const encodeAfter = ( time: number ) => {
        return new Constr(4, [BigInt(time)])
    }

    const encodeScriptRef = ( scriptHash: string ) => {
        return new Constr(5, [scriptHash])
    }

    switch (json.Type) {
        case SmartMultisigDescriptorType.KeyHash:
            return encodeKeyHash(json.keyHash)
        case SmartMultisigDescriptorType.NftHolder:
            return encodeNftHolder(json.name, json.policy)
        case SmartMultisigDescriptorType.AtLeast:
            return encodeAtLeast(json.m, json.scripts)
        case SmartMultisigDescriptorType.Before:
            return encodeBefore(json.time)
        case SmartMultisigDescriptorType.After:
            return encodeAfter(json.time)
        case SmartMultisigDescriptorType.ScriptRef:
            return encodeScriptRef(json.scriptHash)
        default:
            throw new Error('Unknown SmartMultisigDescriptorType')
    }
}


