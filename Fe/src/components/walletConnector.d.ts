import "./walletConnector.css";
import MultisigContainer from "./Multisig/MultisigContainer";
import SmartWalletContainer from "./SmartWallet/SmartWalletContainer";
declare function WalletConnector(props: {
    moduleRoot: MultisigContainer | SmartWalletContainer;
    openWalletPicker: (connectWallet: (walletName: string) => void) => void;
}): import("react/jsx-runtime").JSX.Element;
export default WalletConnector;
