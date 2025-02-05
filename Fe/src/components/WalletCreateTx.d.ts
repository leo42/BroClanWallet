import React from 'react';
import "./WalletCreateTx.css";
import SmartWalletContainer from './SmartWallet/SmartWalletContainer';
import WalletInterface from './WalletInterface';
import { App } from '../index.js';
import MultisigContainer from './Multisig/MultisigContainer.js';
interface WalletCreateTxProps {
    wallet: WalletInterface;
    moduleRoot: SmartWalletContainer | MultisigContainer;
    root: App;
}
interface WalletCreateTxState {
    recipients: {
        address: string;
        amount: {
            [key: string]: bigint;
        };
    }[];
    signers: boolean[];
    tokenData: {
        [key: string]: any;
    };
    sendFrom: string;
    sendAll: number | null;
    hovering: string;
}
declare class WalletCreateTx extends React.Component<WalletCreateTxProps> {
    state: WalletCreateTxState;
    setHovering: (value: string) => void;
    isAddressValid: (address: string) => boolean;
    componentDidMount(): void;
    setAddress: (value: string, index: number) => void;
    setAmount: (value: string, token: string, index: number) => void;
    handleOnChangeSigners: (position: number) => void;
    handleChangeFrom: (value: string) => void;
    handleSubmit: (event: React.FormEvent) => void;
    deleteRecipient: (index: number) => void;
    deleteToken: (tokenId: string, index: number) => void;
    setMax: (tokenId: string, index: number) => void;
    addToken: (tokenId: string, index: number) => void;
    handleSendAlltoggle: (index: number) => void;
    addRecipient: () => void;
    RecipientJSX: () => import("react/jsx-runtime").JSX.Element[];
    SignersSelect: () => import("react/jsx-runtime").JSX.Element[];
    render(): import("react/jsx-runtime").JSX.Element;
}
export default WalletCreateTx;
