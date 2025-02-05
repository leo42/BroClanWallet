import React from 'react';
import './WalletMain.css';
import SmartWalletContainer from './SmartWalletContainer';
import { App } from '../../index';
import MultisigContainer from '../Multisig/MultisigContainer';
import WalletInterface from '../WalletInterface';
interface WalletMainProps {
    wallet: WalletInterface;
    root: App;
    moduleRoot: SmartWalletContainer | MultisigContainer;
}
interface WalletMainState {
    showing: string;
}
declare class WalletMain extends React.Component<WalletMainProps, WalletMainState> {
    state: WalletMainState;
    mainView(): import("react/jsx-runtime").JSX.Element | undefined;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default WalletMain;
