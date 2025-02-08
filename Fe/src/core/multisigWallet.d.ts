import * as LucidEvolution from "@lucid-evolution/lucid";
import { Credential } from "@lucid-evolution/lucid";
import { Delegation } from "@lucid-evolution/core-types";
import WalletInterface from "../core/WalletInterface";
declare class MultisigWallet implements WalletInterface {
    signersNames: any[];
    wallet_script: any;
    wallet_address: string;
    name: string;
    delegation: any;
    defaultAddress: string;
    txDetails: any;
    pendingTxs: {
        tx: LucidEvolution.TxSignBuilder;
        signatures: {
            [key: string]: string;
        };
    }[];
    addressNames: any;
    utxos: LucidEvolution.UTxO[];
    lucid: LucidEvolution.LucidEvolution | undefined;
    lucidNativeScript: LucidEvolution.CML.NativeScript | undefined;
    collateralDonor: any;
    collateralUtxo: any;
    collateralAddress: any;
    constructor(wallet_json: any, name: any);
    extractSignerNames(json: any): void;
    keyHashToSighnerName(keyHash: string): string;
    initialize(settings: any): Promise<void>;
    changeSettings(settings: any): Promise<void>;
    removePendingTx(index: number): void;
    getJson(): any;
    getScript(): LucidEvolution.CML.NativeScript | undefined;
    getCompletedTx(txId: string): {
        tx: LucidEvolution.TxSignBuilder;
        signatures: {
            [key: string]: string;
        };
    } | undefined;
    getCBOR(): string;
    getName(): string;
    getCredential(): Credential;
    getDelegation(): Promise<Delegation>;
    getBalance(address?: string): number;
    getBalanceFull(address?: string): any;
    substructBalanceFull(assets: any, address?: string): any;
    setPendingTxs(pendingTxs: any): void;
    getAddress(stakingAddress?: string): string;
    getStakingAddress(): string;
    getSigners(): any[];
    getFundedAddress(): string[];
    getUtxos(): any[];
    getutxo(utxoHash: string): LucidEvolution.UTxO | undefined;
    getUtxosByOutRef(OutputRef: any): Promise<LucidEvolution.UTxO[]>;
    loadUtxos(): Promise<boolean>;
    compareUtxos(a: any, b: any): boolean;
    checkTransactions(): Promise<void>;
    checkTransaction(tx: LucidEvolution.TxSignBuilder): Promise<boolean>;
    getPendingTxs(): {
        tx: LucidEvolution.TxSignBuilder;
        signatures: {
            [key: string]: string;
        };
    }[];
    getTransactionType(txDetails: any): string;
    decodeTransaction(tx: string): any;
    getPendingTxDetails(index: number): any;
    checkSigners(signers: string[]): any;
    createTemplateTx(signers: string[]): Promise<LucidEvolution.TxBuilder>;
    createTx(recipients: {
        amount: Record<string, bigint>;
        address: string;
    }[], signers: string[], sendFrom?: string, sendAll?: number | null, withdraw?: boolean): Promise<string>;
    txFromCBOR(cbor: string): LucidEvolution.TxSignBuilder;
    importTransaction(transaction: string): Promise<string | {
        error: string;
        tx: string;
    }>;
    setCollateralDonor(paymentKeyHash: any): Promise<void>;
    loadCollateralUtxos(): Promise<void>;
    getCollateral(value?: number): any;
    getCollateralDonor(): any;
    getCollateralUtxos(value: number | undefined): Promise<any>;
    getCollateralAddress(): any;
    getCollateralUtxo(value: number | undefined): Promise<any>;
    loadTransaction(transaction: any): Promise<void>;
    createStakeUnregistrationTx(signers: string[]): Promise<string>;
    getSignerName(keyHash: any): any;
    createDelegationTx(pool: string, dRepId: string, signers: string[]): Promise<string>;
    isAddressMine(address: string): boolean;
    isAddressValid(address: string): boolean;
    isAddressScript(address: string): boolean;
    decodeSignature(signature: string): {
        signature: string;
        signer: string | undefined;
        witness: LucidEvolution.CML.TransactionWitnessSet;
    };
    hexToBytes(hex: string): Uint8Array;
    addSignature(signature: string): {
        tx: LucidEvolution.TxSignBuilder;
        signatures: {
            [key: string]: string;
        };
    } | undefined;
    getSignature(index: number, keyHash: string): string;
    submitTx(tx: any): Promise<any>;
    submitTransaction(index: number): Promise<boolean>;
    setDefaultSigners(signers: any): void;
    updateSignerName(keyHash: string, name: string): void;
    resetDefaultSigners(): void;
    setScript(wallet_script: any): void;
    setDefaultAddress(address: string): void;
    setAddressNames(names: any): void;
    setName(name: string): void;
    changeAddressName(address: string, name: string): void;
    getNetworkId(): 1 | 0;
    getDefaultAddress(): string;
    getDefaultSigners(): string[];
    defaultSignersValid(): boolean;
    getScriptRequirements(): {
        code: number;
        value: string;
    }[] | {
        error: string;
    };
    getAddressNames(): any;
    getAddressName(address: string): any;
}
export default MultisigWallet;
