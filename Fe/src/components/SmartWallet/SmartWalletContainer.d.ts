import React from 'react';
import SmartWallet from '../../core/smartWallet';
import './SmartWalletContainer.css';
import { Settings } from '../../index';
import { SmartMultisigJson } from "./types";
import Messaging from '../../helpers/Messaging';
interface SmartWalletContainerProps {
    settings: Settings;
    root: any;
}
interface SmartWalletContainerState {
    modal: string;
    wallets: SmartWallet[];
    selectedWallet: number;
    connectedWallet: {
        name: string;
        socket: any;
    };
    loading: boolean;
    dAppConnector: Messaging | null;
    walletSettingsOpen: boolean;
}
declare class SmartWalletContainer extends React.Component<SmartWalletContainerProps, SmartWalletContainerState> {
    private interval;
    state: SmartWalletContainerState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: SmartWalletContainerProps): void;
    newSettings(newSettings: any): Promise<void>;
    showModal(modalName: string): Promise<void>;
    connectWallet(wallet: string): Promise<void>;
    disconnectWallet(error?: string): void;
    reloadBalance(): Promise<void>;
    storeState(): void;
    loadState(): Promise<void>;
    modalType(): string;
    createTx(recipients: any[], signers: any[], sendFrom?: string, sendAll?: number | null, withdraw?: boolean): Promise<void>;
    createUpdateTx(signers: string[], newConfig: SmartMultisigJson): Promise<void>;
    importTransaction(transaction: any): Promise<string | {
        code: number;
        error: string;
    }>;
    deleteWallet(index: number): Promise<void>;
    changeWalletName(name: string): void;
    addSignature(signature: string): void;
    setDefaultSigners(signers: string[]): void;
    setDefaultAddress(address: string): void;
    storeWallets(): void;
    getSigners(): {
        name: string;
        hash: string;
        isDefault: boolean;
    }[];
    getSignerName(keyHash: string): string;
    updateSignerName(hash: string, name: string): void;
    removePendingTx(tx: number): void;
    addWallet(id: any, name?: string): Promise<void>;
    reloadWallets(): Promise<void>;
    setCollateralDonor(address: string): void;
    loadWallets(): Promise<void>;
    createDelegationTx(pool: string, dRepId: string, signers: string[]): Promise<void>;
    changeAddressName(address: string, name: string): void;
    createStakeUnregistrationTx(signers: string[]): Promise<void>;
    selectWallet(key: number): void;
    submit(index: number): Promise<void>;
    walletsEmpty(): import("react/jsx-runtime").JSX.Element;
    WalletList(): import("react/jsx-runtime").JSX.Element;
    closeModal(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default SmartWalletContainer;
