import React from "react";
interface MintingProps {
    root: {
        openWalletPicker: (callback: (wallet: any) => void) => void;
        state: {
            settings: any;
        };
        showModal: (modalName: string) => void;
    };
    showModal: (modalName: string) => void;
}
declare class Minting extends React.Component<MintingProps> {
    terms: import("react/jsx-runtime").JSX.Element[];
    mintingInfo: string[];
    state: {
        mintingSettings: {
            name: string;
            description: string;
            amount: number;
            image: string;
        }[];
        termsAccepted: boolean[];
    };
    paymentAddress: string;
    mintingRawScript: {
        type: string;
        script: string;
    };
    adminKey: string;
    inputCheck: () => boolean;
    startMint: () => void;
    mintWithWallet: (wallet: string) => void;
    mint(wallet: string, settings: any): Promise<void>;
    description: import("react/jsx-runtime").JSX.Element;
    acceptTerm: (index: number) => void;
    toggleAfiliateModal: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default Minting;
