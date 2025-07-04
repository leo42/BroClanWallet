import "./walletConnector.css";
import MultisigContainer from "./Multisig/MultisigContainer";
declare function WalletConnector(props: {
    moduleRoot: MultisigContainer;
    openWalletPicker: (connectWallet: (walletName: string) => void) => void;
}): import("react/jsx-runtime").JSX.Element;
export default WalletConnector;
