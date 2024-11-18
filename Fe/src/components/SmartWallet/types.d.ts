import { Data, KeyHash, TSchema } from "@lucid-evolution/lucid";
export declare const adminDatumSchema: import("@lucid-evolution/lucid").TObject<{
    mintAmount: import("@lucid-evolution/lucid").TUnsafe<bigint>;
    paymentAddressCredential: import("@lucid-evolution/lucid").TUnsafe<string>;
}>;
export type AdminDatum = Data.Static<typeof adminDatumSchema>;
export type VerificationKeyHash = string;
export type PolicyId = string;
export type AssetName = string;
export declare const SmartMultisigDescriptorSchema: TSchema;
export type SmartMultisigDescriptor = Data.Static<typeof SmartMultisigDescriptorSchema>;
export declare enum SmartMultisigDescriptorType {
    KeyHash = "KeyHash",
    NftHolder = "NftHolder",
    AtLeast = "AtLeast",
    Before = "Before",
    After = "After",
    ScriptRef = "ScriptRef"
}
export declare const SmartMultisigDescriptorKeyHashSchema: import("@lucid-evolution/lucid").TObject<{
    keyHash: import("@lucid-evolution/lucid").TUnsafe<string>;
}>;
export type SmartMultisigDescriptorKeyHash = Data.Static<typeof SmartMultisigDescriptorKeyHashSchema>;
export type SmartMultisigDescriptorNftHolder = {
    Type: SmartMultisigDescriptorType.NftHolder;
    policy: PolicyId;
    name: AssetName;
};
export type ScriptRequirement = {
    collateral?: string[];
    inputs?: string[];
    reference_inputs?: string[];
    outputs?: string[];
    mint?: string;
    certificates?: string[];
    withdrawals?: string[];
    validity_range?: ValidityRange;
    signatories?: KeyHash[];
    redeemers?: {
        ScriptPurpose: string;
        Redeemer: string;
    }[];
    datums?: {
        string: string;
    }[];
    script?: string;
};
export type ValidityRange = {
    from?: number;
    to?: number;
};
export type SmartMultisigJson = {
    Type: SmartMultisigDescriptorType.KeyHash;
    keyHash: string;
} | {
    Type: SmartMultisigDescriptorType.NftHolder;
    name: string;
    policy: string;
} | {
    Type: SmartMultisigDescriptorType.AtLeast;
    m: number;
    scripts: SmartMultisigJson[];
} | {
    Type: SmartMultisigDescriptorType.Before;
    time: number;
} | {
    Type: SmartMultisigDescriptorType.After;
    time: number;
} | {
    Type: SmartMultisigDescriptorType.ScriptRef;
    scriptHash: string;
};
