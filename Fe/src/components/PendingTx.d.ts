import { TxSignBuilder } from "@lucid-evolution/lucid";
import "./PendingTx.css";
import WalletInterface from "../core/WalletInterface";
import SmartWalletContainer from "./SmartWallet/SmartWalletContainer";
import MultiWalletContainer from "./Multisig/MultisigContainer";
interface WalletPendingTxProps {
    moduleRoot: MultiWalletContainer | SmartWalletContainer;
    wallet: WalletInterface;
    tx: {
        tx: TxSignBuilder;
        signatures: Record<string, string>;
    };
    index: number;
    root: any;
}
declare function WalletPendingTx(props: WalletPendingTxProps): import("react/jsx-runtime").JSX.Element;
export default WalletPendingTx;
