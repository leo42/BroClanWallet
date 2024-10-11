import React from "react";
import "./UpdateWalletModal.css";
import { Lucid } from "lucid-cardano";
import { TokenInfo } from "../../helpers/tokenInfo";
type VerificationKeyHash = string;
type PolicyId = string;
type AssetName = string;
type SmartMultisigDescriptor = {
    type: "KeyHash";
    keyHash: VerificationKeyHash;
    name: string;
} | {
    type: "NftHolder";
    policy: PolicyId;
    name: AssetName;
    tokenData: TokenInfo | null;
} | {
    type: "AtLeast";
    scripts: SmartMultisigDescriptor[];
    m: number;
} | {
    type: "Before";
    time: number;
} | {
    type: "After";
    time: number;
};
interface AddWalletModalProps {
    root: any;
    moduleRoot: any;
    setOpenModal: (isOpen: boolean) => void;
    hostModal: (isHost: boolean) => void;
}
interface AddWalletModalState {
    json: SmartMultisigDescriptor;
    WName: string;
}
declare class UpdateWalletModal extends React.Component<AddWalletModalProps, AddWalletModalState> {
    state: AddWalletModalState;
    lucid: Lucid | null;
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
    checkAllAddresses: (scripts: SmartMultisigDescriptor[]) => boolean;
    componentDidMount(): void;
    setJson: (json: SmartMultisigDescriptor) => void;
    setWName: (WName: string) => void;
    handleSubmit: () => void;
    handlePresetChange: (value: string) => void;
    atLeastComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    handleAddScript: (coordinates: number[]) => void;
    handleRequiredChange: (value: string, coordinates: number[]) => void;
    handleSignatoryNameChange: (value: string, coordinates: number[]) => void;
    handleSlotChange: (value: number, coordinates: number[]) => void;
    handleKeyHashChange: (value: string, coordinates: number[]) => void;
    handlePolicyTypeChange: (value: string, coordinates: number[]) => void;
    sigComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    beforeComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    afterComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    nftHolderComponent: (json: SmartMultisigDescriptor, coordinates: number[]) => import("react/jsx-runtime").JSX.Element | null;
    handlePolicyChange: (value: string, coordinates: number[]) => void;
    handleAssetNameChange: (value: string, coordinates: number[]) => void;
    handleNftHolderChange: (coordinates: number[]) => Promise<void>;
    debouncedhandleNftHolderChange: (coordinates: number[]) => void;
    deleteElement: (value: any, coordinates: number[]) => void;
    handleTypeChange: (value: string, coordinates: number[]) => void;
    rootComponenent: (json: SmartMultisigDescriptor, coordinates?: number[]) => import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default UpdateWalletModal;
declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
