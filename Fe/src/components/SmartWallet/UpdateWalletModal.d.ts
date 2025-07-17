import React from "react";
import "./UpdateWalletModal.css";
import { TokenInfo } from "../../helpers/tokenInfo";
import SmartWallet from "../../core/smartWallet";
import SmartWalletContainer from "./SmartWalletContainer";
import { SmartMultisigJson } from "../../core/types";
type VerificationKeyHash = string;
type PolicyId = string;
type AssetName = string;
type SmartMultisigDescriptor = {
    type: "KeyHash";
    keyHash: VerificationKeyHash;
} | {
    type: "NftHolder";
    policy: PolicyId;
    name: AssetName;
    tokenData: TokenInfo | null;
} | {
    type: "AtLeast";
    scripts: SmartMultisigDescriptor[];
    m: number;
    subType: "All" | "Any" | "AtLeast";
} | {
    type: "Before";
    time: number;
} | {
    type: "After";
    time: number;
} | {
    type: "Script";
    scriptHash: string;
};
interface AddWalletModalProps {
    root: any;
    moduleRoot: SmartWalletContainer;
    wallet: SmartWallet;
    setOpenModal: (isOpen: boolean) => void;
    hostModal: (isHost: boolean) => void;
}
interface AddWalletModalState {
    json: SmartMultisigDescriptor;
    WName: string;
    signers: {
        hash: string;
        name: string;
        isDefault: boolean;
    }[];
}
declare class UpdateWalletModal extends React.Component<AddWalletModalProps, AddWalletModalState> {
    state: AddWalletModalState;
    policyMap: Map<string, string>;
    options: {
        name: string;
        value: string;
    }[];
    presetOptions: {
        name: string;
        value: string;
    }[];
    debouncedFunctions: Map<string, (...args: typeof debounce[]) => void>;
    isAddressValid: (address: string) => boolean;
    keyHashOff(addressOrKeyHash: string): string;
    ifValidKeyHash(keyHash: string): boolean;
    checkAllAddresses: (scripts: SmartMultisigDescriptor[]) => boolean;
    checkAllAtLeast: (json: SmartMultisigDescriptor[]) => boolean;
    findNftHolderCoordinates: (json: SmartMultisigDescriptor, path?: number[]) => number[][];
    countSigners: (json: SmartMultisigDescriptor) => number;
    componentDidMount(): void;
    setJson: (json: SmartMultisigDescriptor) => void;
    setWName: (WName: string) => void;
    toSmartMultisigDescriptor: (json: SmartMultisigJson) => SmartMultisigDescriptor;
    toSmartMultisigJson: (json: SmartMultisigDescriptor) => SmartMultisigJson;
    normalizeName: (name: string) => string;
    handleSubmit: () => Promise<void>;
    handlePresetChange: (value: string) => void;
    atLeastComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    handleAddScript: (coordinates: number[]) => void;
    handleRequiredChange: (value: string, coordinates: number[]) => void;
    handleSignatoryNameChange: (value: string, coordinates: number[]) => void;
    handleTimeChange: (value: number, coordinates: number[]) => void;
    handleKeyHashChange: (value: string, coordinates: number[]) => void;
    handlePolicyTypeChange: (value: string, coordinates: number[]) => void;
    sigComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    beforeComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    afterComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    nftHolderComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    scriptComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    handleScriptHashChange: (value: string, coordinates: number[]) => void;
    handlePolicyChange: (value: string, coordinates: number[]) => void;
    handleAssetNameChange: (value: string, coordinates: number[]) => void;
    handleNftHolderChange: (coordinates: number[]) => Promise<void>;
    debouncedhandleNftHolderChange: (coordinates: number[]) => void;
    deleteElement: (value: any, coordinates: number[]) => void;
    handleTypeChange: (value: string, coordinates: number[]) => void;
    rootComponenent: (json: SmartMultisigDescriptor, coordinates?: number[]) => import("react/jsx-runtime").JSX.Element;
    handleOnChangeSigners(index: number): void;
    SignersSelect: () => import("react/jsx-runtime").JSX.Element[];
    render(): import("react/jsx-runtime").JSX.Element;
}
export default UpdateWalletModal;
declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
