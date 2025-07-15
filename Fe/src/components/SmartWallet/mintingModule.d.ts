import React from "react";
import { UTxO } from "@lucid-evolution/lucid";
import "./MintingModule.css";
import { App } from "../../index";
import SmartWalletContainer from "./SmartWalletContainer";
interface MintingProps {
    root: App;
    moduleRoot: SmartWalletContainer;
}
interface MintingState {
    termsAccepted: boolean[];
    price: number | null;
    message: string;
    walletId: string;
    name: string;
}
declare class MintingModule extends React.Component<MintingProps> {
    terms: import("react/jsx-runtime").JSX.Element[];
    mintingInfo: string[];
    state: MintingState;
    mintingRawScript: {
        type: string;
        script: string;
    };
    componentDidMount(): void;
    inputCheck: () => boolean;
    startMint: () => void;
    mintWithWallet: (wallet: string) => void;
    mint(wallet: string, settings: any, name: string): Promise<void>;
    getTokenName(utxo: UTxO): string;
    toggleTerm: (index: number) => void;
    closeModule: () => void;
    importWallet: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default MintingModule;
