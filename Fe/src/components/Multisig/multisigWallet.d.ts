import * as LucidEvolution from "@lucid-evolution/lucid";
declare class Wallet {
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
    utxos: any[];
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
    getDelegation(): Promise<any>;
    getBalance(address?: string): number;
    getBalanceFull(address?: string): any;
    substructBalanceFull(assets: any, address?: string): any;
    setPendingTxs(pendingTxs: any): void;
    getAddress(stakingAddress?: string): string;
    getStakingAddress(): string;
    getSigners(): any[];
    getFundedAddress(): string[];
    getUtxos(): any[];
    getutxo(utxoHash: string): any;
    getUtxosByOutRef(OutputRef: any): Promise<LucidEvolution.UTxO[]>;
    loadUtxos(): Promise<void>;
    compareUtxos(a: any, b: any): boolean;
    checkTransactions(): Promise<void>;
    checkTransaction(tx: any): Promise<boolean>;
    getPendingTxs(): {
        tx: LucidEvolution.TxSignBuilder;
        signatures: {
            [key: string]: string;
        };
    }[];
    decodeTransaction(tx: LucidEvolution.TxSignBuilder): any;
    getPendingTxDetails(index: number): any;
    checkSigners(signers: string[]): any;
    createTemplateTx(signers: string[]): Promise<LucidEvolution.TxBuilder>;
    createTx(recipients: any, signers: string[], sendFrom?: string, sendAll?: number | null, withdraw?: boolean): Promise<string>;
    importTransaction(transaction: string): Promise<string | {
        error: string;
        tx: string;
    }>;
    setCollateralDonor(paymentKeyHash: any): Promise<void>;
    loadCollateralUtxos(): Promise<void>;
    getCollateral(value: number | undefined): any;
    getCollateralDonor(): any;
    getCollateralUtxos(value: number | undefined): Promise<any>;
    getCollateralAddress(): any;
    getCollateralUtxo(value: number | undefined): Promise<any>;
    loadTransaction(transaction: any): Promise<void>;
    createStakeUnregistrationTx(signers: any): Promise<string>;
    getSignerName(keyHash: any): any;
    createDelegationTx(pool: string, dRepId: string, signers: any): Promise<string>;
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
    setAddressNamess(names: any): void;
    setName(name: string): void;
    changeAddressName(address: string, name: string): void;
    getNetworkId(): 0 | 1;
    getDefaultAddress(): string;
    getDefaultSigners(): any[];
    defaultSignersValid(): any;
    getAddressNames(): any;
    getAddressName(address: string): any;
}
export default Wallet;