import React from 'react';
import SmartWallet from './smartWallet';
import './SmartWalletContainer.css';
import { Settings } from '../../types/app';
import { SmartMultisigJson } from "./types";
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
    dAppConnector: any | null;
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
    importTransaction(transaction: any): Promise<void>;
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
    loadWallet(id: string): Promise<void>;
    addWallet(id: any): Promise<void>;
    setCollateralDonor(address: string): void;
    loadWallets(): Promise<void>;
    createDelegationTx(pool: string, dRepId: string, signers: string[]): Promise<void>;
    changeAddressName(address: string, name: string): void;
    createStakeUnregistrationTx(signers: string[]): Promise<void>;
    selectWallet(key: number): void;
    submit(index: number): Promise<void>;
    walletsEmpty(): import("react/jsx-runtime").JSX.Element;
    WalletList(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default SmartWalletContainer;
