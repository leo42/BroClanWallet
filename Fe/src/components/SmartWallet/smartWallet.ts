import { TxSignBuilder, Data, applyParamsToScript, SpendingValidator, Assets, UTxO, Datum, Redeemer , Delegation, LucidEvolution , validatorToAddress, validatorToRewardAddress, getAddressDetails} from "@lucid-evolution/lucid";
import { getNewLucidInstance, changeProvider } from "../../helpers/newLucidEvolution";
interface WalletSettings {
  network: string;
  // Add other necessary settings
}

interface Recipient {
  address: string;
  amount: Assets;
}

class SmartWallet {
  private lucid!: LucidEvolution ;
  private script: SpendingValidator ;
  private utxos: UTxO[] = [];
  private delegation: Delegation = { poolId: null, rewards: BigInt(0) };
  private pendingTxs: { tx: any; signatures: Record<string, string> }[] = [];
  private addressNames: Record<string, string> = {};
  private defaultAddress: string = "";

  constructor(private id: string, private name: string, settings: WalletSettings, script: string) {
    
    this.script = {type: "PlutusV3", script: applyParamsToScript(script, [Data.to(this.id)])}

    this.initializeLucid(settings);
    
  }

  private async initializeLucid(settings: WalletSettings): Promise<void> {
    try {
      this.lucid = await getNewLucidInstance(settings);
      this.lucid.selectWallet.fromAddress( this.getAddress(), this.utxos);
      await this.loadUtxos();
    } catch (e) {
      console.error(e);
      throw new Error("Error creating new Lucid Instance: " + e);
    }
  }
  
  async initialize( ): Promise<void> {
    
  }

  async changeSettings(settings: WalletSettings): Promise<void> {
    if (settings.network !== this.lucid.config().network) {
      this.utxos = [];
      this.delegation = { poolId: null, rewards: BigInt(0) };
    }

    try {
      await changeProvider(this.lucid, settings);
      await this.loadUtxos();
    } catch (e) {
      throw new Error('Invalid Connection Settings: ' + e);
    }
  }


  getAddress(): string {
    return validatorToAddress(this.lucid.config().network, this.script);
  }

  getName(): string {
    return this.name;
  }

  async getDelegation(): Promise<Delegation> {
    const rewardAddress = validatorToAddress(this.lucid.config().network, this.script);

    this.delegation = await this.lucid.config().provider.getDelegation(rewardAddress);
    return this.delegation;
  }

  getBalance(address: string = ""): bigint {
    let result = BigInt(0);
    this.utxos.forEach(utxo => {
      if (address === "" || utxo.address === address) {
        result += BigInt(utxo.assets.lovelace);
      }
    });
    return result + BigInt(this.delegation.rewards || 0);
  }

  getBalanceFull(address: string = ""): Assets {
    const result: Assets = {};
    this.utxos.forEach(utxo => {
      if (address === "" || utxo.address === address) {
        Object.entries(utxo.assets).forEach(([asset, amount  ]) => {
          result[asset] = (result[asset] || BigInt(0)) + BigInt(amount);
        });
      }
    });
    if (result["lovelace"]) {
      result["lovelace"] += BigInt(this.delegation.rewards || 0);
    }
    return result;
  }

  async loadUtxos(): Promise<void> {
    try {
      const utxos = await this.lucid.utxosAt(this.getAddress());
      if (this.compareUtxos(utxos, this.utxos)) return;
      this.utxos = utxos;
      await this.getDelegation();
    } catch (e) {
      console.error("Error loading UTXOs:", e);
    }
  }


  private compareUtxos(a: UTxO[], b: UTxO[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((utxo, index) => 
      utxo.txHash === b[index].txHash && utxo.outputIndex === b[index].outputIndex
    );
  }
  
  async createTx(
    recipients: Recipient[],
    datums: Datum[],
    redeemer: Redeemer,
    sendAll: number | null = null,
    withdraw: boolean = true
  ): Promise<TxSignBuilder> {
    const tx = this.lucid.newTx();

    recipients.forEach((recipient, index) => {
      if (sendAll !== index) {
        tx.pay.ToAddress(recipient.address, recipient.amount);
      }
    });

    if (withdraw && this.delegation.rewards && BigInt(this.delegation.rewards) > 0) {
      tx.withdraw(validatorToRewardAddress( this.lucid.config().network, this.script), BigInt(this.delegation.rewards));
    }

    tx.attach.SpendingValidator(this.script)
      .collectFrom(this.utxos, redeemer);

    const returnAddress = sendAll !== null ? recipients[sendAll].address : this.getAddress();

    const completedTx = await tx.complete({ changeAddress: returnAddress });
    this.pendingTxs.push({ tx: completedTx, signatures: {} });
    return completedTx;
  }

  async createStakeUnregistrationTx(): Promise<TxSignBuilder> {
    const rewardAddress = validatorToRewardAddress(this.lucid.config().network, this.script);
    const tx = this.lucid.newTx()
      .deRegisterStake(rewardAddress)
      .attach.SpendingValidator(this.script)
      .collectFrom(this.utxos, Data.void());
      
    if (this.delegation.rewards && BigInt(this.delegation.rewards) > 0) {
      tx.withdraw(rewardAddress, BigInt(this.delegation.rewards));
    }

    const completedTx = await tx.complete({ changeAddress: this.getAddress()  });
    this.pendingTxs.push({ tx: completedTx, signatures: {} });
    return completedTx;
  }

  async createDelegationTx(pool: string): Promise<TxSignBuilder> {
    const rewardAddress = validatorToRewardAddress( this.lucid.config().network, this.script);
    const tx = this.lucid.newTx()
      .delegateTo(rewardAddress, pool)
      .attach.CertificateValidator(this.script)
      .collectFrom(this.utxos, Data.void());

    if (this.delegation.poolId === null) {
      tx.registerStake(rewardAddress);
    }

    const completedTx = await tx.complete({ changeAddress:  this.getAddress() });
    this.pendingTxs.push({ tx: completedTx, signatures: {} });
    return completedTx;
  }

  isAddressMine(address: string): boolean {
    return getAddressDetails(address).paymentCredential?.hash ===
           getAddressDetails(this.getAddress()).paymentCredential?.hash;
  }

  isAddressValid(address: string): boolean {
    try {
      return !! getAddressDetails(address);
    } catch (e) {
      return false;
    }
  }

  isAddressScript(address: string): boolean {
    return getAddressDetails(address).paymentCredential?.type === "Script";
  }

  async submitTransaction(index: number): Promise<Boolean> {
    try {
      const tx = this.pendingTxs[index];
      const signedTx = await tx.tx.assemble(Object.values(tx.signatures)).complete();
      const txHash = await signedTx.submit();
      return this.lucid.awaitTx(txHash, 2500);
    } catch (e : any) {
      console.error(e);
      const errorMessage = e.message ? e.message : JSON.stringify(e);
      throw new Error(errorMessage);
    }
  }

  setDefaultAddress(address: string): void {
    this.defaultAddress = address;
  }

  setAddressNames(names: Record<string, string>): void {
    this.addressNames = names;
  }

  changeAddressName(address: string, name: string): void {
    this.addressNames[address] = name;
  }

  getDefaultAddress(): string {
    return this.defaultAddress || this.getAddress();
  }

  getAddressNames(): Record<string, string> {
    return this.addressNames;
  }

  getAddressName(address: string): string {
    return this.addressNames[address] || (address === this.getAddress() ? "Regular Address" : address);
  }
}

export default SmartWallet;