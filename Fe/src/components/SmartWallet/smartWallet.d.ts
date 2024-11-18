import { TxSignBuilder, CBORHex, Validator, Assets, UTxO, Delegation, TxBuilder, Script } from "@lucid-evolution/lucid";
import { Settings } from "../../types/app";
import { SmartMultisigJson } from "./types";
import { TransactionWitnessSet } from '@anastasia-labs/cardano-multiplatform-lib-browser';
interface Recipient {
    address: string;
    amount: Assets;
}
type extraRequirements = {
    inputs?: UTxO[];
    refInputs?: UTxO[];
    before?: number;
    after?: number;
};
declare class SmartWallet {
    private lucid;
    private script;
    private name;
    private utxos;
    private configUtxo;
    private scriptUtxo;
    private colateralUtxo;
    private nftUtxos;
    private delegation;
    private pendingTxs;
    private signerNames;
    private defaultAddress;
    private addressNames;
    private config;
    private id;
    private settings;
    private collateralDonor;
    constructor(id: string, settings: Settings);
    initializeLucid(): Promise<void>;
    changeSettings(settings: any): Promise<void>;
    getName(): string;
    setName(name: string): void;
    removePendingTx(tx: number): void;
    getPendingTxs(): {
        tx: CBORHex;
        signatures: Record<string, string>;
    }[];
    addPendingTx(tx: {
        tx: CBORHex;
        signatures: Record<string, string>;
    }): void;
    getAddress(stakingAddress?: string): string;
    getStakingAddress(): string;
    getEnterpriseAddress(): string;
    getDelegation(): Promise<Delegation>;
    getFundedAddress(): string[];
    getBalance(address?: string): number;
    getContract(): Validator;
    getBalanceFull(address?: string): Assets;
    getConfigUtxo(): Promise<UTxO>;
    getConfig(): SmartMultisigJson;
    loadConfig(): Promise<undefined>;
    getCollateralDonor(): string;
    defaultSignersValid(): boolean;
    loadSigners(config: SmartMultisigJson): Promise<{
        nftUtxos: UTxO[];
        signers: {
            hash: string;
            isDefault: boolean;
        }[];
    }>;
    loadUtxos(): Promise<boolean>;
    private compareUtxos;
    checkTransactions(): Promise<void>;
    checkTransaction(tx: string): Promise<boolean>;
    mergeAssets(assets1: Assets, assets2: Assets): Assets;
    createTx(recipients: Recipient[], signers: string[], sendFrom?: string, sendAll?: number | null, withdraw?: boolean): Promise<TxSignBuilder>;
    getDefaultSigners(): string[];
    setCollateralDonor(paymentKeyHash: string): Promise<void>;
    loadCollateralUtxos(): Promise<void>;
    setDefaultSigners(signers: string[]): void;
    coinSelection(value: Assets, utxos: UTxO[]): Promise<UTxO[]>;
    createUpdateTx(signers: string[], newConfig: SmartMultisigJson): Promise<TxSignBuilder>;
    private cleanConfig;
    private isValidKeyHash;
    getColateralUtxo(signers?: string[]): Promise<UTxO>;
    pullCollateralUtxo(collateralProvider: string): Promise<UTxO>;
    createTemplateTx(signers: string[], returnAddress?: string): Promise<TxBuilder>;
    createStakeUnregistrationTx(signers: string[]): Promise<TxSignBuilder>;
    createDelegationTx(pool: string, dRepId: string, signers: string[]): Promise<TxSignBuilder>;
    isAddressMine(address: string): boolean;
    isAddressValid(address: string): boolean;
    isAddressScript(address: string): boolean;
    submitTransaction(index: number): Promise<Boolean>;
    getId(): string;
    checkSigners(signers: string[]): extraRequirements | false;
    getSigners(): {
        hash: string;
        isDefault: boolean;
    }[];
    decodeSignature(signature: string): {
        signature: string;
        signer: string;
        witness: TransactionWitnessSet;
    };
    hexToBytes(hex: string): Uint8Array;
    getSignature(index: number, keyHash: string): string;
    signersCompleted(index: number): boolean;
    addSignature(signature: string): number;
    decodeTransaction(tx: string): any;
    getUtxosByOutRef(OutputRef: {
        transaction_id: string;
        index: string;
    }[]): Promise<UTxO[]>;
    getPendingTxDetails(index: number): any;
    setDefaultAddress(address: string | null): void;
    setAddressNames(names: Record<string, string>): void;
    changeAddressName(address: string, name: string): void;
    getNetworkId(): number;
    getUtxos(): UTxO[];
    getDefaultAddress(): string;
    getScript(): Script;
    getCompletedTx(txId: string): {
        tx: string;
        signatures: Record<string, string>;
    } | null;
    getJson(): SmartMultisigJson;
    getAddressNames(): Record<string, string>;
    getAddressName(address: string): string;
}
export default SmartWallet;
