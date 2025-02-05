import "./WalletImportModal.css";
import MultisigContainer from "./Multisig/MultisigContainer";
type WalletImportModalProps = {
    moduleRoot: MultisigContainer;
    setOpenModal: (open: boolean) => void;
};
declare function WalletImportModal(props: WalletImportModalProps): import("react/jsx-runtime").JSX.Element;
export default WalletImportModal;
