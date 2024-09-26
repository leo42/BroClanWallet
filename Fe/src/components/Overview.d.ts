import React from 'react';

interface WalletInterface {
  getFundedAddress(): string[];
  getDefaultAddress(): string;
  getJson(): object;
  getCBOR(): string;
  getAddressName(address: string): string;
  getName(): string;
  getSigners(): Array<{ hash: string; name: string; isDefault: boolean }>;
  defaultSignersValid(): boolean;
  getCollateralDonor(): string;
  getBalanceFull(address: string): { [key: string]: number };
}

interface ModuleRootInterface {
  setDefaultAddress(address: string): void;
  changeAddressName(address: string, name: string): void;
  changeWalletName(name: string): void;
  setDefaultSigners(signers: string[]): void;
  setCollateralDonor(donor: string): void;
  deleteWallet(wallet: string): void;
  state: {
    selectedWallet: string;
  };
  modalType(): string;
}

interface OverviewProps {
  wallet: WalletInterface;
  moduleRoot: ModuleRootInterface;
}

declare function Overview(props: any): React.ReactElement;

export default Overview;
