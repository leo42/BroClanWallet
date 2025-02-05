import React from 'react';

interface WalletState {
  modal: string;
  wallets: any[];
  pendingWallets: Record<string, any>;
  selectedWallet: number;
  connectedWallet: {
    name: string;
    socket: any | null;
  };
  loading: boolean;
  dAppConnector: any | null;
}

interface MultisigContainerProps {
  settings: any;
  root: {
    state: {
      settings: any;
      syncService: string;
    };
  };
}

declare class MultisigContainer extends React.Component<MultisigContainerProps, WalletState> {
  interval: NodeJS.Timeout;
  
  componentDidUpdate(prevProps: MultisigContainerProps): void;
  componentDidMount(): void;
  componentWillUnmount(): void;
  
  newSettings(newSettings: any): Promise<void>;
  showModal(modalName: string): Promise<void>;
  setState(state: WalletState): Promise<void>;
  connectWallet(wallet: string): Promise<void>;
  disconnectWallet(error?: string): void;
  reloadAllBalance(): Promise<void>;
  reloadBalance(): Promise<void>;
  storeState(): void;
  storeWallets(): void;
  loadState(): Promise<void>;
  modalType(): string;
  createTx(recipients: any[], signers: any[], sendFrom: string = "", sendAll: number | null = null, withdraw: boolean = true) : Promise<void>;
  setCollateralDonor(keyHash: string): Promise<void>;
  importTransaction(transaction: any): Promise<any>;
  getSigners(): any[];
  getSignerName(keyHash: string): string;
  createDelegationTx(pool: any, dRepId: any, signers: any[]): Promise<void>;
  createStakeUnregistrationTx(signers: any[]): Promise<void>;
  deleteWallet(index: number): Promise<void>;
  removePendingTx(index: number): Promise<void>;
  changeWalletName(name: string): void;
  addSignature(signature: any): void;
  setDefaultAddress(address: string): void;
  updateSignerName(keyHash: string, name: string): void;
  changeAddressName(address: string, name: string): void;
  getTransactionHistory(address: string): Promise<any>;
  deleteImportedWallet(key: string): void;
  deleteAllPendingWallets(): void;
  importPendingWallet(key: string): Promise<void>;
  addWallet(script: any, name: string): Promise<void>;
  loadWallets(): void;
  setDefaultSigners(signers: any[]): void;
  transmitTransaction(transaction: any, sigAdded: any): void;
  transmitWallet(script: any): void;
  loadTransaction(transaction: any, walletIndex: number): Promise<void>;
  selectWallet(key: number): void;
  walletHash(wallet: any): Promise<string>;
  submit(index: number): Promise<void>;
  walletsEmpty(): JSX.Element;
}

export default MultisigContainer;
