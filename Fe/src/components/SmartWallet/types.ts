import {  Data } from "@lucid-evolution/lucid";


export const adminDatumSchema = Data.Object({
  mintAmount: Data.Integer(),
  paymentAddressCredential: Data.Bytes(),
});

export type AdminDatum = Data.Static<typeof adminDatumSchema>;

  