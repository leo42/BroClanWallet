import "./WalletPicker.css";
interface WalletPickerProps {
    setOpenModal: (modal: string) => void;
    operation: (wallet: string) => void;
}
declare function WalletPicker({ setOpenModal, operation }: WalletPickerProps): import("react/jsx-runtime").JSX.Element;
export default WalletPicker;
