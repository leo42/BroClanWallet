import React from 'react';

interface Wallet {
  getPendingTxDetails(index: number): any;
  getUtxosByOutRef(outRefs: any[]): Promise<any[]>;
  checkSigners(signers: string[]): boolean;
  isAddressMine(address: string): boolean;
  getStakingAddress(): string;
  getSignature(index: number, keyHash: string): string;
}

interface ModuleRoot {
  state: {
    wallets: { [key: string]: Wallet };
    selectedWallet: string;
    connectedWallet: { name: string };
  };
  addSignature(signature: string): void;
  removePendingTx(index: number): void;
  setDefaultAddress(address: string): void;
  submit(index: number): void;
}

interface WalletPendingTxProps {
  wallet: Wallet;
  moduleRoot: ModuleRoot;
  root: Root;
  index: number;
  tx: {
    tx: {
      toString(): string;
    };
  };
}

declare function WalletPendingTx(props: any): JSX.Element;

export default WalletPendingTx;