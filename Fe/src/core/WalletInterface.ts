import { Assets, UTxO, TxSignBuilder, Delegation, OutRef , Credential, Script } from "@lucid-evolution/lucid";

interface WalletInterface {
  // Basic wallet info
  getName(): string;
  setName(name: string): void;
  getAddress(stakingAddress?: string): string;
  getCredential(): Credential;
  
  // Balance and UTXOs
  getBalance(address?: string): number;
  getBalanceFull(address?: string): Assets;
  loadUtxos(): Promise<boolean>;
  getUtxos(): UTxO[];
  getUtxosByOutRef(outRefs: Array<OutRef>): Promise<UTxO[]>;
  getFundedAddress(): string[];
  

  // Delegation
  getDelegation(): Promise<Delegation>;
  createDelegationTx(pool: string, dRepId: string, signers: string[]): Promise<any>;
  createStakeUnregistrationTx(signers: string[]): Promise<any>;
  
  // Transaction management
  getPendingTxs(): { tx: TxSignBuilder; signatures: Record<string, string> }[];
  removePendingTx(index: number): void;
  getPendingTxDetails(index: number): any;
  submitTransaction(index: number): Promise<any>;
  getTransactionType(txDetails: any): string;
  decodeTransaction(tx: string): any;
  
  // Signatures and signers
  getSigners(): any[];
  getSignature(index: number, keyHash: string): string;
  addSignature(signature: string): any;
  checkSigners(signers: string[]): any;
  getDefaultSigners(): string[];
  setDefaultSigners(signers: string[]): void;
  defaultSignersValid(): boolean;
  getCollateral(): Promise<UTxO[]>;
  // Address management
  getCollateralAddress(): string;
  isAddressMine(address: string): boolean;
  isAddressValid(address: string): boolean;
  isAddressScript(address: string): boolean;
  getAddressNames(): Record<string, string>;
  getAddressName(address: string): string;
  setAddressNames(names: Record<string, string>): void;
  changeAddressName(address: string, name: string): void;
  getDefaultAddress(): string;
  setDefaultAddress(address: string): void;

  getStakingAddress(): string;
  getCompletedTx(txId: string): any;
  // Settings
  getScript(): any;
  getNetworkId(): number;
  changeSettings(settings: any): Promise<void>;
  
  // Collateral
  getCollateralDonor(): string;
  setCollateralDonor(paymentKeyHash: string): Promise<void>;
}

export default WalletInterface;