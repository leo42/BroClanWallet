import React from 'react';
import './walletSetting.css';
import Wallet from './multisigWallet';
interface WalletSettingsProps {
    wallet: Wallet;
    moduleRoot: any;
    closeSettings: () => void;
}
interface WalletSettingsState {
    closeSettings: () => void;
    wallet: Wallet;
    hovering: string;
    moduleRoot: any;
    showingDetails: string;
    isMobile: boolean;
}
declare class WalletSettings extends React.Component<WalletSettingsProps> {
    state: WalletSettingsState;
    handleExport: () => void;
    walletJson: (json: any) => import("react/jsx-runtime").JSX.Element;
    toggleDefultSigner: (ChangedSigner: string) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default WalletSettings;
