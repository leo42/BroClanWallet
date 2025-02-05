import './App.css';
import React from 'react';
import './components/ReactToastify.css';
export type Settings = {
    metadataProvider: string;
    sendAll: boolean;
    network: string;
    explorer: string;
    provider: string;
    disableSync: boolean;
    termsAccepted: string;
    api: {
        url?: string;
        projectId?: string;
        apiKey?: string;
        kupoUrl?: string;
        ogmiosUrl?: string;
    };
};
export type AppState = {
    modal: string;
    module: string;
    settings: Settings;
    mode: string;
    syncService: string;
    walletPicker: (wallet: string) => void | undefined;
};
export declare class App extends React.Component<{}, AppState> {
    state: AppState;
    setState(state: AppState): void;
    componentDidMount(): void;
    loadState(): void;
    setModule(module: string): void;
    acceptTerms(version: string): void;
    setSettings(newSettings: Settings): Promise<void>;
    checkSettings(settings: Settings): Promise<boolean>;
    showModal(modal: string): void;
    toggleSendAll(): Promise<void>;
    toggleDisableSync(): Promise<void>;
    setMode(mode: string): Promise<void>;
    toggleMode(): Promise<void>;
    openWalletPicker(operation: (wallet: string) => void): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
