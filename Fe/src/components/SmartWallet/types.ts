import {  Data } from "@lucid-evolution/lucid";


export const adminDatumSchema = Data.Object({
  mintAmount: Data.Integer({minimum: 0}),
  paymentAddressCredential: Data.Bytes({minLength: 28, maxLength: 28}),
});

export type AdminDatum = Data.Static<typeof adminDatumSchema>;

  