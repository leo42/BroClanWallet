import "./WalletImportModal.css";
import MultisigContainer from "./Multisig/MultisigContainer";
import SmartWalletContainer from "./SmartWallet/SmartWalletContainer";
type WalletImportModalProps = {
    moduleRoot: MultisigContainer | SmartWalletContainer;
    setOpenModal: (open: boolean) => void;
};
declare function WalletImportModal(props: WalletImportModalProps): import("react/jsx-runtime").JSX.Element;
export default WalletImportModal;
