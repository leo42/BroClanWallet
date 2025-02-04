import { TxSignBuilder } from "@lucid-evolution/lucid";
import "./PendingTx.css";
import WalletInterface from "./WalletInterface";
interface WalletPendingTxProps {
    moduleRoot: any;
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
