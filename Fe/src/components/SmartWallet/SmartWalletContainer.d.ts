import React from 'react';
interface SmartWalletContainerProps {
    settings: any;
    root: any;
}
interface SmartWalletContainerState {
    modal: string;
    wallets: any[];
    selectedWallet: number;
    connectedWallet: {
        name: string;
        socket: any;
    };
    loading: boolean;
    dAppConnector: any | null;
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
    storeWallets(): void;
    loadState(): Promise<void>;
    modalType(): string;
    createTx(recipients: any[], signers: any[], sendFrom: any, sendAll?: boolean | null): Promise<void>;
    importTransaction(transaction: any): Promise<void>;
    deleteWallet(index: number): Promise<void>;
    changeWalletName(name: string): void;
    addSignature(signature: any): void;
    setDefaultAddress(address: string): void;
    changeAddressName(address: string, name: string): void;
    getTransactionHistory(address: string): void;
    addWallet(script: any, name: string): Promise<void>;
    loadWallets(): void;
    transmitTransaction(transaction: any, sigAdded: any): void;
    transmitWallet(script: any): void;
    loadTransaction(transaction: any, walletIndex: number): Promise<void>;
    selectWallet(key: number): void;
    submit(index: number): Promise<void>;
    walletsEmpty(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default SmartWalletContainer;
