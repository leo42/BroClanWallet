import React from "react";
import "./ImportModule.css";
import SmartWalletContainer from "./SmartWalletContainer";
interface ImportProps {
    root: any;
    moduleRoot: SmartWalletContainer;
}
interface ImportState {
    walletId: string;
}
declare class ImportModule extends React.Component<ImportProps, ImportState> {
    state: ImportState;
    closeModule: () => void;
    importWallet: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default ImportModule;
