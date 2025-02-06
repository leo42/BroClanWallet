import MultisigWallet from '../core/multisigWallet';
import MultisigContainer from '../components/Multisig/MultisigContainer';
declare class Messaging {
    private wallet;
    private root;
    private port;
    constructor(wallet: MultisigWallet, root: MultisigContainer);
    connect(): Promise<void>;
    changeWallet(wallet: MultisigWallet): void;
    disconnect(): void;
}
export default Messaging;
