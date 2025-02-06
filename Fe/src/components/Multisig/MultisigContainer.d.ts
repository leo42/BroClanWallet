import React from 'react';
import "./MultisigContainer.css";
import Messaging from '../../helpers/Messaging';
import MultisigWallet from '../../core/multisigWallet';
import { Socket } from 'socket.io-client';
import { Settings } from '../..';
import { Native } from './AddWalletModal';
import { App } from '../..';
type MultisigContainerProps = {
    settings: Settings;
    root: App;
};
type MultisigContainerState = {
    modal: string;
    wallets: MultisigWallet[];
    pendingWallets: Record<string, any>;
    selectedWallet: number;
    connectedWallet: {
        name: string;
        socket: Socket | null;
    };
    loading: boolean;
    dAppConnector: Messaging | null;
};
declare class MultisigContainer extends React.Component<MultisigContainerProps, MultisigContainerState> {
    private interval;
    state: MultisigContainerState;
    componentDidUpdate(prevProps: MultisigContainerProps): void;
    newSettings(newSettings: Settings): Promise<void>;
    showModal(modalName: string): Promise<void>;
    setState(state: MultisigContainerState): Promise<void>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    connectWallet(wallet: string): Promise<void>;
    disconnectWallet(error?: string): void;
    reloadAllBalance(): Promise<void>;
    reloadBalance(): Promise<void>;
    storeState(): void;
    storeWallets(): void;
    loadState(): Promise<void>;
    modalType(): string;
    createTx(recipients: any[], signers: string[], sendFrom: string, sendAll: number | null): Promise<void>;
    setCollateralDonor(keyHash: string): Promise<void>;
    importTransaction(transaction: string): Promise<string | {
        error: string;
        tx: string;
    } | {
        code: number;
        error: string;
    }>;
    getSigners(): any[];
    getSignerName(keyHash: string): any;
    createDelegationTx(pool: string, dRepId: string, signers: string[]): Promise<void>;
    createStakeUnregistrationTx(signers: string[]): Promise<void>;
    deleteWallet(index: number): Promise<void>;
    removePendingTx(index: number): Promise<void>;
    changeWalletName(name: string): void;
    addSignature(signature: string): void;
    setDefaultAddress(address: string): void;
    updateSignerName(keyHash: string, name: string): void;
    changeAddressName(address: string, name: string): void;
    deleteImportedWallet(key: string): void;
    deleteAllPendingWallets(): void;
    importPendingWallet(key: string): Promise<void>;
    addWallet(script: Native, name: string): Promise<void>;
    loadWallets(): void;
    setDefaultSigners(signers: any): void;
    transmitTransaction(transaction: any, sigAdded: any): void;
    transmitWallet(script: Native): void;
    loadTransaction(transaction: any, walletIndex: number): Promise<void>;
    selectWallet(key: number): void;
    walletHash(wallet: any): Promise<string>;
    submit(index: number): Promise<void>;
    openNewWalletModal(): void;
    walletsEmpty: () => import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default MultisigContainer;
