import React from 'react';

interface Wallet {
  getSigners(): Array<{ name: string; hash: string; isDefault: boolean }>;
  getDefaultAddress(): string;
  getBalanceFull(address?: string): { [key: string]: number };
  isAddressValid(address: string): boolean;
  getFundedAddress(): string[];
  getAddressName(address: string): string;
  getStakingAddress(): string;
  isAddressMine(address: string): boolean;
}

interface ModuleRoot {
  createTx(recipients: Recipient[], signers: string[], sendFrom: string, sendAll: number | null): void;
  state: {
    wallets: { [key: string]: Wallet };
    selectedWallet: string;
  };
}

interface Root {
  state: {
    settings: {
      sendAll: boolean;
      network: string;
    };
  };
}

interface Recipient {
  address: string;
  amount: { [key: string]: number };
}

interface WalletCreateTxProps {
  wallet: Wallet;
  moduleRoot: ModuleRoot;
  root: Root;
}

interface WalletCreateTxState {
  recipients: Recipient[];
  signers: boolean[];
  tokenData: { [key: string]: any };
  sendFrom: string;
  sendAll: number | null;
  hovering: string;
}

declare class WalletCreateTx extends React.Component<WalletCreateTxProps, WalletCreateTxState> {
  setHovering(value: string): void;
  isAddressValid(address: string): boolean;
  setAddress(value: string, index: number): void;
  setAmount(value: string, token: string, index: number): void;
  handleOnChangeSigners(position: number): void;
  handleChangeFrom(event: React.ChangeEvent<HTMLSelectElement>): void;
  handleSubmit(event: React.FormEvent): void;
  deleteRecipient(index: number): void;
  deleteToken(tokenId: string, index: number): void;
  setMax(tokenId: string, index: number): void;
  addToken(tokenId: string, index: number): void;
  handleSendAlltoggle(index: number): void;
  addRecipient(): void;
  RecipientJSX(): JSX.Element[];
  SignersSelect(): JSX.Element[];
  AccountSelect(): JSX.Element;
}

export default WalletCreateTx;