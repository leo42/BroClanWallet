import { TxSignBuilder, Data, DRep, CBORHex , makeTxSignBuilder ,applyParamsToScript, validatorToScriptHash, applyDoubleCborEncoding, Validator, Assets, UTxO, Datum, Redeemer , Delegation, LucidEvolution , validatorToAddress, validatorToRewardAddress, getAddressDetails, mintingPolicyToId, Constr, credentialToRewardAddress, TxBuilder, unixTimeToSlot} from "@lucid-evolution/lucid";
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

type extraRequirements = { inputs?: UTxO[], refInputs?: UTxO[], before?: number, after?: number }



class SmartWallet {
  private lucid!: LucidEvolution ;
  private script: Validator ;
  private utxos: UTxO[] = [];
  private configUtxo: UTxO | null = null;
  private scriptUtxo: UTxO | null = null;
  private colateralUtxo : UTxO | null = null;
  private nftUtxos: UTxO[] = [];
  private delegation: Delegation = { poolId: null, rewards: BigInt(0) };
  private pendingTxs: { tx: TxSignBuilder; signatures: Record<string, string> }[] = [];
  private signerNames: {hash: string,  isDefault: boolean}[] = [];
  private defaultAddress: string | null = null;
  private addressNames: Record<string, string> = {};
  private config: SmartMultisigJson  = {Type: SmartMultisigDescriptorType.KeyHash, keyHash: ""}
  private id: string;
  private settings: Settings;
  private collateralDonor: string | null = null;
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

  getAddress(stakingAddress: string = ""): string {
    if(stakingAddress === ""){
    const stakeCredential = { type : `Script` as any , hash : validatorToScriptHash(this.script) }

    return validatorToAddress(this.lucid.config().network, this.script, stakeCredential);
    }
    else{
      const stakeCredential = getAddressDetails(stakingAddress).stakeCredential
      return validatorToAddress(this.lucid.config().network, this.script, stakeCredential);
    }
  }

  getEnterpriseAddress(): string {
    return validatorToAddress(this.lucid.config().network, this.script);
  }



  async getDelegation(): Promise<Delegation> {
    const rewardAddress = validatorToRewardAddress(this.lucid.config().network, this.script);
    // const rewardAddress = credentialToRewardAddress(this.lucid.config().network, getAddressDetails("addr_test1xrujtjctsdvm43g633cc823ctyz3453t89qj0yj3evakdhheyh9shq6ehtz34rr3sw4rskg9rtfzkw2py7f9rjemvm0qnusdr8").stakeCredential as Credential)
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

  getConfig(): SmartMultisigJson {
    return this.config
  }

  async loadConfig(): Promise<SmartMultisigJson> {
    try {
      const configUtxo = await this.getConfigUtxo();
      this.configUtxo = configUtxo

        const config : SmartMultisigJson = decode(configUtxo?.datum as string)
      this.config = config
      const signers = await this.loadSigners(config)
      this.signerNames = signers.signers
      this.nftUtxos  =   signers.nftUtxos
      try{
        const policyId = mintingPolicyToId({ type : "PlutusV3", script: contracts[this.settings.network].minting.script})
        const scriptUtxo = await this.lucid.config().provider.getUtxoByUnit(policyId + "02" + this.id);
        this.scriptUtxo = scriptUtxo
      }
      catch(e){
        console.error("Error getting script utxo:", e);
      }
      return config
    } catch (e) {
      console.error("Error getting config:", e);
      return Promise.reject(e);
    }
  }

  getCollateralDonor() : string{

    return this.collateralDonor ? this.collateralDonor : ""
  }

  defaultSignersValid (signers: string[]) : boolean {
    return true //TODO
  }

  async loadSigners(config : SmartMultisigJson): Promise<{ nftUtxos: UTxO[], signers: {hash: string,  isDefault: boolean}[]}> {
    let signers : {hash: string,  isDefault: boolean}[] = []
    let nftUtxos : UTxO[] = []
    switch (config.Type) {
      case SmartMultisigDescriptorType.KeyHash:
        signers.push({ hash: config.keyHash, isDefault: false})
        break
      case SmartMultisigDescriptorType.NftHolder:
        const utxo = await this.lucid.config().provider.getUtxoByUnit(config.policy + config.name)
        nftUtxos = [...nftUtxos, utxo]
        signers.push({ hash: getAddressDetails(utxo.address).paymentCredential?.hash as string, isDefault: false})
        try{
          const subConfig : SmartMultisigJson = decode(utxo?.datum as string)
          const subAddresses = await this.loadSigners(subConfig)
          signers = [...signers, ...subAddresses.signers] // Correctly spread the array of addresses
          nftUtxos = [...nftUtxos, ...subAddresses.nftUtxos]
        } catch (e) {
          console.error("Error loading signers:", e) // Use console.error for consistency
        }
        
        break
      case SmartMultisigDescriptorType.AtLeast:
        const subAddresses = await Promise.all(config.scripts.map(script => this.loadSigners(script)))
        subAddresses.forEach(address => {
          signers = [...signers, ...address.signers]
          nftUtxos = [...nftUtxos, ...address.nftUtxos]
        })
        break
      case SmartMultisigDescriptorType.Before:
        break
      case SmartMultisigDescriptorType.After:
        break
    }
    return {signers, nftUtxos}

  }

  async loadUtxos(): Promise<boolean> {
    try {
      const scriptCredential = { type : `Script` as any , hash : validatorToScriptHash(this.script) }
      const utxos = await this.lucid.utxosAt(scriptCredential);
      if (this.compareUtxos(utxos, this.utxos)) return false;
      
      this.utxos = utxos;
      await Promise.all([
        this.getDelegation(),
        this.loadConfig(),
        this.checkTransactions()
      ]);

      return true
    } catch (e) {
      console.error("Error loading UTXOs:", e);
      return false
    }
  }


  private compareUtxos(a: UTxO[], b: UTxO[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((utxo, index) => 
      utxo.txHash === b[index].txHash && utxo.outputIndex === b[index].outputIndex
    );
  }

  async checkTransactions() {
    
    const checkPromises = this.pendingTxs.map(async (pendingTx, index) => {
      const isValid = await this.checkTransaction(pendingTx.tx.toCBOR({canonical: true}));
      return { index, isValid };
    });
  
    const results = await Promise.all(checkPromises);
  
    // Remove invalid transactions in reverse order to avoid index issues
    for (let i = results.length - 1; i >= 0; i--) {
      if (!results[i].isValid) {
        this.removePendingTx(results[i].index);
      }
    }
  }

  async checkTransaction(tx: string){
    const utxos = this.utxos
    const transactionDetails = this.decodeTransaction(tx)
    
      const inputsUtxos =  await this.getUtxosByOutRef(transactionDetails.inputs)


      for (let i = 0; i < inputsUtxos.length; i++) {  
      if (this.isAddressMine(inputsUtxos[i].address)){


        // if the utxo is not in my this.utxos return false
        if (utxos.find(WalletUtxo => WalletUtxo.txHash === inputsUtxos[i].txHash && WalletUtxo.outputIndex === inputsUtxos[i].outputIndex)){
         
        }else{
          return false
        }
      }
    }
    return true
     }

  mergeAssets(assets1: Assets, assets2: Assets): Assets {
     //assets are object Key value pair s we want to add the values of the second object to the first
     Object.keys(assets2).forEach(asset => {
      assets1[asset as keyof Assets] = (assets1[asset as keyof Assets] || 0n) + assets2[asset as keyof Assets]
     })
     return assets1;
  }
  
  async createTx(
    recipients: Recipient[],
    signers: string[],
    sendFrom: string = "",
    sendAll: number | null = null,
    withdraw: boolean = true
  ) {

    const returnAddress = sendAll !== null ? recipients[sendAll].address : sendFrom ? sendFrom : this.getAddress();
    const tx = await this.createTemplateTx(signers, returnAddress)

    console.log("createTx", recipients, signers, sendFrom, sendAll, withdraw,returnAddress)
    let spendUtxos: UTxO[] = this.utxos;
    if (sendFrom !== "") {
      spendUtxos =spendUtxos.filter(utxo => utxo.address === sendFrom)
    }


    if(sendAll === null){
      const value = recipients.reduce((total, recipient) => ( this.mergeAssets(total, recipient.amount) ), {} as Assets)
      spendUtxos = await this.coinSelection(value, spendUtxos)
    }
    
    //  .attach.Script(this.script)
    tx.collectFrom(spendUtxos, Data.void());
    recipients.forEach((recipient, index) => {
      if (sendAll !== index) {
        tx.pay.ToAddress(recipient.address, recipient.amount);
      }
    });
  
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

getDefaultSigners() : string[] {
  return this.signerNames.filter(signer => signer.isDefault).map(signer => signer.hash)
}

async setCollateralDonor(paymentKeyHash: string){
  this.collateralDonor = paymentKeyHash
  await this.loadCollateralUtxos()
}

async loadCollateralUtxos(){
  if (this.collateralDonor) {
    try{
      this.colateralUtxo = await this.pullCollateralUtxo(this.collateralDonor as string)
     }catch(e){
      console.error("Error getting collateral utxos:", e);
    }
  }
}

setDefaultSigners(signers: string[]) {
   this.signerNames = this.signerNames.map(signer => {
    if (signers.includes(signer.hash)) {
      return {...signer, isDefault: true}
    }else{
      return {...signer, isDefault: false}
    }
   })
   if (!signers.includes(this.collateralDonor as string )) {
    this.collateralDonor = signers[0]
    this.loadCollateralUtxos()
   }
}

async coinSelection(value: Assets, utxos: UTxO[]): Promise<UTxO[]> {

  function isEnoughValue(remaining: Assets): boolean {
    for (const asset in value) {
      if (remaining[asset] > 0n) {
        return false;
      }
    }
    return true;
  }

  function sortByLeft(utxos: UTxO[], value: Assets ) : UTxO[] {
    const targetAssets: string[] = Object.keys(value).filter(asset => value[asset] > 0n);

    const sortedUtxos = utxos.sort((a, b) => {
      //sort the utxos by the amount of the target assets left
      const aLeft = targetAssets.reduce((acc, asset) => acc + BigInt(a.assets[asset as keyof Assets] || 0), 0n);
      const bLeft = targetAssets.reduce((acc, asset) => acc + BigInt(b.assets[asset as keyof Assets] || 0), 0n);
      return Number(bLeft - aLeft);
    });
    return sortedUtxos
  }


  // Sort UTXOs in descending order of lovelace value
  let availableUtxos = utxos
  let selectedUtxos: UTxO[] = [];
  let totalRemaining: Assets = value;

  // Iterate through sorted UTXOs
  while (availableUtxos.length > 0) {
    let sortedUtxos = sortByLeft(availableUtxos, value);
    const utxo = sortedUtxos[0]
    selectedUtxos.push(utxo);
    availableUtxos = availableUtxos.filter(utxo => utxo.txHash !== utxo.txHash && utxo.outputIndex !== utxo.outputIndex)
  
    // Add all assets from the current UTXO to totalRemaining
    for (const asset in utxo.assets) {
        if (!totalRemaining[asset]) {
        totalRemaining[asset] = 0n;
      }
      totalRemaining[asset] -= BigInt(utxo.assets[asset]);
    }

    // Check if we have enough to cover the requested value
    if (isEnoughValue(totalRemaining)) {
      return selectedUtxos;
    }
    console.log("sortedUtxos", sortedUtxos, totalRemaining, selectedUtxos)
  }

  // If we reach here, it means we don't have enough UTXOs to cover the value
  throw new Error('Insufficient funds to cover the requested value');
}


async createUpdateTx(
  signers: string[],
  newConfig: SmartMultisigJson
) {
  const requrement = this.checkSigners(signers)
  if (requrement === false) {
    throw new Error("Invalid signers")
  }
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

  if (requrement.refInputs !== undefined && requrement.refInputs.length > 0) {
    console.log("refInputs", requrement.refInputs)
    tx.readFrom(requrement.refInputs)
  }
  if(requrement.inputs !== undefined && requrement.inputs.length > 0) {
    requrement.inputs.forEach(input => {
      tx.collectFrom([input]).pay.ToAddress(input.address, input.assets)
    })
  }
  if(requrement.before !== undefined) {
    tx.validTo(requrement.before  -1000 ) 
  }
  
  if(requrement.after !== undefined) {
    tx.validFrom( requrement.after + 1000 )
  }

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
        if (this.isAddressValid(config.keyHash)) {
        const addressDetails = getAddressDetails(config.keyHash);
        if (addressDetails.paymentCredential?.type === 'Key') {
          return {
            ...config,
            keyHash: addressDetails.paymentCredential.hash
          };
        }
      }
      if (!this.isValidKeyHash(config.keyHash)) {
        throw new Error(`Invalid key hash or address: ${config.keyHash}`);
      }
      return config;
    case SmartMultisigDescriptorType.AtLeast:
      return {
        ...config,
          scripts: config.scripts.map(script => this.cleanConfig(script))
      };
    case SmartMultisigDescriptorType.NftHolder:
    case SmartMultisigDescriptorType.Before:
    case SmartMultisigDescriptorType.After:
    case SmartMultisigDescriptorType.ScriptRef:
      return config;
    default:
      throw new Error(`Unknown config type: ${(config as any).Type}`);
  }
}

private isValidKeyHash(hash: string): boolean {
  // A valid key hash is a 28-byte (56 character) hexadecimal string
  return /^[0-9a-fA-F]{56}$/.test(hash);
}
  
async getColateralUtxo(signers? : string[]) : Promise<UTxO> {
  if(this.colateralUtxo && signers?.includes(this.collateralDonor as string)) {
    return this.colateralUtxo
  }else if (signers) {
    for (const signer of signers) {
        const collateralUtxo = await this.pullCollateralUtxo(signer);
        if (collateralUtxo) {
            return collateralUtxo;
        }
    }
    return await this.pullCollateralUtxo(this.collateralDonor as string);
  }
  throw new Error("No collateral utxo found")
}         


   async pullCollateralUtxo(collateralProvider: string) : Promise<UTxO> {
    return ( await this.lucid.config().provider.getUtxos({ type: "Key", hash: collateralProvider }))
      .filter(utxo => Object.keys(utxo.assets).length === 1 && utxo.assets.lovelace > 5000000n)[0];
   }

  async createTemplateTx(signers: string[], returnAddress?: string): Promise<TxBuilder> {
    const requrement = this.checkSigners(signers)
    console.log("requrement", requrement)
    if (requrement === false) {
      throw new Error("Invalid signers")
    }
    
    const localLucid = await getNewLucidInstance(this.settings);
    const collateralUtxo = await this.getColateralUtxo(signers);
    const configUtxo = this.configUtxo ? this.configUtxo : await this.getConfigUtxo()

    localLucid.selectWallet.fromAddress(returnAddress ||this.getAddress(), [collateralUtxo]);
    const tx = localLucid.newTx()
    
    const readUtxos = [configUtxo]
    if(this.scriptUtxo) {
      readUtxos.push(this.scriptUtxo)
    }else{
      tx.attach.Script(this.script)
    }
    
    if (requrement.refInputs !== undefined && requrement.refInputs.length > 0) {
      readUtxos.push(...requrement.refInputs)
    }

    
    if(requrement.inputs !== undefined && requrement.inputs.length > 0) {
      requrement.inputs.forEach(input => {
        tx.collectFrom([input]).pay.ToAddress(input.address, input.assets)
      })
    }
    
    if(requrement.before !== undefined) {
      tx.validTo(requrement.before  -1000 ) 
    }
    
    if(requrement.after !== undefined) {
      tx.validFrom( requrement.after + 1000 )
    }
    
    signers.forEach(signer => {
      tx.addSignerKey(signer)
    })
    
    tx.readFrom(readUtxos)
    return tx;
    
  }

  async createStakeUnregistrationTx(signers: string[]): Promise<TxSignBuilder> {
    console.log("createDelegationTx", signers)
    const rewardAddress = validatorToRewardAddress( this.lucid.config().network, this.script);

    
    const tx = await this.createTemplateTx(signers)
      
    tx.collectFrom(this.utxos, Data.void())

    tx.deregister.Stake(rewardAddress, Data.void())
    tx.deregister.DRep(rewardAddress, Data.void())



    const completedTx = await tx.complete({ setCollateral : 1_000_000n, changeAddress:  this.getAddress(), coinSelection: true, localUPLCEval: true });
    this.pendingTxs.push({ tx: completedTx, signatures: {} });
    return completedTx;

  }

  async createDelegationTx(pool: string, dRepId: string, signers: string[]): Promise<TxSignBuilder> {
    const rewardAddress = validatorToRewardAddress(this.lucid.config().network, this.script);
    let dRep: DRep 
    
    if (dRepId === "Abstain") {
      dRep = { __typename: "AlwaysAbstain" };
    } else if (dRepId === "NoConfidence") {
      dRep = { __typename: "AlwaysNoConfidence" };
    } else {
      dRep = { "type" : "Script" , "hash" : dRepId} ;
    }
    const tx = await this.createTemplateTx(signers)

    tx.collectFrom(this.utxos, Data.void())

    if (this.delegation.poolId === null) {
      console.log("registerAndDelegate")
      tx.registerStake(rewardAddress)
    }
    tx.delegateTo(rewardAddress, pool,  Data.void())
    tx.delegate.VoteToDRep(rewardAddress, dRep, Data.void())
    const completedTx = await tx.complete({ setCollateral : 1_000_000n, changeAddress:  this.getAddress(), coinSelection: true, localUPLCEval: true });
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

  



  checkSigners(signers: string[]): extraRequirements | false {
    const config = this.getConfig();
    const memo = new Map<SmartMultisigJson, extraRequirements | false>();

    function merge(front: extraRequirements, back: extraRequirements): extraRequirements {
      const newBefore = (front.before !== undefined && back.before !== undefined) ? Math.min(front.before, back.before) : (front.before !== undefined ? front.before : back.before);
      const newAfter = (front.after !== undefined && back.after !== undefined) ? Math.max(front.after, back.after) : (front.after !== undefined ? front.after : back.after);
      return {
        inputs: (front.inputs || []).concat(back.inputs || []),
        refInputs: (front.refInputs || []).concat(back.refInputs || []),
        before: newBefore,
        after: newAfter
      }
    }

    function cost(req: extraRequirements): number {
      const inputs = req.inputs?.length || 0;
      const refInputs = req.refInputs?.length || 0;
      const beforeAfter = (req.before || 0) + (req.after || 0);
      return inputs * 10 + refInputs * 5 + beforeAfter;
    }

    const verify = (segment: SmartMultisigJson, signers: string[]): extraRequirements | false => {
      if (memo.has(segment)) return memo.get(segment)!;

      let result: extraRequirements | false;
      const now = Date.now()  ;

      switch (segment.Type) {
        case SmartMultisigDescriptorType.KeyHash:
          result = signers.includes(segment.keyHash) ? {} : false;
          break;
        case SmartMultisigDescriptorType.AtLeast:
          const validSubRequirements = segment.scripts
            .map(script => verify(script, signers))
            .filter((req): req is extraRequirements => req !== false)
            .sort((a, b) => cost(a) - cost(b));
          
          if (validSubRequirements.length < segment.m) {
            result = false;
          } else {
            result = validSubRequirements.slice(0, segment.m).reduce(merge, {});
          }
          break;
        case SmartMultisigDescriptorType.NftHolder:
          const nftUtxo = this.nftUtxos.find(utxo => utxo.assets[segment.policy + segment.name] > 0n);
          console.log(nftUtxo, this.nftUtxos)
          if(nftUtxo && signers.includes(getAddressDetails(nftUtxo?.address).paymentCredential?.hash || "")){
            result = {inputs : [nftUtxo]};
          } else {
            result = false;
          }
          break;
        case SmartMultisigDescriptorType.Before:
         // result = {before :  segment.time  }
          result = segment.time  > now ? {before :  segment.time } : false;          
          break;
        case SmartMultisigDescriptorType.After:
         // result ={after :  segment.time }
           result = segment.time < now ? {after :  segment.time }: false;
          break;
        default:
          result = false;
      }

      memo.set(segment, result);
      return result;
    }
    const res = verify(config, signers);
    console.log("res", res)
    return res
  }

  getSigners(): {hash: string,  isDefault: boolean}[] {
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

  getSignature(index: number, keyHash: string){
    return this.pendingTxs[index].signatures[keyHash]
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
    return txBody;
  }

  async getUtxosByOutRef(OutputRef: {transaction_id: string, index: string}[])  {
    const resault= await this.lucid.config().provider.getUtxosByOutRef(OutputRef.map( outRef =>({txHash:outRef.transaction_id, outputIndex:Number(outRef.index)})))
    return resault
  }


  getPendingTxDetails(index: number){
      try {
        const txDetails = this.decodeTransaction(this.pendingTxs[index].tx.toCBOR({canonical: true}))

      const signatures =  txDetails.required_signers ?  txDetails.required_signers.map( (keyHash: any) => (
        { keyHash:keyHash , haveSig: (keyHash in this.pendingTxs[index].signatures ? true : false)}
      )) : []

      return { ...txDetails, signatures}
    } catch (e) {
      console.log(e)

    }
  }

  setDefaultAddress(address: string | null): void {
    this.defaultAddress = address;
  }

  setAddressNames(names: Record<string, string>): void {
    this.addressNames = names;
  }

  changeAddressName(address: string, name: string): void {
    this.addressNames[address] = name;
  }

  getDefaultAddress(){
    if (this.defaultAddress === null) {
        this.defaultAddress = this.getAddress();
    }
    return this.defaultAddress;
}


  getAddressNames(): Record<string, string> {
    return this.addressNames;
  }

  getAddressName(address: string) {
    if (!this.addressNames) {
      this.addressNames = {}; // Initialize addressNames if it's undefined
    }
    
    const result = address in this.addressNames 
      ? this.addressNames[address] 
      : address === this.getAddress() 
        ? "Regular Address"  
        : address;
        
    return result;
  }
}

export default SmartWallet;