import React from 'react';
import './WalletMain.css';
interface WalletMainProps {
    wallet: any;
    root: any;
    moduleRoot: any;
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
