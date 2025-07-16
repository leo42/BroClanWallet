import { Data, TSchema } from "@evolution-sdk/lucid";
export declare const adminDatumSchema: import("@evolution-sdk/lucid").TObject<{
    mintAmount: import("@evolution-sdk/lucid").TUnsafe<bigint>;
    paymentAddressCredential: import("@evolution-sdk/lucid").TUnsafe<string>;
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
export declare const SmartMultisigDescriptorKeyHashSchema: import("@evolution-sdk/lucid").TObject<{
    keyHash: import("@evolution-sdk/lucid").TUnsafe<string>;
}>;
export type SmartMultisigDescriptorKeyHash = Data.Static<typeof SmartMultisigDescriptorKeyHashSchema>;
export type SmartMultisigDescriptorNftHolder = {
    Type: SmartMultisigDescriptorType.NftHolder;
    policy: PolicyId;
    name: AssetName;
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
