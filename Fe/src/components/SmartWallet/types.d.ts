import { Data, TSchema } from "@lucid-evolution/lucid";
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
    After = "After"
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
export type SmartMultisigJson = {
    Type: SmartMultisigDescriptorType.KeyHash;
    keyHash: {
        name: string;
        keyHash: string;
    };
} | {
    Type: SmartMultisigDescriptorType.NftHolder;
    nftHolder: {
        name: string;
        policy: string;
    };
} | {
    Type: SmartMultisigDescriptorType.AtLeast;
    atLeast: {
        m: number;
        scripts: SmartMultisigJson[];
    };
} | {
    Type: SmartMultisigDescriptorType.Before;
    before: {
        time: number;
    };
} | {
    Type: SmartMultisigDescriptorType.After;
    after: {
        time: number;
    };
};
