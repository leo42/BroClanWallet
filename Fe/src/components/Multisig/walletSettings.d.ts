import React from 'react';
import './walletSetting.css';
import MultisigWallet from '../../core/multisigWallet';
import MultisigContainer from './MultisigContainer';
interface WalletSettingsProps {
    wallet: MultisigWallet;
    moduleRoot: MultisigContainer;
    closeSettings: () => void;
}
interface WalletSettingsState {
    closeSettings: () => void;
    wallet: MultisigWallet;
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
