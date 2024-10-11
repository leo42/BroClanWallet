import React from 'react';

interface Wallet {
  getDefaultAddress(): string;
  getFundedAddress(): string[];
  getAddressName(address: string): string;
}

interface Settings {
  network: string;
  metadataProvider: string;
}

interface Root {
  state: {
    settings: Settings;
  };
}

interface TransactionHistoryProps {
  wallet: Wallet;
  root: Root;
}

interface Transaction {
  tx_hash: string;
  block_time: number;
  utxos: {
    inputs: UTXOInput[];
    outputs: UTXOOutput[];
  };
  withdrawals?: {
    amount: number;
  };
}

interface UTXOInput {
  address: string;
  amount: Asset[];
  collateral: boolean;
}

interface UTXOOutput {
  address: string;
  amount: Asset[];
  collateral: boolean;
}

interface Asset {
  unit: string;
  quantity: string;
}

interface TokenElementProps {
  tokenId: string;
  amount: number;
  expanded: boolean;
  className?: string;
}

declare function getTransactionHistory(address: string, settings: Settings, page?: number): Promise<Transaction[]>;

declare function TokenElement(props: TokenElementProps): JSX.Element;

declare function TransactionHistory(props: any): JSX.Element;

export default TransactionHistory;