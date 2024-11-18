import SmartWallet from '../components/SmartWallet/smartWallet';
declare class SmartWalletMessaging {
    private wallet;
    private root;
    private port;
    constructor(wallet: SmartWallet, root: any);
    connect(): Promise<void>;
    changeWallet(wallet: SmartWallet): void;
    disconnect(): void;
}
export default SmartWalletMessaging;
