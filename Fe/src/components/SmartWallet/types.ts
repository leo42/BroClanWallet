import {  Data, TSchema } from "@lucid-evolution/lucid";


export const adminDatumSchema = Data.Object({
  mintAmount: Data.Integer({minimum: 0}),
  paymentAddressCredential: Data.Bytes({minLength: 28, maxLength: 28}),
});

export type AdminDatum = Data.Static<typeof adminDatumSchema>;

export type VerificationKeyHash = string;

export type PolicyId = string;

export type AssetName = string;


const SmartMultisigDescriptorSchemaPlaceholder: TSchema = Data.Enum([]);

export const SmartMultisigDescriptorSchema: TSchema = Data.Enum([
  Data.Object({ Type: Data.Literal("KeyHash"), keyHash: Data.Bytes({minLength: 28, maxLength: 28}) }),
  Data.Object({ Type: Data.Literal("NftHolder"), policy: Data.Bytes({minLength: 28, maxLength: 28}), name: Data.Bytes({minLength: 0, maxLength: 28}) }),
  Data.Object({ Type: Data.Literal("AtLeast"), scripts: Data.Array(SmartMultisigDescriptorSchemaPlaceholder), m: Data.Integer({minimum: 0}) }),
  Data.Object({ Type: Data.Literal("Before"), time: Data.Integer({minimum: 0}) }),
  Data.Object({ Type: Data.Literal("After"), time: Data.Integer({minimum: 0}) })
]);

// Update the placeholder with the actual schema
(SmartMultisigDescriptorSchemaPlaceholder as any).items = SmartMultisigDescriptorSchema.items;

export type SmartMultisigDescriptor = Data.Static<typeof SmartMultisigDescriptorSchema>;

export enum SmartMultisigDescriptorType {
  KeyHash = "KeyHash",
  NftHolder = "NftHolder",
  AtLeast = "AtLeast",
  Before = "Before",
  After = "After",
  ScriptRef = "ScriptRef"
}

export const SmartMultisigDescriptorKeyHashSchema = Data.Object({
  keyHash: Data.Bytes()
})

export type SmartMultisigDescriptorKeyHash = Data.Static<typeof SmartMultisigDescriptorKeyHashSchema>;

export type SmartMultisigDescriptorNftHolder = {
  Type: SmartMultisigDescriptorType.NftHolder;
  policy: PolicyId;
  name: AssetName;
}

export type SmartMultisigJson = 
  | { Type: SmartMultisigDescriptorType.KeyHash,  keyHash: string  }
  | { Type: SmartMultisigDescriptorType.NftHolder,  name: string, policy: string  }
  | { Type: SmartMultisigDescriptorType.AtLeast,  m: number, scripts: SmartMultisigJson[]  }
  | { Type: SmartMultisigDescriptorType.Before,  time: number  }
  | { Type: SmartMultisigDescriptorType.After,  time: number  }
  | { Type: SmartMultisigDescriptorType.ScriptRef, scriptHash: string }
