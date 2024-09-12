import { Lucid, SpendingValidator, UTxO } from 'lucid-cardano';

interface WalletSettings {
  // Define the properties of WalletSettings here
  // For example:
  network: string;
  // Add other properties as needed
}

declare class SmartWallet {
  constructor(
    contractScript: string,
    name: string,
    settings: WalletSettings,
    script: SpendingValidator
  );

  private readonly lucid: Lucid;
  private readonly script: SpendingValidator;
  private readonly utxos: UTxO[];
  private readonly addressNames: Record<string, string>;
  private readonly defaultAddress: string;

  getAddress(): string;
  // Declare other public methods here
}

export { SmartWallet, WalletSettings };
