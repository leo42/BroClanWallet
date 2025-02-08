import React from 'react';
import './WalletMain.css';
import WalletInterface from '../../core/WalletInterface';
import { App } from '../..';
import MultisigContainer from './MultisigContainer';
declare class WalletMain extends React.Component<{
    wallet: WalletInterface;
    root: App;
    moduleRoot: MultisigContainer;
}> {
    state: {
        showing: string;
    };
    mainView(): import("react/jsx-runtime").JSX.Element | undefined;
    setShowing(showing: string): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default WalletMain;
