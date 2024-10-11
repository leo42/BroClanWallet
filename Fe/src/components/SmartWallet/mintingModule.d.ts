import React from "react";
import { UTxO } from "@lucid-evolution/lucid";
import "./mintingModule.css";
import { Settings } from "../../types/app";
interface MintingProps {
    root: {
        openWalletPicker: (callback: (wallet: any) => void) => void;
        state: {
            settings: Settings;
        };
        showModal: (modalName: string) => void;
    };
    showModal: () => void;
    moduleRoot: any;
}
interface MintingState {
    termsAccepted: boolean[];
    price: number | null;
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
    mint(wallet: string, settings: any): Promise<void>;
    getTokenName(utxo: UTxO): string;
    description: import("react/jsx-runtime").JSX.Element;
    toggleTerm: (index: number) => void;
    closeModule: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default MintingModule;
