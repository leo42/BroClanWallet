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

