import { TxSignBuilder, Assets, Datum, Redeemer, Delegation } from "@lucid-evolution/lucid";
interface WalletSettings {
    network: string;
}
interface Recipient {
    address: string;
    amount: Assets;
}
declare class SmartWallet {
    private lucid;
    private script;
    private utxos;
    private delegation;
    private pendingTxs;
    private addressNames;
    private defaultAddress;
    private id;
    constructor(id: string);
    initializeLucid(settings: WalletSettings): Promise<void>;
    changeSettings(settings: WalletSettings): Promise<void>;
    getAddress(): string;
    getEnterpriseAddress(): string;
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
    getId(): string;
    setDefaultAddress(address: string): void;
    setAddressNames(names: Record<string, string>): void;
    changeAddressName(address: string, name: string): void;
    getDefaultAddress(): string;
    getAddressNames(): Record<string, string>;
    getAddressName(address: string): string;
}
export default SmartWallet;
