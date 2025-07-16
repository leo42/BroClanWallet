import { UTxO } from "@evolution-sdk/lucid";
import React from "react";
declare function transformAmount(amount: any): {
    [key: string]: bigint;
};
declare function TransactionDetails(utxos: {
    inputUtxos: UTxO[];
    collateralUtxos: UTxO[];
    referenceInputsUtxos: UTxO[];
}, isAddressMine: (address: string) => boolean, transaction: {
    mint: any;
    outputs: any[];
    fee: number;
    ttl: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
    network_id: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
    certs: any[];
    withdrawals: Map<string, number>;
    update: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
    auxiliary_data_hash: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
    validity_interval_start: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
    script_data_hash: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
    collateral_return: any;
    total_collateral: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
    invalid_before: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
    invalid_hereafter: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
    required_scripts: any[];
    reference_inputs: any;
    required_signers: any[];
}): import("react/jsx-runtime").JSX.Element;
export { TransactionDetails, transformAmount };
