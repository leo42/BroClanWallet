import React from "react";
import "./AddWalletModal.css";
import MultisigContainer from "./MultisigContainer";
import { App } from "../..";
type AddWalletModalProps = {
    moduleRoot: MultisigContainer;
    setOpenModal: (open: boolean) => void;
    hostModal: (open: boolean) => void;
    root: App;
};
export type Native = {
    type: "sig";
    name: string;
    keyHash: string;
} | {
    type: "before";
    slot: number;
} | {
    type: "after";
    slot: number;
} | {
    type: "all";
    scripts: ReadonlyArray<Native>;
} | {
    type: "any";
    scripts: ReadonlyArray<Native>;
} | {
    type: "atLeast";
    required: number;
    scripts: ReadonlyArray<Native>;
};
type AddWalletModalState = {
    json: Native;
    WName: string;
};
declare class AddWalletModal extends React.Component<AddWalletModalProps> {
    state: AddWalletModalState;
    options: {
        name: string;
        value: string;
    }[];
    presetOptions: {
        name: string;
        value: string;
    }[];
    isAddressValid: (address: string) => boolean;
    checkAllAddresses: (script: Native) => boolean;
    setJson(json: any): void;
    setWName(WName: string): void;
    handleSubmit(): void;
    handlePresetChange(value: string): void;
    allComponent(json: Native, coordinates: number[]): import("react/jsx-runtime").JSX.Element | null;
    anyComponent(json: Native, coordinates: number[]): import("react/jsx-runtime").JSX.Element | null;
    atLeastComponent(json: Native, coordinates: number[]): import("react/jsx-runtime").JSX.Element | null;
    handleAddScript(coordinates: number[]): void;
    handleRequiredChange(value: string, coordinates: number[]): void;
    handleSignatoryNameChange(value: string, coordinates: number[]): void;
    handleSlotChange(value: number, coordinates: number[]): void;
    handleKeyHashChange(value: string, coordinates: number[]): void;
    sigComponent(json: Native, coordinates: number[]): import("react/jsx-runtime").JSX.Element | null;
    beforeComponent(json: Native, coordinates: number[]): import("react/jsx-runtime").JSX.Element | null;
    afterComponent(json: Native, coordinates: number[]): import("react/jsx-runtime").JSX.Element | null;
    deleteElement(coordinates: number[]): void;
    handleTypeChange(value: 'all' | 'any' | 'atLeast' | 'before' | 'after' | 'sig', coordinates: number[]): void;
    rootComponenent(json: Native, coordinates?: number[]): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default AddWalletModal;
