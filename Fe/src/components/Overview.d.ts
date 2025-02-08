import "./Overview.css";
import WalletInterface from '../core/WalletInterface';
import SmartWalletContainer from './SmartWallet/SmartWalletContainer';
import MultisigContainer from './Multisig/MultisigContainer';
declare function Overview(props: {
    wallet: WalletInterface;
    moduleRoot: SmartWalletContainer | MultisigContainer;
}): import("react/jsx-runtime").JSX.Element;
export default Overview;
