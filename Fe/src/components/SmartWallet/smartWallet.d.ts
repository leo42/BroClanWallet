import { TxSignBuilder, Assets, Datum, Redeemer, Delegation } from "@lucid-evolution/lucid";
interface WalletSettings {
    network: string;
}
interface Recipient {
    address: string;
    amount: Assets;
}
declare class SmartWallet {
    private id;
    private name;
    private lucid;
    private script;
    private utxos;
    private delegation;
    private pendingTxs;
    private addressNames;
    private defaultAddress;
    constructor(id: string, name: string, settings: WalletSettings, script: string);
    private initializeLucid;
    initialize(): Promise<void>;
    changeSettings(settings: WalletSettings): Promise<void>;
    getAddress(): string;
    getName(): string;
    getDelegation(): Promise<Delegation>;
    getBalance(address?: string): bigint;
    getBalanceFull(address?: string): Assets;
    loadUtxos(): Promise<void>;
    private compareUtxos;
    createTx(recipients: Recipient[], datums: Datum[], redeemer: Redeemer, sendAll?: number | null, withdraw?: boolean): Promise<TxSignBuilder>;
    createStakeUnregistrationTx(): Promise<TxSignBuilder>;
    createDelegationTx(pool: string): Promise<TxSignBuilder>;
    isAddressMine(address: string): boolean;
    isAddressValid(address: string): boolean;
    isAddressScript(address: string): boolean;
    submitTransaction(index: number): Promise<Boolean>;
    setDefaultAddress(address: string): void;
    setAddressNames(names: Record<string, string>): void;
    changeAddressName(address: string, name: string): void;
    getDefaultAddress(): string;
    getAddressNames(): Record<string, string>;
    getAddressName(address: string): string;
}
export default SmartWallet;
