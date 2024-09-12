import {  Data } from "lucid-cardano";


// Define the Credential type
const CredentialSchema = Data.Enum([
  Data.Object({
    VerificationKey: Data.Bytes(),
  }),
  Data.Object({
    Script: Data.Bytes(),
  }),
]);

export type Credential = Data.Static<typeof CredentialSchema>;
export const Credential = CredentialSchema;

// Update the adminDatumSchema to use the Credential type
export const adminDatumSchema = Data.Object({
  mintAmount: Data.Integer(),
  paymentAddressCredential: Credential,
});

export type AdminDatum = Data.Static<typeof adminDatumSchema>;

  