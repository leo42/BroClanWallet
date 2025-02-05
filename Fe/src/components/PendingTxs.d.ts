import WalletInterface from "./WalletInterface";
type PendingTxsProps = {
    moduleRoot: any;
    root: any;
    wallet: WalletInterface;
};
declare function PendingTxs(props: PendingTxsProps): import("react/jsx-runtime").JSX.Element;
export default PendingTxs;
