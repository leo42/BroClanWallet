import MultisigContainer from '../components/Multisig/MultisigContainer';
import SmartWalletContainer from '../components/SmartWallet/SmartWalletContainer';
import WalletInterface from '../core/WalletInterface';
declare class Messaging {
    private wallet;
    private root;
    private port;
    constructor(wallet: WalletInterface, root: MultisigContainer | SmartWalletContainer);
    connect(): Promise<void>;
    changeWallet(wallet: WalletInterface): void;
    disconnect(): void;
}
export default Messaging;
