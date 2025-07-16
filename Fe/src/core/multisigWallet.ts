import * as LucidEvolution from "@evolution-sdk/lucid";

import {  toast } from 'react-toastify';
import {getNewLucidInstance , changeProvider} from "../helpers/newLucidEvolution"
import { DRep , Credential } from "@evolution-sdk/lucid";
import { decodeCIP129 } from "../helpers/decodeCIP129";
import { AlwaysAbstain, AlwaysNoConfidence, Delegation } from "@evolution-sdk/core-types";
import WalletInterface from "../core/WalletInterface";
import { coinSelect } from "./coinSelect";
import sha256 from 'crypto-js/sha256';


class MultisigWallet implements WalletInterface{
    signersNames: any[] = []
    wallet_script: any
    wallet_address: string
    name: string
    delegation: Delegation
    defaultAddress: string
    txDetails: any
    pendingTxs: {tx: LucidEvolution.TxSignBuilder, signatures:  {[key: string]: string }}[]
    addressNames: any
    utxos: LucidEvolution.UTxO[]
    lucid: LucidEvolution.LucidEvolution | undefined 
  lucidNativeScript: LucidEvolution.CML.NativeScript | undefined;
  collateralDonor: any;
  collateralUtxo: any;
  collateralAddress: any;

    constructor(wallet_json : any ,name: any) {

      this.signersNames = []
      this.wallet_script = wallet_json
      this.wallet_address = "";
      this.name=name
      this.delegation = {poolId: null, rewards: 0n}
      this.defaultAddress= ""
      this.txDetails = {}
      this.pendingTxs = [];
      this.addressNames = {}
      this.utxos = []
      
    }

  
    extractSignerNames(json: any) {
      if(json.type === "sig" ){
        if (json.keyHash.substring(0, 4)=== "addr"){
          const details = LucidEvolution.getAddressDetails(json.keyHash);
          if (details?.paymentCredential?.hash) {
            json.keyHash = details.paymentCredential.hash;
          }
        }
        this.signersNames.push({ 
          hash: json.keyHash, 
          name: json.name, 
          isDefault: json.isDefault ? true : json.isDefault
        });
      }
      for (const key in json) {
        if (json.hasOwnProperty(key)) {
          const element = json[key];
          if (element.type === "sig"){
            if (element.keyHash.substring(0, 4)=== "addr"){
              
              element.keyHash= LucidEvolution.getAddressDetails(element.keyHash).paymentCredential?.hash
            }
            this.signersNames.push( { hash:element.keyHash , name:element.name})
          } else if (typeof element === 'object') {
            this.extractSignerNames(element);
          } 
        }
      }
    }

    keyHashToSighnerName(keyHash: string): string {
      for (let index = 0; index < this.signersNames.length; index++) {
        if (this.signersNames[index].hash === keyHash) {
          let name = this.signersNames[index].name;
          return name;
        }
      }
      return keyHash;
    }

    async initialize (settings : any){
      this.lucid = await getNewLucidInstance(settings)

      this.extractSignerNames(this.wallet_script)
      this.lucidNativeScript = LucidEvolution.toCMLNativeScript(this.wallet_script )
      this.lucid.selectWallet.fromAddress(  this.getAddress(), [] )
      await this.loadUtxos()
    } 

    async changeSettings(settings: any){
      if(settings.network !== this.lucid?.config().network){
        this.utxos = []
        this.delegation = {poolId: null, rewards: 0n}
        this.lucid = await getNewLucidInstance(settings)
        this.lucid.selectWallet.fromAddress(  this.getAddress(), [] )

        await this.loadUtxos()
      }else{
        try{
          await changeProvider(this.lucid!, settings)
          
          await this.loadUtxos()
      }catch(e){
        throw new Error('Invalid Connection Settings'+ e);
      }
      }

      
    }

    removePendingTx(index: number){
      this.pendingTxs.splice(index, 1);
    }

    
    getJson() {
      return this.wallet_script;
    }

    getScript(){
      return this.lucidNativeScript;
    }

    getCompletedTx(txId: string) {
      return this.pendingTxs.find( tx => tx.tx.toHash() === txId)
    }

    getCBOR() {
      return  JSON.stringify(this.lucidNativeScript);
    }

    getName(){
      return this.name
    }

    getCredential(): Credential{
      const script : LucidEvolution.Validator = {type: "Native" , script : this.lucidNativeScript!.to_cbor_hex()}
      return  {type: "Script" , hash: LucidEvolution.validatorToScriptHash(script) }  
      
    }


    // getSignatures(): any[] {

    //   return this.signatures;
    // }


    async getDelegation() : Promise<Delegation> { 
      this.delegation = (await this.lucid?.config().provider?.getDelegation(
                LucidEvolution.credentialToRewardAddress(
                     this.lucid?.config().network!,
                     LucidEvolution.getAddressDetails(this.getAddress())!.stakeCredential!
                )) || {poolId: null, rewards: 0n}
    ) ;
      return this.delegation 
    }

   

    getBalance(address=""){
      const utxos = this.utxos
      let result = 0
      utxos.map( utxo => {
        if (address==="" || utxo.address ===address){
        result += Number( utxo.assets.lovelace)
      }
      })
      return result + ( this.delegation && this.delegation.rewards ?  Number(this.delegation.rewards) : 0)
   }

   getBalanceFull(address=""){
    const utxos = this.utxos
    let result: any = {}
    utxos.map( utxo => {
      if (address==="" || utxo.address ===address){
        for (var asset in  utxo.assets ) {
          asset in result ?  result[asset] +=  utxo.assets[asset] : result[asset] =   utxo.assets[asset]
        } 
      } 
    }
     )
    if (result["lovelace"]) result["lovelace"] = Number(result["lovelace"]) + (this.delegation.rewards ?  Number(this.delegation.rewards) : 0)
    return result
 }
 
 substructBalanceFull(assets: any, address=""){
  const utxos = this.utxos
  let result: any = {}
  utxos.map( utxo => {
    if (address==="" || utxo.address ===address){
      for (var asset in  utxo.assets ) {
        asset in result ? result[asset] +=  utxo.assets[asset] : result[asset] =   utxo.assets[asset]
      }
    }
  }
   )
  for (var asset in  assets ) {
    if (asset in result){
      result[asset] -=  BigInt( assets[asset])
    }
  }
  return result
}


setPendingTxs(pendingTxs: any){

  this.pendingTxs = pendingTxs.map( (tx: {tx: string, signatures: string[]}) => { 
      const txParced =  LucidEvolution.makeTxSignBuilder(this.lucid!.config().wallet, LucidEvolution.CML.Transaction.from_cbor_hex(tx.tx)) 
      return({tx:txParced, signatures:tx.signatures})
  })
}



    getAddress(stakingAddress="") {
      const rewardAddress = stakingAddress === "" ? 
        this.getCredential() : 
        LucidEvolution.getAddressDetails(stakingAddress)!.stakeCredential;
        

      return LucidEvolution.credentialToAddress(
        this.lucid!.config().network!,
        this.getCredential(), 
        rewardAddress
      );
    }

    getStakingAddress(): string {
      return LucidEvolution.validatorToRewardAddress(this.lucid!.config().network!, {type: "Native" , script : this.lucidNativeScript!.to_cbor_hex()});
    }
      
 

    getSigners(): any[] {
      return this.signersNames
    }


    getFundedAddress(): string[] {
      const utxos = this.utxos
      let result: string[] = []
      utxos.map( (utxo: any) => {
        result.push(utxo.address);
          
         }
        )
        
      return  [...new Set(result)]; 
    }

    getUtxos(): any[] {
        return this.utxos
    }
    
    getutxo(utxoHash: string)  {
      return this.utxos.find((utxo: any) => utxo.txHash === utxoHash)
    }
    async getUtxosByOutRef(OutputRef: any)  {
      const resault= await this.lucid!.config().provider!.getUtxosByOutRef(OutputRef.map( (outRef: any) =>({txHash:outRef.transaction_id, outputIndex:Number(outRef.index)})))
      return resault
    }
  
    async loadUtxos(): Promise<boolean> {
      try{
        const utxos = await this.lucid!.config().provider!.getUtxos(LucidEvolution.getAddressDetails(this.getAddress())!.paymentCredential!)
      if(this.delegation === undefined){
        this.getDelegation()
      }
      if (this.utxos !== undefined){
        if (this.compareUtxos( utxos, this.utxos)){
          return false
      }}
        this.getDelegation()
        this.utxos = utxos
        await this.checkTransactions()
        return true
    }catch(e){
      console.log("Error loading utxos", e)
      return false
    }

    }

    compareUtxos(a: any, b: any){ 
      if (a.length !== b.length) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i].txHash !== b[i].txHash || a[i].outputIndex !== b[i].outputIndex) {
          return false

        }
      }
      return true
    }
    
    async checkTransactions(){

      for (let i = this.pendingTxs.length-1 ; i >= 0 ; i--) {
        const isValid = await this.checkTransaction(this.pendingTxs[i].tx)
        if (!isValid){
          this.removePendingTx(i)
        }
      }
    }
    
    async checkTransaction(tx: LucidEvolution.TxSignBuilder){
      const utxos = this.utxos
      const transactionDetails = this.decodeTransaction(tx.toCBOR({canonical: true}))
      
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

    getPendingTxs(){
        return this.pendingTxs
    }

    getTransactionType(txDetails: any) : string{
      if(txDetails.certs){
        const selfDelegation = txDetails.certs.findIndex((cert: any) => {
          return  cert.StakeVoteDelegCert !== undefined &&
                  cert.StakeVoteDelegCert.stake_credential.Script.hash === this.getCredential().hash
        })
        if(selfDelegation !== -1){
          return "Delegation Transaction"
        }
  
        const stakeUnregistration = txDetails.certs.findIndex((cert: any) => {
          return  cert.UnregCert !== undefined &&
                  cert.UnregCert.stake_credential.Script.hash === this.getCredential().hash
        })
        if(stakeUnregistration !== -1){
          return "Stake Unregistration Transaction"
        }
  
        const stakeRegistration = txDetails.certs.findIndex((cert: any) => {
          return  cert.StakeVoteRegDelegCert !== undefined &&
                  cert.StakeVoteRegDelegCert.stake_credential.Script.hash === this.getCredential().hash
        })
  
        if(stakeRegistration !== -1){
          return "Stake Registration Transaction"
        }
      }
  


      return "Regular Transaction"
    }



    decodeTransaction(tx: string) {
      const txBody = LucidEvolution.CML.Transaction.from_cbor_hex(tx).body().to_js_value();
      return txBody;
    }


    getPendingTxDetails(index: number){
      const txDetails = this.decodeTransaction(this.pendingTxs[index].tx.toCBOR({canonical: true}))
      txDetails.signatures =  txDetails.required_signers ?  txDetails.required_signers.map( (keyHash: any) => (
        {name: this.keyHashToSighnerName(keyHash) , keyHash:keyHash , haveSig: (keyHash in this.pendingTxs[index].signatures ? true : false)}
      )) : []
      return txDetails
    }

    checkSigners(signers: string[]): any{
        const json=this.wallet_script
        const that = this
        let requires_before = false
        let requires_after = false
        let result = checkRoot(json)
        if (result){
          return ({requires_before:requires_before, requires_after:requires_after})
        }
        else{
          return false
        }
        function checkAll(json: any){
              for (var index = 0; index < json.length; index++){

                if (!checkRoot(json[index]) ){
                  return false;
                }
              }
              return true
          }

        function checkAny(json: any){
            for (var index = 0; index < json.length; index++){

              if (checkRoot(json[index]) ){
                return true;
              }
            }
            return false
        }

        function checkAtLeast(json: any, required: any){
          var sigs=0;
          for (var index = 0; index < json.length; index++){
            if (checkRoot(json[index]) ){
               sigs++     
            }
          }
          if(sigs >= required){
          return true
        }
          return false
       }
        

        function checkSig(json: any){

            if( signers.includes( json.keyHash))
              return true
            else
              return false
        }

        function checkBefore(json: any){ 
          const slot = json.slot          
          const currentSlot = LucidEvolution.unixTimeToSlot(that.lucid!.config().network!, Date.now())
          if (slot > currentSlot){
              (requires_before === false || requires_before > json.slot) ? requires_before = json.slot : null
              return true
          }
          else{
              return false
          }
        }     
      

        function checkAfter(json: any){
          const slot = json.slot          
          const currentSlot = LucidEvolution.unixTimeToSlot(that.lucid!.config().network!, Date.now())
          if (slot < currentSlot){
              (requires_after === false || requires_after < json.slot) ? requires_after = json.slot : null
              return true
          }
          else{
              return false
          }
        }

        function checkRoot(json: any) {
            switch (json.type) {
              case "all": 
                    return checkAll(json.scripts)
                    break;
              case "any": 
                    return checkAny(json.scripts)
                    break;
              case "atLeast":
                    return  checkAtLeast(json.scripts,json.required)
                    break;
              case "sig":
                    return checkSig(json)
                    break;              
              case "before":
                    return checkBefore(json)
                    break;              
              case "after":
                    return checkAfter(json)
                    break;
          }}
      }

      
    async createTemplateTx(signers: string[]) : Promise<LucidEvolution.TxBuilder>{
      const sigCheck = this.checkSigners(signers)
      if (!sigCheck){
        throw new Error('Not enough signers');
      }

      const tx = this.lucid!.newTx()
      if (sigCheck.requires_after !== false){
        tx.validFrom( LucidEvolution.slotToUnixTime(this.lucid!.config().network!, sigCheck.requires_after ))
        
      }

      if (sigCheck.requires_before !== false){
        tx.validTo( LucidEvolution.slotToUnixTime(this.lucid!.config().network!, sigCheck.requires_before))
      }

      signers.map( (value: any) => (
        tx.addSignerKey(value)
      ))
      tx.attach.SpendingValidator( {type: "Native" , script : this.lucidNativeScript!.to_cbor_hex()})

      return tx
    }
    
    
    async createTx(recipients: {amount: Record<string, bigint>, address: string}[], signers: string[],sendFrom: string="" , sendAll: number | null = null , withdraw: boolean = true) { 
      

        var sumOfRecipientsMinusSendAll: LucidEvolution.Assets = {};
        recipients.map( (recipient: any,index: number) => {
          if (index !== sendAll){
          Object.keys(recipient.amount).map( (key: string,index: number) => {

          
            if (key in sumOfRecipientsMinusSendAll){
              sumOfRecipientsMinusSendAll[key] += recipient.amount[key]
            }else{
              sumOfRecipientsMinusSendAll[key] = recipient.amount[key]
            }
          } ) 
        }})
      
        const balance = this.getBalanceFull()

          for (const [key, value ] of Object.entries(sumOfRecipientsMinusSendAll)) {
            if (key in balance){
              if (balance[key] < value){
                throw new Error('Not enough funds');
              }
            }else{
              throw new Error('Not enough funds');
            }
          }    
      
        const tx = await this.createTemplateTx(signers)
        recipients.map( (recipient: any,index: number) => {
          if(sendAll !== index ){
            const convertedAmount: Record<string, bigint> = {}
            for (const [key, value] of Object.entries(recipient.amount)) {
              convertedAmount[key] = BigInt(value as number)
            }
            recipient.amount = convertedAmount
            
            const localAmount =   recipient.amount

            tx.pay.ToAddress(recipient.address,localAmount)
          }
      })
      let utxos = this.utxos
      if(sendFrom!==""){
        utxos = utxos.filter( (utxo,index) => (utxo.address === sendFrom)  )
      }
      const staking = this.delegation
      if(staking.rewards > 0n){
        tx.withdraw(LucidEvolution.validatorToRewardAddress(this.lucid!.config().network!, {type: "Native" , script : this.lucidNativeScript!.to_cbor_hex()}), staking.rewards, LucidEvolution.Data.void())
      }


      if(sendAll === null){
          const fee = BigInt(500_000 + 200_000 * signers.length + 500_000 * recipients.length);
          const totalAmount = {
            ...sumOfRecipientsMinusSendAll,
            lovelace: sumOfRecipientsMinusSendAll["lovelace"] + fee
          };
          totalAmount["lovelace"] = totalAmount["lovelace"] - staking.rewards
          utxos = coinSelect(totalAmount, utxos);
      }
      
      tx.collectFrom(utxos)

        if(withdraw && Number(this.delegation.rewards) > 0 ){
          tx.withdraw(LucidEvolution.validatorToRewardAddress(this.lucid!.config().network!, {type: "Native" , script : this.lucidNativeScript!.to_cbor_hex()}), this.delegation.rewards, LucidEvolution.Data.void())
        }


        let returnAddress = sendFrom==="" ? this.getAddress() : sendFrom 
        returnAddress = sendAll === null ? returnAddress : recipients[sendAll].address
        const completedTx = await tx.complete({changeAddress :returnAddress}) 

        
        this.pendingTxs.map( (PendingTx) => {
          if (PendingTx.tx.toHash() === completedTx.toHash()){
            throw new Error('Transaction already registerd');
          }
        })

        this.pendingTxs.push({tx:completedTx, signatures:{}})
        return "Sucsess"
    }

    txFromCBOR(cbor: string) : LucidEvolution.TxSignBuilder{
      return LucidEvolution.makeTxSignBuilder(this.lucid!.config().wallet, LucidEvolution.CML.Transaction.from_cbor_hex(cbor)) 
    }

    async importTransaction(transaction: string) { 
      let tx
      tx = this.txFromCBOR(transaction)
      try{
      if (!await this.checkTransaction(tx)){
        throw new Error("Transaction invalid")

      }
      }catch(e){
        console.log(e)
        throw new Error('Invalid Transaction data');
      }
      try{
        this.pendingTxs.map( (PendingTx) => {
          if (PendingTx.tx.toHash() === tx.toHash()) {
            throw new Error('Transaction already registered');
          }
         })

      this.pendingTxs.push({ tx, signatures:{}})
      return tx.toHash()
      }catch(e){
        console.log(e)
        return {error: 'Transaction already registered', tx:tx.toHash()};
      }
    }

    async setCollateralDonor(paymentKeyHash: any){
      this.collateralDonor  = paymentKeyHash
      await this.loadCollateralUtxos()
      if (this.collateralUtxo.length !== 0) {
          this.collateralAddress = this.collateralUtxo[0].address  
      }else{  
          this.collateralAddress = ""
      }
    }

    async loadCollateralUtxos(){
      if (this.collateralDonor) {
        try{
          this.collateralUtxo = (await this.lucid!.config().provider!.getUtxos({type:"Key", hash: this.collateralDonor})).filter( (utxo: any,index: any) => (Object.keys(utxo.assets).length === 1 ) ) 
         }catch(e){
           this.collateralUtxo = []
      }

      }else{
        this.collateralUtxo = []
      }
    }

    getCollateral(value : number  = 5_000_000){
      function getMinimumUtxos(utxos: any, requiredValue: any) {
        // Sort the UTXOs in ascending order
        utxos.map((utxo: any) => utxo.assets.lovelace = Number(utxo.assets.lovelace))
        utxos.sort((a: any, b: any) => a.assets.lovelace - b.assets.lovelace);

        let total = BigInt(0);
        let result = [];

        // Add UTXOs until the total is greater than or equal to the required value
        for (let utxo of utxos) {
          total +=  BigInt(utxo.assets.lovelace);
          result.push(utxo);

          if (total >= requiredValue) {
            break;
          }
        }

        // If the total is greater than the required value, find the smallest set of UTXOs that is closer to the required value
        if (total > requiredValue) {
          let bestMatch = result;

          for (let i = 0; i < utxos.length; i++) {
            let currentTotal = BigInt(0);
            let currentResult = [];

            for (let j = i; j < utxos.length; j++) {
              currentTotal +=  BigInt(utxos[j].assets.lovelace);
              currentResult.push(utxos[j]);

              if (currentTotal >= requiredValue && currentResult.length < bestMatch.length) {
                bestMatch = currentResult;
                break;
              }
            }
          }

          result = bestMatch;
        }
        result.map((utxo: any) => utxo.assets.lovelace = BigInt(utxo.assets.lovelace))
        return result;
      }
    
      if (value === undefined){
          value = 4_000_000
      }
      if(this.collateralUtxo.length <= 1){
        return this.collateralUtxo
      }
      console.log(this.collateralUtxo)  
      let result = getMinimumUtxos(this.collateralUtxo, BigInt(value))
      return result
    }

    getCollateralDonor(){
      return this.collateralDonor
    }

    async getCollateralUtxos(value: number | undefined){
      return this.getCollateral(value)
    }
    
    getCollateralAddress(){
      return this.collateralAddress
    }

    async getCollateralUtxo(value: number | undefined){
      return this.getCollateral(value)
    }


    getId() {
      //remove the name field from the wallet object recursively
      function removeName(obj: any) {
        if (typeof obj === 'object') {
  
          if (Array.isArray(obj)) {
            obj.forEach((item) => {
              removeName(item);
            });
          } else {
            delete obj.name;
            Object.keys(obj).forEach((key) => {
              removeName(obj[key]);
            });
          }
        }
      };
    
      const cleanWallet = JSON.parse(JSON.stringify(this.getJson()));
      removeName(cleanWallet)
      
    //crypto.createHash('sha256').update(JSON.stringify(cleanWallet)).digest('hex'); for react
      return getSHA256Hash(cleanWallet)
  
      async function getSHA256Hash(jsonObj : any) {
        const jsonString = JSON.stringify(jsonObj);
        const hashHex = sha256(jsonString).toString();
        return hashHex;
      }
}
  

    async loadTransaction(transaction: any){
        
        try{
          await this.importTransaction(transaction.transaction)
        }catch(e){

        }
        Object.keys(transaction.signatures).map( (key) => {
          try{
            this.addSignature(transaction.signatures[key])
            toast.info("Transaction update for wallet:" + this.getName());
          }catch(e){
          }
            
      })
    }
      

    async createStakeUnregistrationTx(signers: string[]){
      const curentDelegation = await this.getDelegation()
      const rewardAddress =  LucidEvolution.validatorToRewardAddress(this.lucid!.config().network!, {type: "Native" , script : this.lucidNativeScript!.to_cbor_hex()})
      const sigCheck = this.checkSigners(signers)
      if (!sigCheck){
        throw new Error('Not enough signers');
      }

      const tx =await this.createTemplateTx(signers)

        
      if (curentDelegation.poolId === null){
        throw new Error('Not delegated');
      } else {
        tx.deRegisterStake(rewardAddress)
      }

      if(Number(this.delegation.rewards) > 0 ){
        tx.withdraw(LucidEvolution.validatorToRewardAddress(this.lucid!.config().network!, {type: "Native" , script : this.lucidNativeScript!.to_cbor_hex()}), this.delegation.rewards)
      }

      tx.collectFrom(coinSelect({"lovelace" : 3_000_000n}, this.utxos), LucidEvolution.Data.void())
      const completedTx = await tx.attach.SpendingValidator( {type: "Native" , script : this.lucidNativeScript!.to_cbor_hex()})
      .complete()
      
      this.pendingTxs.map( (PendingTx) => {
        if (PendingTx.tx.toHash() === completedTx.toHash()) {
          throw new Error('Transaction already registerd');
        }
    })

      this.pendingTxs.push({tx:completedTx, signatures:{}})
      return "Sucsess"
    }

    getSignerName(keyHash: any){
        return this.signersNames.find((signer: any) => signer.hash === keyHash)?.name || '';
    }

    async createDelegationTx(pool: string, dRepId: string, signers: string[]){ 
      const curentDelegation = await this.getDelegation()
      console.log("dRepId", dRepId)
      console.log("createDelegationTx")
      const rewardAddress =  LucidEvolution.validatorToRewardAddress(this.lucid!.config().network!, {type: "Native" , script : this.lucidNativeScript!.to_cbor_hex()})

      let dRep: DRep 
    
      if (dRepId === "Abstain") {
        dRep = { __typename: "AlwaysAbstain" } as AlwaysAbstain;
      } else if (dRepId === "NoConfidence") {
        dRep = { __typename: "AlwaysNoConfidence" } as AlwaysNoConfidence;
      } else {
        dRep = decodeCIP129(dRepId);
      }
      console.log("dRep", dRep, typeof dRep)
      const tx = await this.createTemplateTx(signers)

      if (curentDelegation.poolId === null){
        tx.registerAndDelegate.ToPoolAndDRep(rewardAddress, pool, dRep) 
      }else {
        tx.delegate.VoteToPoolAndDRep(rewardAddress, pool, dRep)
      }
      
      tx.collectFrom(coinSelect({"lovelace" : 3_000_000n}, this.utxos), LucidEvolution.Data.void())
      // const completedTx = await tx.pay.ToAddress(this.getAddress())
      console.log("dRep", dRep)
        const completedTx = await tx.complete({presetWalletInputs : []})

      this.pendingTxs.push({tx:completedTx, signatures:{}}) 
      return "Sucsess"
    }

    isAddressMine(address: string) : boolean{
      try{
        return (LucidEvolution.getAddressDetails(address).paymentCredential!.hash === LucidEvolution.getAddressDetails(this.getAddress()).paymentCredential!.hash)
      }catch(e){
        return false
      }
    }

    isAddressValid(address: string) : boolean{
      return  LucidEvolution.getAddressDetails(address) ? true : false
    }
    
    isAddressScript(address: string) : boolean{
      return LucidEvolution.getAddressDetails(address).paymentCredential!.type === "Script"
    }
    
    decodeSignature(signature: string) {
      try{
      const witness  =  LucidEvolution.CML.TransactionWitnessSet.from_cbor_hex(signature)
      const signer = witness.vkeywitnesses()?.get(0)?.vkey()?.hash().to_hex()
      return {signature, signer: signer , witness : witness}     
      }catch(f){
        try{
            const witness  =  LucidEvolution.CML.TransactionWitnessSet.from_cbor_hex("a10081" + signature)
            const signer = witness.vkeywitnesses()?.get(0)?.vkey()?.hash().to_hex()
            return {signature : "a10081" + signature, signer: signer , witness : witness}             
        }catch(e){
          console.log(e)
          throw new Error('Decoding Failed, Invalid signature');
      }
    } }


    hexToBytes(hex: string) : Uint8Array {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return new Uint8Array(bytes);
    }
    
    getPendingTxId(index: number){
      return this.pendingTxs[index].tx.toHash()
    }
    addSignature(signature: string){

      const signatureInfo = this.decodeSignature(signature)
      console.log("signatureInfo", signatureInfo)
      this.signersNames.some(obj => obj.keyHash === signatureInfo.signer);
      var valid = false
      for (var index = 0; index < this.pendingTxs.length; index++){
            const signature = signatureInfo.witness.vkeywitnesses()?.get(0)
            if (!signature)
              throw new Error('Invalid Signature not Found');
            if (signature.vkey()?.verify( this.hexToBytes(this.pendingTxs[index].tx.toHash()) , 
                                                                               signature.ed25519_signature() ))
            {
              valid = true
              if (!(signatureInfo.signer && signatureInfo.signer in this.pendingTxs[index].signatures)) {
                   this.pendingTxs[index].signatures[signatureInfo.signer as string] = signatureInfo.signature
                   return  index
                }else{
                   throw new Error('Signature already registered');
                  }
            }

        }
        if (!valid){
          throw new Error('Invalid Signature');
        }

    }

    getPendingTx(index: number){
      return this.pendingTxs[index]
    }

    signersCompleted(index: number) : boolean {
      const txDetails = this.getPendingTxDetails(index)
       return txDetails.signatures.every((signature: any) => signature.haveSig === true);
     }
     
    getSignature(index: number,keyHash: string){
      return this.pendingTxs[index].signatures[keyHash]
    }

    async submitTx(tx: any){
      try{
        const txHash = await this.lucid!.config().provider!.submitTx(tx);
        return txHash
      }catch(e: any){
        console.log(e)
        const errorMessage = e?.message ? e.message : JSON.stringify(e) 
        return errorMessage;
      }
    }
    
    async submitTransaction(index: number){
      try{
       const tx = this.pendingTxs[index]
       const signedTx = await tx.tx.assemble(Object.values(tx.signatures)).complete();
       const txHash = await signedTx.submit();
        return( this.lucid!.awaitTx(txHash, 2500))
      }catch(e: any){
        console.log(e)
        const errorMessage = e?.message ? e.message : JSON.stringify(e) 
        throw new Error(errorMessage);
      }
    }

    setDefaultSigners(signers: any){
      const setCollateralDonor = () => {
        const defaultHashes = this.signersNames.filter( (signer: any) => signer.isDefault).map( (signer: any) => signer.hash)
        if(defaultHashes.length === 0)
        {
          this.setCollateralDonor(undefined)
        }else{
          this.setCollateralDonor(defaultHashes[0])
        }
      }
      let newDonorNeeded = false

      this.signersNames = this.signersNames.map( (signer: any) => {
        signer.isDefault = signers.includes(signer.hash)
        if(!signer.isDefault && signer.hash === this.collateralDonor){
          newDonorNeeded = true
        }
        return signer
      })
      
      if (newDonorNeeded || this.collateralDonor === undefined)
        setCollateralDonor()
      
    }

    updateSignerName(keyHash: string, name: string){

      function changeName(json: any, keyHash: string, name: string){
          if (json.keyHash === keyHash){
            json.name = name
          } 
          if (json.type === "all" || json.type === "any" || json.type === "atLeast"){
            json.scripts.map( (script: any,index: any) => {
              changeName(script, keyHash, name)
            })
          }
      }
      
      changeName(this.wallet_script, keyHash, name)

      this.signersNames.map( (signer: any,index: any) => {
        if (signer.hash === keyHash){
          this.signersNames[index].name = name
        }
      })
    }


    resetDefaultSigners(){  
      const signersNames = this.signersNames.map( (signer: any) => {
        signer.isDefault = false
        return signer
      })
      signersNames.map( (signer,index) => {
          this.signersNames[index].isDefault = !this.defaultSignersValid()
      })

    }

  

    // Setters
    setScript(wallet_script: any) {
      this.wallet_script = wallet_script;
    }

    setDefaultAddress(address: string){
      this.defaultAddress = address
    }
    
    setAddressNames(names: any){
      this.addressNames = names

    }
    setName(name: string){
      this.name = name
    }


    changeAddressName(address: string,name: string){
      this.addressNames[address] = name
    }
    getNetworkId(){
        return this.lucid!.config().network === "Mainnet" ? 1 : 0 
    }

    getDefaultAddress(){
        if (this.defaultAddress === null) {
            this.defaultAddress = this.getAddress();
        }
        return this.defaultAddress;
    }

    getDefaultSigners() : string[]{
      return this.signersNames.filter( signer => signer.isDefault).map( signer => signer.hash)
    }


    defaultSignersValid() : boolean{
      return this.checkSigners(this.getDefaultSigners()) === false ? false : true
    }

    getScriptRequirements(){
      const signers = this.getDefaultSigners(); 
                            
      const isValid = this.checkSigners(signers);
      if (isValid === false){
          return {error: "not enough signers"}
      }else{
          const response = signers.map((signer) => ({ code: 1 , value: signer}));

          if (isValid.requires_before)   {
              response.push({code : 2, "value": isValid.requires_before});
          }
          if (isValid.requires_after){
              response.push({code: 3, "value": isValid.requires_after});
          }
          return response
      }
    }


    getAddressNames(){
      return this.addressNames
    }
    
    getAddressName(address: string){

      const resault = address in this.addressNames ? this.addressNames[address] : address === this.getAddress() ? "Regular Address"  : address
      return resault
    }

  }

  export default MultisigWallet;