import "./TransactionHistory.css";
import { App } from "..";
import MultisigContainer from "./Multisig/MultisigContainer";
import SmartWalletContainer from "./SmartWallet/SmartWalletContainer";
import WalletInterface from "../core/WalletInterface";
type TransactionHistoryProps = {
    wallet: WalletInterface;
    root: App;
    moduleRoot: MultisigContainer | SmartWalletContainer;
};
declare function TransactionHistory(props: TransactionHistoryProps): import("react/jsx-runtime").JSX.Element;
export default TransactionHistory;
