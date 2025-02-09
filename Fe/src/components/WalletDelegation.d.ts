import "./WalletDelegation.css";
import WalletInterface from '../core/WalletInterface';
import SmartWalletContainer from './SmartWallet/SmartWalletContainer';
import MultisigContainer from './Multisig/MultisigContainer';
import { App } from '..';
declare function WalletDelegation(props: {
    wallet: WalletInterface;
    moduleRoot: SmartWalletContainer | MultisigContainer;
    root: App;
}): import("react/jsx-runtime").JSX.Element;
export default WalletDelegation;
