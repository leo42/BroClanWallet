import {   C ,   TxComplete , Data} from "lucid-cardano";
const { Transaction} = C;
import {  toast } from 'react-toastify';
import {getNewLucidInstance, changeProvider} from "./helpers/newLucid.js"

class Wallet {
    constructor(wallet_json,name) {

      this.signersNames = []
      this.wallet_script = wallet_json
      this.wallet_address = "";
      this.name=name
      this.delegation = {poolId: null, rewards: null}
      this.defaultAddress= ""
      this.txDetails = {}
      this.pendingTxs = [];
      this.addressNames = {}
      this.utxos = []
      
    }

  
    extractSignerNames(json) {
      if(json.type === "sig" ){
        if (json.keyHash.substring(0, 4)=== "addr"){
          json.keyHash=this.lucid.utils.getAddressDetails(json.keyHash).paymentCredential.hash
        }
        this.signersNames.push( { hash:json.keyHash , name:json.name, isDefault:  json.isDefault ? true : json.isDefault})
      }
      for (const key in json) {
        if (json.hasOwnProperty(key)) {
          const element = json[key];
          if (element.type === "sig"){
            if (element.keyHash.substring(0, 4)=== "addr"){
              
              element.keyHash=this.lucid.utils.getAddressDetails(element.keyHash).paymentCredential.hash
            }
            this.signersNames.push( { hash:element.keyHash , name:element.name})
          } else if (typeof element === 'object') {
            this.extractSignerNames(element);
          } 
        }
      }
    }

    keyHashToSighnerName(keyHash){
      for(var index=0; index< this.signersNames.length; index++){
        if (this.signersNames[index].hash === keyHash){
          let name=this.signersNames[index].name
          return name
        };
      }
      return keyHash
    }

    async initialize (settings){
      this.lucid = await getNewLucidInstance(settings)

      this.extractSignerNames(this.wallet_script)
      this.lucidNativeScript = this.lucid.utils.nativeScriptFromJson(this.wallet_script )
      this.lucid.selectWalletFrom(  { "address":this.getAddress()})

    } 

    async changeSettings(settings){
      if(settings.network !== this.lucid.network){
        this.utxos = []
        this.delegation = {poolId: null, rewards: null}
      }

      try{
        await changeProvider(this.lucid, settings)
        await this.loadUtxos()
    }catch(e){
      throw new Error('Invalid Connection Settings'+ e);
    }
    }

    removePendingTx(index){
      this.pendingTxs.splice(index, 1);
    }

    
    getJson() {
      return this.wallet_script;
    }

    getScript(){
      return this.lucidNativeScript;
    }

    getCompletedTx(txId){
      return this.pendingTxs.find( tx => tx.tx.toHash() === txId)
    }

    getCBOR() {
      return  JSON.stringify(this.lucidNativeScript);
    }

    getName(){
      return this.name
    }


    getSignatures(){

      return this.signatures;
    }

    async getDelegation() { 
      this.delegation = await this.lucid.provider.getDelegation(this.lucid.utils.credentialToRewardAddress( this.lucid.utils.getAddressDetails(this.getAddress()).stakeCredential)) ;
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
    let result = {}
    utxos.map( utxo => {
      if (address==="" || utxo.address ===address){
        for (var asset in  utxo.assets ) {
          asset in result ? result[asset] +=  utxo.assets[asset] : result[asset] =   utxo.assets[asset]
        } 
      } 
    }
     )
    if (result["lovelace"]) result["lovelace"] = Number(result["lovelace"]) + (this.delegation.rewards ?  Number(this.delegation.rewards) : 0)
    return result
 }
 
 substructBalanceFull(assets, address=""){
  const utxos = this.utxos
  let result = {}
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


setPendingTxs(pendingTxs){

  this.pendingTxs = pendingTxs.map( tx => { 
    const uint8Array = new Uint8Array(tx.tx.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    const txParced =  new  TxComplete(this.lucid, Transaction.from_bytes(uint8Array)) 
     return({tx:txParced, signatures:tx.signatures})})
}


    getAddress(stakingAddress="") {
      const rewardAddress = stakingAddress === "" ? {type: "Script", hash: this.lucid.utils.validatorToScriptHash(this.lucidNativeScript) }: this.lucid.utils.getAddressDetails(stakingAddress).stakeCredential
        return this.lucid.utils.credentialToAddress({type: "Script" , hash: this.lucid.utils.validatorToScriptHash(this.lucidNativeScript)}, rewardAddress )
    }

    getStakingAddress() {
      return this.lucid.utils.validatorToRewardAddress(this.lucidNativeScript)
    }
      
 
    getSigners(){
      return this.signersNames
    }

    getFundedAddress(){
      const utxos = this.utxos
      let result = []
      utxos.map( utxo => {
        result.push(utxo.address);
          
         }
        )
        
      return  [...new Set(result)]; 
    }

    getUtxos() {
        return this.utxos
    }
   
    getutxo(utxoHash)  {
      return this.utxos.find(utxo => utxo.txHash === utxoHash)
    }
    async getUtxosByOutRef(OutputRef)  {
      const resault= await this.lucid.provider.getUtxosByOutRef(OutputRef.map( outRef =>({txHash:outRef.transaction_id, outputIndex:Number(outRef.index)})))
      return resault
    }
  
    async loadUtxos() {
      try{
      const utxos = await this.lucid.provider.getUtxos(this.lucid.utils.getAddressDetails(this.getAddress()).paymentCredential)
      if(this.delegation === undefined){
        this.getDelegation()
      }
      if (this.utxos !== undefined){
        if (this.compareUtxos( utxos, this.utxos)){
          return
      }}
        this.getDelegation()
        this.utxos = utxos
        await this.checkTransactions()
    }catch(e){
      console.log("Error loading utxos", e)
    }
    }

    compareUtxos(a,b){ 
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

      await this.loadUtxos()
      for (let i = this.pendingTxs.length-1 ; i >= 0 ; i--) {
        const isValid = await this.checkTransaction(this.pendingTxs[i].tx)
        if (!isValid){
          this.removePendingTx(i)
        }
      }
    }
    
    async checkTransaction(tx){
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

    getPendingTxs(){
        return this.pendingTxs
    }

    decodeTransaction(tx){
      const uint8Array = new Uint8Array(tx.toString().match(/.{2}/g).map(byte => parseInt(byte, 16)));
      const txBody =  Transaction.from_bytes(uint8Array).body().to_js_value()
  
      return txBody

    }

    getPendingTxDetails(index){
      const txDetails = this.decodeTransaction(this.pendingTxs[index].tx)
      txDetails.signatures =  txDetails.required_signers ?  txDetails.required_signers.map( (keyHash) => (
        {name: this.keyHashToSighnerName(keyHash) , keyHash:keyHash , haveSig: (keyHash in this.pendingTxs[index].signatures ? true : false)}
      )) : []
      return txDetails
    }

    checkSigners(signers){
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
        function checkAll(json){
              for (var index = 0; index < json.length; index++){

                if (!checkRoot(json[index]) ){
                  return false;
                }
              }
              return true
          }

        function checkAny(json){
            for (var index = 0; index < json.length; index++){

              if (checkRoot(json[index]) ){
                return true;
              }
            }
            return false
        }

        function checkAtLeast(json,required){
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
        

        function checkSig(json){

            if( signers.includes( json.keyHash))
              return true
            else
              return false
        }

        function checkBefore(json){ 
          const slot = json.slot          
          const currentSlot = that.lucid.utils.unixTimeToSlot(Date.now())
          if (slot > currentSlot){
              (requires_before === false || requires_before > json.slot) ? requires_before = json.slot : null
              return true
          }
          else{
              return false
          }
        }     
      

        function checkAfter(json){
          const slot = json.slot          
          const currentSlot = that.lucid.utils.unixTimeToSlot(Date.now())
          if (slot < currentSlot){
              (requires_after === false || requires_after < json.slot) ? requires_after = json.slot : null
      
            return true
          }
          else{
              return false
          }
        }

        function checkRoot(json) {
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

      
    
    
    async createTx(recipients, signers,sendFrom="" , sendAll=null , withdraw=true) { 
        const sigCheck = this.checkSigners(signers)
        if (!sigCheck){
          throw new Error('Not enough signers');
        }


        var sumOfRecipientsMinusSendAll = {}
        recipients.map( (recipient,index) => {
          if (index !== sendAll){
          Object.keys(recipient.amount).map( (key,index) => {

          
            if (key in sumOfRecipientsMinusSendAll){
              sumOfRecipientsMinusSendAll[key] += recipient.amount[key]
            }else{
              sumOfRecipientsMinusSendAll[key] = recipient.amount[key]
            }
          } ) 
    }})
      
        const balance = this.getBalanceFull()


          for (const [key, value] of Object.entries(sumOfRecipientsMinusSendAll)) {
            if (key in balance){
              if (balance[key] < value){
                throw new Error('Not enough funds');
              }
            }else{
              throw new Error('Not enough funds');
            }
          }
    
        
        if(sendFrom!==""){
          let utxos = this.utxos.filter( (utxo,index) => (utxo.address === sendFrom)  )
          this.lucid.selectWalletFrom(  { "address":sendFrom, "utxos": utxos})
        }else{
          this.lucid.selectWalletFrom(  { "address":this.getAddress(), "utxos": this.utxos})
        }
        const sendAllAmount = this.substructBalanceFull(sumOfRecipientsMinusSendAll,sendFrom) 
        sendAllAmount["lovelace"] = sendAllAmount["lovelace"] - BigInt(500_000  +  200_000 * signers.length + 500_000 * recipients.length)

        const tx = this.lucid.newTx()
        recipients.map( (recipient,index) => {
          // sendAll === index ? OutputTx.payToAddress(recipient.address,  sendAllAmount ) :
          const localAmount = sendAll === index ? sendAllAmount : recipient.amount
          this.isAddressScript(recipient.address) ? tx.payToAddressWithData(recipient.address, {inline : Data.void()},localAmount) : tx.payToAddress(recipient.address,localAmount)
      })


        if(withdraw && Number(this.delegation.rewards) > 0 ){
          tx.withdraw(this.lucid.utils.validatorToRewardAddress(this.lucidNativeScript), this.delegation.rewards)
        }

        if (sigCheck.requires_after !== false){
          tx.validFrom( this.lucid.utils.slotToUnixTime(sigCheck.requires_after))
          
        }

        if (sigCheck.requires_before !== false){
          tx.validTo( this.lucid.utils.slotToUnixTime(sigCheck.requires_before))
        }

        signers.map( value => (
          tx.addSignerKey(value)
        ))


        tx.attachSpendingValidator(this.lucidNativeScript)
        let returnAddress = sendFrom==="" ? this.getAddress() : sendFrom 
        returnAddress = sendAll === null ? returnAddress : recipients[sendAll].address
        const changeObject = this.isAddressScript(returnAddress) ? {address : returnAddress ,  outputData : {inline : Data.void()}} : {address : returnAddress}
        const completedTx = await tx.complete({ change :changeObject}) 

        
        this.pendingTxs.map( (PendingTx) => {
          if (PendingTx.tx.toHash() === completedTx.toHash()) {
            throw new Error('Transaction already registerd');
          }
      })

        this.pendingTxs.push({tx:completedTx, signatures:{}})
        return "Sucsess"
    }


    async importTransaction(transaction)
    { 
      let uint8Array , tx
      try{
      if (!await this.checkTransaction(transaction)){
        throw new Error("Transaction invalid")
      }

        uint8Array = typeof transaction === 'string' ?  new Uint8Array(transaction.match(/.{2}/g).map(byte => parseInt(byte, 16))) : transaction;
        tx =  new  TxComplete(this.lucid, Transaction.from_bytes(uint8Array)) 
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



    async setCollateralDonor(paymentKeyHash){
      this.collateralDonor = paymentKeyHash
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
          this.collateralUtxo = (await this.lucid.provider.getUtxos({type:"key", hash: this.collateralDonor})).filter( (utxo,index) => (Object.keys(utxo.assets).length === 1 ) ) 
         }catch(e){
           this.collateralUtxo = []
      }

      }else{
        this.collateralUtxo = []
      }
    }

    getCollateral(value=undefined){
      function getMinimumUtxos(utxos, requiredValue) {
        // Sort the UTXOs in ascending order
        utxos.map(utxo => utxo.assets.lovelace = Number(utxo.assets.lovelace))
        utxos.sort((a, b) => a.assets.lovelace - b.assets.lovelace);

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
        result.map(utxo => utxo.assets.lovelace = BigInt(utxo.assets.lovelace))
        return result;
      }
    
      if (value === undefined){
        value = 5_000_000
      }
      if(this.collateralUtxo.length <= 1){
        return this.collateralUtxo
      }
      console.log(this.collateralUtxo)  
      let result = getMinimumUtxos(this.collateralUtxo, BigInt(value))

      //result must be the minimum numbver of utxos to cover the value, and the smalest value possible after that, if you have 2 UTxO with 5 ADA and 10 ADA, and you need 12 ADA, the result must be 2 UTxO with 5 ADA and 7 ADA, if you need 3 ADA, the result must be 1 UTxO with 5 ADA, and if you need 7 ADA, the result must be 1 UTxO with 10 ADA

      


      return result
    }

    getCollateralDonor(){
      return this.collateralDonor
    }

    async getCollateralUtxos(value=none){
      
    }
    
    getCollateralAddress(){
      return this.collateralAddress
    }

    async getCollateralUtxo(value=none){
  
    }


    async loadTransaction(transaction){
        
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
      

    async createStakeUnregistrationTx(signers){
      const curentDelegation = await this.getDelegation()
      const rewardAddress =  this.lucid.utils.validatorToRewardAddress(this.lucidNativeScript)

      const sigCheck = this.checkSigners(signers)
      if (!sigCheck){
        throw new Error('Not enough signers');
      }

      const tx = this.lucid.newTx()

      signers.map( value => (
        tx.addSignerKey(value)
      ))
        
      if (curentDelegation.poolId === null){
        throw new Error('Not delegated');
      } else {
        tx.deregisterStake(rewardAddress)
      }

      if(Number(this.delegation.rewards) > 0 ){
        tx.withdraw(this.lucid.utils.validatorToRewardAddress(this.lucidNativeScript), this.delegation.rewards)
      }

      if (sigCheck.requires_after !== false){
        tx.validFrom( this.lucid.utils.slotToUnixTime(sigCheck.requires_after))
        
      }

      if (sigCheck.requires_before !== false){
        tx.validTo( this.lucid.utils.slotToUnixTime(sigCheck.requires_before))
      }


      const completedTx = await tx.attachSpendingValidator(this.lucidNativeScript)
      .complete()
      
      this.pendingTxs.map( (PendingTx) => {
        if (PendingTx.tx.toHash() === completedTx.toHash()) {
          throw new Error('Transaction already registerd');
        }
    })

      this.pendingTxs.push({tx:completedTx, signatures:{}})
      return "Sucsess"
    }


    async createDelegationTx(pool, signers){ 
      const curentDelegation = await this.getDelegation()
      const rewardAddress =  this.lucid.utils.validatorToRewardAddress(this.lucidNativeScript)
      const sigCheck = this.checkSigners(signers)
      if (!sigCheck){
        throw new Error('Not enough signers');
      }

      const tx = this.lucid.newTx()

      signers.map( value => (
        tx.addSignerKey(value)
      ))
      if (curentDelegation.poolId === pool){
        throw new Error('Already delegated to this pool');
      } else if (curentDelegation.poolId === null){
        tx.registerStake(rewardAddress) 
      }
      
      if (sigCheck.requires_after !== false){
        tx.validFrom( this.lucid.utils.slotToUnixTime(sigCheck.requires_after))
        
      }

      if (sigCheck.requires_before !== false){
        tx.validTo( this.lucid.utils.slotToUnixTime(sigCheck.requires_before))
      }
      const completedTx = await tx.payToAddress(this.getAddress(),{lovelace: 5000000})
      .delegateTo(rewardAddress,pool)
      .attachSpendingValidator(this.lucidNativeScript)
      .complete()
      
      this.pendingTxs.push({tx:completedTx, signatures:{}})
      return "Sucsess"
    }

    isAddressMine(address){
      return (this.lucid.utils.getAddressDetails(address).paymentCredential.hash === this.lucid.utils.getAddressDetails(this.getAddress()).paymentCredential.hash)
    }

    isAddressValid(address){
      return  this.lucid.utils.getAddressDetails(address) ? true : false
    }
    
    isAddressScript(address){
      return this.lucid.utils.getAddressDetails(address).paymentCredential.type === "Script"
    }
    
    decodeSignature(signature){
      try{
      const witness  =  C.TransactionWitnessSet.from_bytes(this.hexToBytes(signature))
      const signer = witness.vkeys().get(0).vkey().public_key().hash().to_hex();
      return {signature, signer: signer , witness : witness}     
      }catch(f){
        try{
            const witness  =  C.TransactionWitnessSet.from_bytes(this.hexToBytes("a10081" + signature))
            const signer = witness.vkeys().get(0).vkey().public_key().hash().to_hex();
            return {signature : "a10081" + signature, signer: signer , witness : witness}             
        }catch(e){
          console.log(e)
          throw new Error('Decoding Failed, Invalid signature');
      }
    } }


    hexToBytes(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    }
    
    addSignature(signature){

      const signatureInfo = this.decodeSignature(signature)
      this.signersNames.some(obj => obj.keyHash === signatureInfo.signer);
      var valid = false
      for (var index = 0; index < this.pendingTxs.length; index++){
            if (signatureInfo.witness.vkeys().get(0).vkey().public_key().verify( this.hexToBytes(this.pendingTxs[index].tx.toHash()), signatureInfo.witness.vkeys().get(0).signature()))
            {
              valid = true
              if (!(signatureInfo.signer in this.pendingTxs[index].signatures)) {
                   this.pendingTxs[index].signatures[signatureInfo.signer] = signatureInfo.signature
                   return  this.pendingTxs[index]
                }else{
                   throw new Error('Signature already registered');
                  }
            }

        }
        if (!valid){
          throw new Error('Invalid Signature');
        }

    }

    getSignature(index,keyHash){
      return this.pendingTxs[index].signatures[keyHash]
    }

    async submitTx(tx){
      try{
        const txHash = await this.lucid.provider.submitTx(tx);
        return txHash
      }catch(e){
        console.log(e)
        const errorMessage = e.message ? e.message : JSON.stringify(e) 
        return errorMessage;
      }
    }
    
    async submitTransaction(index){
      try{
       const tx = this.pendingTxs[index]
       const signedTx = await tx.tx.assemble(Object.values(tx.signatures)).complete();
       const txHash = await signedTx.submit();
      return( this.lucid.awaitTx(txHash, 2500))
      }catch(e){
        console.log(e)
        const errorMessage = e.message ? e.message : JSON.stringify(e) 
        throw new Error(errorMessage);
      }
    }

    setDefaultSigners(signers){
      const setCollateralDonor = () => {
        const defaultHashes = this.signersNames.filter( signer => signer.isDefault).map( signer => signer.hash)
        if(defaultHashes.length === 0)
        {
          this.setCollateralDonor(undefined)
        }else{
          this.setCollateralDonor(defaultHashes[0])
        }
      }
      let newDonorNeeded = false

      this.signersNames = this.signersNames.map( (signer) => {
        signer.isDefault = signers.includes(signer.hash)
        if(!signer.isDefault && signer.hash === this.collateralDonor){
          newDonorNeeded = true
        }
        return signer
      })
      
      if (newDonorNeeded || this.collateralDonor === undefined)
        setCollateralDonor()
      
    }

    resetDefaultSigners(){  
      const signersNames = this.signersNames.map( (signer) => {
        signer.isDefault = false
        return signer
      })
      signersNames.map( (signer,index) => {
          this.signersNames[index].isDefault = !this.defaultSignersValid()
      })

    }

  

    // Setters
    setScript(wallet_script) {
      this.wallet_script = wallet_script;
    }

    setDefaultAddress(address){
      this.defaultAddress = address
    }
    
    setAddressNamess(names){
      this.addressNames = names

    }
    setName(name){
      this.name = name
    }


    changeAddressName(address,name){
      this.addressNames[address] = name
    }
    getNetworkId(){
        return this.lucid.network === "Mainnet" ? 1 : 0 
    }

    getDefaultAddress(){
        if (this.defaultAddress === null) {
            this.defaultAddress = this.getAddress();
        }
        return this.defaultAddress;
    }

    getDefaultSigners(){
      return this.signersNames.filter( signer => signer.isDefault).map( signer => signer.hash)
    }

    defaultSignersValid(){
      return this.checkSigners(this.getDefaultSigners())
    
    }

    getAddressNames(){
      return this.addressNames
    }
    
    getAddressName(address){

      const resault = address in this.addressNames ? this.addressNames[address] : address === this.getAddress() ? "Regular Address"  : address
      return resault
    }

  }

  export default Wallet;