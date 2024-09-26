import React from 'react';

interface Wallet {
  getDefaultAddress(): string;
  getAddress(stakeAddress?: string): string;
  getFundedAddress(): string[];
  getAddressName(address: string): string;
}

interface ReceiveProps {
  wallet: Wallet;
}

declare function copyTextToClipboard(text: string): void;

declare function Receive(props: any): JSX.Element;

export default Receive;