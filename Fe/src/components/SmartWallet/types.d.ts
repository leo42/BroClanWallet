import { Data } from "lucid-cardano";
declare const CredentialSchema: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TUnion<(import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TObject<{
    VerificationKey: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TUnsafe<string>;
}> | import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TObject<{
    Script: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TUnsafe<string>;
}>)[]>;
export type Credential = Data.Static<typeof CredentialSchema>;
export declare const Credential: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TUnion<(import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TObject<{
    VerificationKey: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TUnsafe<string>;
}> | import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TObject<{
    Script: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TUnsafe<string>;
}>)[]>;
export declare const adminDatumSchema: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TObject<{
    mintAmount: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TUnsafe<bigint>;
    paymentAddressCredential: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TUnion<(import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TObject<{
        VerificationKey: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TUnsafe<string>;
    }> | import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TObject<{
        Script: import("lucid-cardano/esm/deps/deno.land/x/typebox@0.25.13/src/typebox").TUnsafe<string>;
    }>)[]>;
}>;
export type AdminDatum = Data.Static<typeof adminDatumSchema>;
export {};
