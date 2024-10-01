import { TxSignBuilder, Data, Credential, CBORHex , makeTxSignBuilder ,applyParamsToScript, validatorToScriptHash, applyDoubleCborEncoding, Validator, Assets, UTxO, Datum, Redeemer , Delegation, LucidEvolution , validatorToAddress, validatorToRewardAddress, getAddressDetails, mintingPolicyToId, Constr} from "@lucid-evolution/lucid";
import { getNewLucidInstance, changeProvider } from "../../helpers/newLucidEvolution";
import contracts from "./contracts.json";
import { Settings } from "../../types/app";
import { encode , decode } from "./encoder";
import { SmartMultisigJson , SmartMultisigDescriptorType} from "./types";
import { Transaction , TransactionWitnessSet } from '@anastasia-labs/cardano-multiplatform-lib-browser';
interface Recipient {
  address: string;
  amount: Assets;
}


class SmartWallet {
  private lucid!: LucidEvolution ;
  private script: Validator ;
  private utxos: UTxO[] = [];
  private delegation: Delegation = { poolId: null, rewards: BigInt(0) };
  private pendingTxs: { tx: TxSignBuilder; signatures: Record<string, string> }[] = [];
  private signerNames: {hash: string, name: string, isDefault: boolean}[] = [];
  private defaultAddress: string = "";
  private addressNames: Record<string, string> = {};
  private config: SmartMultisigJson | null = null;
  private id: string;
  private settings: Settings;
  constructor(id: string, settings: Settings) {
    this.settings = settings
    this.id = id;
    this.script = {
      type: "PlutusV3",
      script: applyParamsToScript(applyDoubleCborEncoding(contracts[this.settings.network].wallet), [id])
    };


    
  }


  async initializeLucid(): Promise<void> {
    try {
      this.lucid = await getNewLucidInstance(this.settings);
      this.lucid.selectWallet.fromAddress( this.getAddress(), this.utxos);
      await this.loadUtxos();
    } catch (e) {
      console.error(e);
      throw new Error("Error creating new Lucid Instance: " + e);
    }
  }
  


  async changeSettings(settings: any): Promise<void> {
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

  getName(): string {
    return "Todo"
  }

  removePendingTx(tx: number) {
    this.pendingTxs.splice(tx, 1);
  }

  getPendingTxs(): { tx: CBORHex; signatures: Record<string, string> }[] {
    return this.pendingTxs.map(tx => ({ tx: tx.tx.toCBOR({canonical: true}), signatures: tx.signatures }));
  }

  addPendingTx(tx: { tx: CBORHex, signatures:  Record<string, string>}): void {
    const txBuilder = makeTxSignBuilder(this.lucid.config(), Transaction.from_cbor_hex(tx.tx))
    this.pendingTxs.push({tx: txBuilder, signatures: tx.signatures});
  }

  getAddress(): string {
    const stakeCredential = { type : `Script` as any , hash : validatorToScriptHash(this.script) }

    return validatorToAddress(this.lucid.config().network, this.script, stakeCredential);
  }

  getEnterpriseAddress(): string {
    return validatorToAddress(this.lucid.config().network, this.script);
  }



  async getDelegation(): Promise<Delegation> {
    const rewardAddress = validatorToAddress(this.lucid.config().network, this.script);

    const rewardAddress = validatorToRewardAddress(this.lucid.config().network, this.script);
    this.delegation = await this.lucid.config().provider.getDelegation(rewardAddress);
    return this.delegation;
  }

  getFundedAddress() : string[] {
    const utxos = this.utxos
    let result : string[] = []
    utxos.map( utxo => {
      result.push(utxo.address);
        
       }
      )
      
    return  [...new Set(result)]; 
  }

  getBalance(address: string = ""): number {
    let result = BigInt(0);
    this.utxos.forEach(utxo => {
      if (address === "" || utxo.address === address) {
        result += BigInt(utxo.assets.lovelace);
      }
    });
    return Number(result + BigInt(this.delegation.rewards || 0));
  }
  getContract() : Validator {
    return this.script
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

  async getConfigUtxo(): Promise<UTxO> {
    const policyId = mintingPolicyToId({ type : "PlutusV3", script: contracts[this.settings.network].minting.script})
    console.log("policyId", policyId)
    const configUtxo = await this.lucid.config().provider.getUtxoByUnit(policyId + "00" + this.id);
    return configUtxo
  }

  async getConfig(): Promise<SmartMultisigJson> {
    try {
      const configUtxo = await this.getConfigUtxo();
      const config : SmartMultisigJson = decode(configUtxo?.datum as string)
      this.config = config
      this.signerNames = this.loadSignerNames(config)
      console.log("configUtxo", config)
      return config
    } catch (e) {
      console.error("Error getting config:", e);
      return Promise.reject(e);
    }
  }

  getCollateralDonor() : string{
    return this.signerNames[0]? this.signerNames[0].hash : ""
  }

  defaultSignersValid (signers: string[]) : boolean {
    return true //TODO
  }
  // // export type SmartMultisigJson = 
  // | { Type: SmartMultisigDescriptorType.KeyHash, keyHash: { name: string, keyHash: string } }
  // | { Type: SmartMultisigDescriptorType.NftHolder, nftHolder: { name: string, policy: string } }
  // | { Type: SmartMultisigDescriptorType.AtLeast, atLeast: { m: number, scripts: SmartMultisigJson[] } }
  // | { Type: SmartMultisigDescriptorType.Before, before: { time: number } }
  // | { Type: SmartMultisigDescriptorType.After, after: { time: number } }

  loadSignerNames(config : SmartMultisigJson): {hash: string, name: string, isDefault: boolean}[] {
    let signerNames : {hash: string, name: string, isDefault: boolean}[] = []

    switch (config.Type) {
      case SmartMultisigDescriptorType.KeyHash:
        signerNames.push({ hash: config.keyHash.keyHash, name: config.keyHash.name, isDefault: false})
        break
      case SmartMultisigDescriptorType.NftHolder:
        //TODO get signer and delegation
        break
      case SmartMultisigDescriptorType.AtLeast:
        const subAddresses = config.atLeast.scripts.map(script => this.loadSignerNames(script))
        subAddresses.forEach(address => {
          signerNames = [...signerNames, ...address]
        })
        break
      case SmartMultisigDescriptorType.Before:
        break
      case SmartMultisigDescriptorType.After:
        break
    }
    console.log(signerNames)
    return signerNames

  }

  async loadUtxos(): Promise<void> {
    try {
      const scriptCredential = { type : `Script` as any , hash : validatorToScriptHash(this.script) }
      const utxos = await this.lucid.utxosAt(scriptCredential);
      console.log("utxos", utxos)
      await this.getConfig()
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
    signers: string[],
    sendFrom: string = "",
    sendAll: number | null = null,
    withdraw: boolean = true
  ) {
    const returnAddress = sendAll !== null ? recipients[sendAll].address : this.getAddress();

    console.log("createTx", recipients, signers, sendFrom, sendAll, withdraw,returnAddress)
    console.time("createTx")
    if(signers.length === 0) {
      throw new Error("No signers provided")
    }
    console.timeEnd("createTx")
    console.time("getConfigUtxo")
    const collateralProvider = signers[0];
    const collateralUtxos = (await this.lucid.config().provider.getUtxos({ type: "Key", hash: collateralProvider }))
                                  .filter(utxo => Object.keys(utxo.assets).length === 1 && utxo.assets.lovelace > 5_000_000n);

    if (collateralUtxos.length === 0) {
      throw new Error("No valid collateral UTXO found");
    }

    const policyId = mintingPolicyToId({ type : "PlutusV3", script: contracts[this.settings.network].minting.script})
    console.log("policyId", policyId)
    const scriptUtxo = await this.lucid.config().provider.getUtxoByUnit(policyId + "02" + this.id);
    console.timeEnd("getConfigUtxo")
    console.time("getConfig")

    const collateralUtxo = collateralUtxos[0];
    const configUtxo = await this.getConfigUtxo();
    console.log("collateralUtxo", collateralUtxo, this.utxos, configUtxo);
    console.timeEnd("getConfig")
    console.time("newLucid")
    const localLucid = await getNewLucidInstance(this.settings);
    localLucid.selectWallet.fromAddress(returnAddress, [collateralUtxo]);
    const tx = localLucid.newTx()
    //  .attach.Script(this.script)
      .collectFrom(this.utxos, Data.void())
      .readFrom([configUtxo, scriptUtxo])

    recipients.forEach((recipient, index) => {
      if (sendAll !== index) {
        tx.pay.ToAddress(recipient.address, recipient.amount);
      }
    });
    
    signers.forEach(signer => {
      tx.addSignerKey(signer)
    })

    
    // Add collateral UTXO explicitly
    // tx.collectFrom([collateralUtxo]).pay.ToAddress(collateralUtxo.address, {lovelace: collateralUtxo.assets.lovelace - 1000000n })
      

  
     const completedTx = await tx.complete({ 
       setCollateral : 1000000n,
       coinSelection : false,
       localUPLCEval: true,
       changeAddress: returnAddress,
     });
     const txBuilder = makeTxSignBuilder(this.lucid.config(), Transaction.from_cbor_hex(completedTx.toCBOR({canonical: true})))

     this.pendingTxs.push({ tx: txBuilder , signatures: {} });
     return completedTx;
}




async createUpdateTx(
  signers: string[],
  newConfig: SmartMultisigJson
) {
  const configUtxo = await this.getConfigUtxo();
  const enterpriseAddress = this.getEnterpriseAddress()

  const collateralUtxo = await this.getColateralUtxo(signers);

  const collateralProvider = signers[0];
  const collateralUtxos = (await this.lucid.config().provider.getUtxos({ type: "Key", hash: collateralProvider }))
  const localLucid = await getNewLucidInstance(this.settings);
  localLucid.selectWallet.fromAddress(collateralUtxos[0].address,collateralUtxos);
  
  const cleanNewConfig = this.cleanConfig(newConfig);
  const encodedConfig = encode(cleanNewConfig);
  const tx = localLucid.newTx()
  .collectFrom([configUtxo], Data.to(new Constr(0, [])))
  .collectFrom([collateralUtxo])
  .attach.Script({ type: "PlutusV3", script: contracts[this.settings.network].configHost})
  .pay.ToAddressWithData( configUtxo.address, {kind : "inline" , value : encodedConfig}, configUtxo.assets)

  signers.forEach(signer => {
    tx.addSignerKey(signer)
  })

  const completedTx = await tx.complete({ 
    setCollateral : 1000000n,
    coinSelection : false,
    localUPLCEval: true,
    changeAddress: this.getAddress(),
  });
  const txBuilder = makeTxSignBuilder(this.lucid.config(), Transaction.from_cbor_hex(completedTx.toCBOR({canonical: true})))

  this.pendingTxs.push({ tx: txBuilder , signatures: {} });
  return completedTx;
}

private cleanConfig(config: SmartMultisigJson): SmartMultisigJson {
  switch (config.Type) {
    case SmartMultisigDescriptorType.KeyHash:
      if (this.isAddressValid(config.keyHash.keyHash)) {
        const addressDetails = getAddressDetails(config.keyHash.keyHash);
        if (addressDetails.paymentCredential?.type === 'Key') {
          return {
            ...config,
            keyHash: {
              ...config.keyHash,
              keyHash: addressDetails.paymentCredential.hash
            }
          };
        }
      }
      if (!this.isValidKeyHash(config.keyHash.keyHash)) {
        throw new Error(`Invalid key hash or address: ${config.keyHash.keyHash}`);
      }
      return config;
    case SmartMultisigDescriptorType.AtLeast:
      return {
        ...config,
        atLeast: {
          ...config.atLeast,
          scripts: config.atLeast.scripts.map(script => this.cleanConfig(script))
        }
      };
    case SmartMultisigDescriptorType.NftHolder:
    case SmartMultisigDescriptorType.Before:
    case SmartMultisigDescriptorType.After:
      return config;
    default:
      throw new Error(`Unknown config type: ${(config as any).Type}`);
  }
}

private isValidKeyHash(hash: string): boolean {
  // A valid key hash is a 28-byte (56 character) hexadecimal string
  return /^[0-9a-fA-F]{56}$/.test(hash);
}

  
  private async getColateralUtxo(signers: string[]) : Promise<UTxO>{
    const collateralProvider = signers[0];
    const collateralUtxos = (await this.lucid.config().provider.getUtxos({ type: "Key", hash: collateralProvider }))
      .filter(utxo => Object.keys(utxo.assets).length === 1 && utxo.assets.lovelace > 5000000n);

    if (collateralUtxos.length === 0) {
      throw new Error("No valid collateral UTXO found");
    }

    const collateralUtxo = collateralUtxos[0];
    return collateralUtxo
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

    const completedTx = await tx.complete({ setCollateral : 10000000n, changeAddress:  this.getAddress()  });
    this.pendingTxs.push({ tx : completedTx , signatures: {} });
    return completedTx;
  }

  async createDelegationTx(pool: string, signers: string[]): Promise<TxSignBuilder> {
    console.log("createDelegationTx", pool, signers)
    const rewardAddress = validatorToRewardAddress( this.lucid.config().network, this.script);

    const localLucid = await getNewLucidInstance(this.settings);
    const collateralUtxo = await this.getColateralUtxo(signers);
    const configUtxo = await this.getConfigUtxo();
    const policyId = mintingPolicyToId({ type : "PlutusV3", script: contracts[this.settings.network].minting.script})

    const scriptUtxo = await this.lucid.config().provider.getUtxoByUnit(policyId + "02" + this.id);


    localLucid.selectWallet.fromAddress(this.getAddress(), [collateralUtxo]);
    
    const tx = localLucid.newTx()
      .delegateTo(rewardAddress, pool, Data.void())
      .collectFrom(this.utxos, Data.void())
      .readFrom([configUtxo, scriptUtxo])

    if (this.delegation.poolId === null) {
      tx.registerStake(rewardAddress);
    }

    signers.forEach(signer => {
      tx.addSignerKey(signer)
    })

    const completedTx = await tx.complete({ setCollateral : 10000000n, changeAddress:  this.getAddress(), coinSelection: true, localUPLCEval: true });
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
      
      // Ensure we're only including necessary witnesses
      const necessarySignatures = Object.values(tx.signatures).filter(sig => sig !== null && sig !== undefined);
      
      // Assemble the transaction with only necessary signatures
      const signedTx = await tx.tx.assemble(necessarySignatures).complete();
  
      // Submit the transaction
      const txHash = await signedTx.submit();
  
      // Wait for confirmation
      return this.lucid.awaitTx(txHash, 2500);
    } catch (e : any) {
      console.error(e);
      const errorMessage = e.message ? e.message : JSON.stringify(e);
      throw new Error(errorMessage);
    }
  }

  getId(): string {
    return this.id;
  }

  checkSigners(signers: string[]){
    console.log(signers)
    return true
  }
  getSigners(): {hash: string, name: string, isDefault: boolean}[] {
    console.log(this.signerNames)
    return this.signerNames

  }

  decodeSignature(signature : string) : {signature: string, signer: string, witness: TransactionWitnessSet} {
    try{
    const witness = TransactionWitnessSet.from_cbor_hex(signature);
    const signer = witness.vkeywitnesses()?.get(0)?.vkey().hash().to_hex() ?? '';
    return { signature, signer, witness };
    } catch (f) {
      try {
          const witness = TransactionWitnessSet.from_cbor_hex("a10081" + signature);
          const signer = witness.vkeywitnesses()?.get(0)?.vkey().hash().to_hex() ?? '';
          return {signature : "a10081" + signature, signer: signer , witness : witness}             
      }catch(e){
        console.log(e)
        throw new Error('Decoding Failed, Invalid signature');
    }
  } }

  hexToBytes(hex : string) : Uint8Array {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.slice(c, c + 2), 16));
    return new Uint8Array(bytes);
  }

  
  addSignature(signature: string) {
    const signatureInfo = this.decodeSignature(signature);
    let valid = false;
    console.log(signatureInfo);
  
    for (let index = 0; index < this.pendingTxs.length; index++) {
      const vkeyWitness = signatureInfo.witness.vkeywitnesses()?.get(0);
      if (vkeyWitness) {
        const txHash = this.pendingTxs[index].tx.toHash();
        const ed25519Signature = signatureInfo.witness.vkeywitnesses()?.get(0)?.ed25519_signature();
        if (ed25519Signature && vkeyWitness.vkey().verify(this.hexToBytes(txHash), ed25519Signature)) {
          valid = true;
          if (!(signatureInfo.signer in this.pendingTxs[index].signatures)) {
            this.pendingTxs[index].signatures[signatureInfo.signer] = signatureInfo.signature;
            return this.pendingTxs[index];
          } else {
            throw new Error('Signature already registered');
          }
        }
      }
    }
  
    if (!valid) {
      throw new Error('Invalid Signature');
    }
  }


  decodeTransaction(tx: string) {
    const txBody = Transaction.from_cbor_hex(tx).body().to_js_value();
    
    // Simplify the outputs
    if (txBody.outputs) {
      txBody.outputs = txBody.outputs.map((output: any) => {
        // Check if the output is an object with a single key (format type)
        const formatKeys = Object.keys(output);
        if (formatKeys.length === 1 && typeof output[formatKeys[0]] === 'object') {
          // Return the inner object, which contains the actual output data
          return output[formatKeys[0]];
        }
        return output;
      });
    }
    if (txBody.inputs) {
      txBody.inputs = txBody.inputs.map((input: any) => {
        // Check if the input is an object with a single key (format type)
        const formatKeys = Object.keys(input);
        if (formatKeys.length === 1 && typeof input[formatKeys[0]] === 'object') {
          // Return the inner object, which contains the actual input data
          return input[formatKeys[0]];
        }
        return input;
      });
    }
    if (txBody.collateral_return) {
      const formatKeys = Object.keys(txBody.collateral_return);
      if (formatKeys.length === 1 && typeof txBody.collateral_return[formatKeys[0]] === 'object') {
        txBody.collateral_return = txBody.collateral_return[formatKeys[0]];
      }
    }
    console.log(txBody)
    return txBody;
  }

  async getUtxosByOutRef(OutputRef: {transaction_id: string, index: string}[])  {
    const resault= await this.lucid.config().provider.getUtxosByOutRef(OutputRef.map( outRef =>({txHash:outRef.transaction_id, outputIndex:Number(outRef.index)})))
    return resault
  }

  getPendingTxDetails(index: number){
      console.log(this.pendingTxs, index, this.pendingTxs[index])
      try {

        
        const txDetails = this.decodeTransaction(this.pendingTxs[index].tx.toCBOR({canonical: true}))

      const signatures =  txDetails.required_signers ?  txDetails.required_signers.map( (keyHash: any) => (
        {name:  "TODO" , keyHash:keyHash , haveSig: (keyHash in this.pendingTxs[index].signatures ? true : false)}
      )) : []

      return { ...txDetails, signatures}
    } catch (e) {
      console.log(e)

    }
  }
  setDefaultAddress(address: string): void {
    this.defaultAddress = address;
  }

  setAddressNames(names: Record<string, string>): void {
    this.addressNames = names;
  }

  changeAddressName(address: string, name: string): void {

  }

  getDefaultAddress(): string {
    return this.defaultAddress || this.getAddress();
  }

  getAddressNames(): Record<string, string> {
    return this.addressNames;
  }

  getAddressName(address: string) {

  }
}

export default SmartWallet;