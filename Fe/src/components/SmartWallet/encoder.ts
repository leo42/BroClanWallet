import { Data, Constr } from "@lucid-evolution/lucid";
import { SmartMultisigJson, SmartMultisigDescriptorType } from './types'

export function encode(json: SmartMultisigJson): string {
    const encodeKeyHash = (keyHash: { name: string, keyHash: string }) => {
        return Data.to(new Constr(0, [ keyHash.keyHash]))
    }

    const encodeNftHolder = (nftHolder: { name: string, policy: string }) => {
        return Data.to(new Constr(1, [nftHolder.name, nftHolder.policy]))
    }

    const encodeAtLeast = (atLeast: { m: number, scripts: SmartMultisigJson[] }) => {
        const encodedScripts = atLeast.scripts.map(script => encode(script))
        return Data.to<Constr<number | string[]>>(new Constr(2, [atLeast.m, encodedScripts]))
    }

    const encodeBefore = (before: { time: number }) => {
        return Data.to<Constr<number>>(new Constr(3, [before.time]))
    }

    const encodeAfter = (after: { time: number }) => {
        return Data.to<Constr<number>>(new Constr(4, [after.time]))
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


