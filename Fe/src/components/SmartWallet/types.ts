import {  Data } from "@lucid-evolution/lucid";


// Define the Credential type

// Update the adminDatumSchema to use the Credential type
export const adminDatumSchema = Data.Object({
  mintAmount: Data.Integer(),
  paymentAddressCredential: Data.Bytes(),
});

export type AdminDatum = Data.Static<typeof adminDatumSchema>;

  