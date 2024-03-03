import {   C , TxComplete  , Data, applyParamsToScript, fromText } from "lucid-cardano";
const { Transaction} = C;
import { Program } from "@hyperionbt/helios"
import {getNewLucidInstance, changeProvider} from "../../Fe/src/helpers/newLucid.js"

class Wallet {
    constructor(token, api) {

      this.policy = token.substring(0, 56)
      this.assetName = token.substring(56 )
      const SpendingSrc = "5901800100003232323232323232323232232232222533300c3322323300100100322533301300114a026464a666024600a00429444cc010010004c05c008c054004dd6198041805198041805000a40009000119b8948008ccc888c8c8c94ccc04ccdc3a4004002290000991bad3019001301100230110013253330123370e90010008a60103d87a800013232323300100100222533301900114c103d87a8000132323232533301a3371e016004266e9520003301e375000297ae0133006006003375a60360066eb8c064008c074008c06c004dd5980c00098080011808000991980080080211299980a8008a60103d87a800013232323253330163371e010004266e9520003301a374c00297ae01330060060033756602e0066eb8c054008c064008c05c004dd5998049805998049805800a400490010038028a4c2c6eb8004dd700099800800a40004444666600e66e1c00400c0308cccc014014cdc000224004601c0020040044600a6ea80048c00cdd5000ab9a5573aaae7955cfaba05742ae881"

      const compiled= applyParamsToScript(SpendingSrc,[this.policy,this.assetName]  );
    
      //const myUplcProgram = program.compile(simplify)
      this.token = token 

      this.ValidatorScript = { type: "PlutusV2", script : compiled}
      //this.StakingScript = this.ValidatorScript
      this.StakingScript = { type: "PlutusV2", script :compiled }
      
      this.wallet_address = "";
      this.delegation = {poolId: null, rewards: null}
      this.defaultAddress= ""
      this.txDetails = {}
      this.pendingTxs = [];
      this.addressNames = {}
      this.utxos = []
      this.api = api
      
    }

  
 

    async initialize (settings){
      this.settings = settings
      this.lucid = await this.newLucidInstance(settings);
      this.lucid.selectWalletFrom(  { "address":this.getAddress()})
      await this.loadUtxos()
    } 

  async newLucidInstance(settings) {

    return getNewLucidInstance(settings)
  }

    async changeSettings(settings){
      this.settings = settings
      if(settings.network !== this.lucid.network){
        this.utxos = []
        this.delegation = {poolId: null, rewards: null}
      }

      try{
        changeProvider(this.lucid, settings)
      await this.loadUtxos()
    }catch(e){
      throw new Error('Invalid Connection Settings'+ e);
    }
    }

    removePendingTx(index){
      this.pendingTxs.splice(index, 1);
    }

    
    getJson() {
      return { type: "tokenVault" , token : this.token}
    }

   

    getName(){
      return this.name
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
      //  return "addr1qx0mmzuwnya2yasfy78klcqazd73a320a9agpunuv4zqlyjwrycda8m2jmtws4hktfq6xp59q2t2a8w6elnky6a9txts5a6hkj"
        const rewardAddress = stakingAddress === "" ? this.lucid.utils.validatorToScriptHash(this.StakingScript) : this.lucid.utils.getAddressDetails(stakingAddress).stakeCredential.hash
        return this.lucid.utils.validatorToAddress(this.ValidatorScript, {type:"Script", hash: rewardAddress} )
    }

    getPaymentCredential() {
      return this.lucid.utils.getAddressDetails(this.getAddress()).paymentCredential
    }

    getStakingAddress() {
      return this.lucid.utils.validatorToRewardAddress(this.ValidatorScript)
    }
      
    getToken() {
      return this.token
    }
 
    getSigners(){
      return []
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
      return this.utxos.find(utxo => utxo.txHash === utxoHash )
    }
    async getUtxosByOutRef(OutputRef)  {
      const resault= await this.lucid.provider.getUtxosByOutRef(OutputRef.map( outRef =>({txHash:outRef.transaction_id, outputIndex:Number(outRef.index)})))
      return resault
    }
    
    filterUtxos(utxos){ 
      return utxos.filter(utxo => utxo.datum !== undefined )
    }

    async loadUtxos() {
      try{
        const utxos = await this.lucid.provider.getUtxos(this.lucid.utils.getAddressDetails(this.getAddress()).paymentCredential)
        if (this.compareUtxos( utxos, this.utxos)){
            return
        }
        this.utxos = utxos
        await this.getDelegation()
   
        }
    catch(e){
        console.error(e)
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
     
    
    
    async createTx( recipients, signers,sendFrom="" , sendAll=null , withdraw=true ) { 
      const lucid = await this.newLucidInstance(this.settings);
          
        
        let utxos = this.utxos
        if(sendFrom!==""){ 
          utxos = this.utxos.filter( (utxo,index) => (utxo.address === sendFrom)  )
       }

        lucid.selectWallet(this.api)
        const hostUtxo = (await lucid.wallet.getUtxos()).find(utxo => Object.keys(utxo.assets).includes(this.token)) 
        if (hostUtxo === undefined){
          throw new Error('tokenVault not found in connected wallet');
        }
        

        const OutputTx = lucid.newTx()
        recipients.map( (recipient,index) => {
          if( sendAll !== index) 
            this.isAddressScript(recipient.address) ? OutputTx.payToAddressWithData(recipient.address, {inline : Data.void()},recipient.amount) : OutputTx.payToAddress(recipient.address,recipient.amount)
        })

        const TokenHostTx = lucid.newTx().payToAddress(hostUtxo.address, hostUtxo.assets).collectFrom([hostUtxo])
     //   const collateralTx = lucid.newTx().payToAddress(this.collateralUtxo.address, this.collateralUtxo.assets).collectFrom([this.collateralUtxo])
        
        if(withdraw && Number(this.delegation.rewards) > 0 ){
          tx.withdraw(this.lucid.utils.validatorToRewardAddress(this.ValidatorScript), this.delegation.rewards)
        }

        const inputsTx = lucid.newTx().attachSpendingValidator(this.ValidatorScript).collectFrom(utxos , Data.void())

        const signersTx = lucid.newTx().addSigner(hostUtxo.address)
     //   const complete = await tx.complete()
        const finaltx = lucid.newTx()
        .compose(TokenHostTx)
        .compose(OutputTx)
        .compose(signersTx)
        .compose(inputsTx)
      const returnAddress = sendAll !== null ? recipients[sendAll].address : sendFrom!=="" ? sendFrom : this.getAddress()

      const changeObject = this.isAddressScript(returnAddress) ? {address : returnAddress ,  outputData : {inline : Data.void()}} : {address : returnAddress}

      const completedTx = await finaltx.complete({ change :changeObject , 
                                                    coinSelection : false})

        return completedTx

    }


    
    async createStakeUnregistrationTx(){
      const curentDelegation = await this.getDelegation()
      const rewardAddress = this.lucid.utils.credentialToRewardAddress(this.lucid.utils.getAddressDetails(this.getAddress()).stakeCredential) 
      const lucid = await this.newLucidInstance(this.settings);
      lucid.selectWallet( this.api)
    
      const hostUtxo = (await lucid.wallet.getUtxos()).find(utxo => Object.keys(utxo.assets).includes(this.token)) 
      if (hostUtxo === undefined){
        throw new Error('tokenVault not found in connected wallet');
      }
      const TokenHostTx = lucid.newTx().payToAddress(hostUtxo.address, hostUtxo.assets).collectFrom([hostUtxo])
      const signersTx = lucid.newTx().addSigner(hostUtxo.address)
      const inputsTx = lucid.newTx().attachSpendingValidator(this.ValidatorScript).collectFrom( this.getUtxos() , Data.void())

      const delegationTx =  lucid.newTx()
      .deregisterStake(rewardAddress, Data.void())
      .attachCertificateValidator(this.StakingScript)
      .attachWithdrawalValidator(this.StakingScript)
        
      const finaltx = lucid.newTx()

      finaltx.compose(TokenHostTx)
      .compose(delegationTx)
      .compose(signersTx)
      .compose(inputsTx)

      const completedTx = await finaltx.complete({ change :{address : this.getAddress() , outputData : {inline : Data.void()}}, coinSelection : false})
      // const completedTx = sendAll === null ? await finaltx.complete( ) : await finaltx.complete({ change :{address :recipients[sendAll].address }}) 
      return completedTx

    }

    async createDelegationTx(pool){ 
      const curentDelegation = await this.getDelegation()
      const rewardAddress = this.lucid.utils.credentialToRewardAddress(this.lucid.utils.getAddressDetails(this.getAddress()).stakeCredential) 
      const lucid = await this.newLucidInstance(this.settings);
      lucid.selectWallet( this.api)
    
      const hostUtxo = (await lucid.wallet.getUtxos()).find(utxo => Object.keys(utxo.assets).includes(this.token)) 
      if (hostUtxo === undefined){
        throw new Error('tokenVault not found in connected wallet');
      }
      const TokenHostTx = lucid.newTx().payToAddress(hostUtxo.address, hostUtxo.assets).collectFrom([hostUtxo])
      const signersTx = lucid.newTx().addSigner(hostUtxo.address)
      const inputsTx = lucid.newTx().attachSpendingValidator(this.ValidatorScript).collectFrom( this.getUtxos() , Data.void())

      const delegationTx =  lucid.newTx()
      .delegateTo(rewardAddress,pool, Data.void())
      .attachCertificateValidator(this.StakingScript)
    //  .attachWithdrawalValidator(this.StakingScript)
     
      
      const finaltx = lucid.newTx()

      if (curentDelegation.poolId === pool){
        throw new Error('Already delegated to this pool');
      } else if (curentDelegation.poolId === null){
        const tx = lucid.newTx().registerStake(rewardAddress)
        finaltx.compose(tx) 
      }

      finaltx.compose(TokenHostTx)
      .compose(delegationTx)
      .compose(signersTx)
      .compose(inputsTx)

      const completedTx = await finaltx.complete({ change :{address : this.getAddress() , outputData : {inline : Data.void()}}, coinSelection : false})
      // const completedTx = sendAll === null ? await finaltx.complete( ) : await finaltx.complete({ change :{address :recipients[sendAll].address }}) 
      return completedTx
    }

    isAddressMine(address){
      return (this.lucid.utils.getAddressDetails(address).paymentCredential.hash === this.lucid.utils.getAddressDetails(this.getAddress()).paymentCredential.hash)
    }

    isAddressValid(address){
      try {
          return  this.lucid.utils.getAddressDetails(address) ? true : false
      }catch(e){
        return false
      }
    }

    isAddressScript(address){
      return this.lucid.utils.getAddressDetails(address).paymentCredential.type === "Script"
    }
    
    decodeSignature(signature){

      try{
      const witness  =  C.TransactionWitnessSet.from_bytes(this.hexToBytes(signature))
      const signer = witness.vkeys().get(0).vkey().public_key().hash().to_hex();
      return {signer: signer , witness : witness}     
      }catch(e){
        console.log(e)
        throw new Error('Invalid signature');
      }
    }


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
                   this.pendingTxs[index].signatures[signatureInfo.signer] = signature
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

    async submitTransaction(tx){
      try{
        const txHash = await tx.submit();
        return( this.lucid.awaitTx(txHash, 2500))
      }catch(e){
        console.log(e)
        const errorMessage = e.message ? e.message : JSON.stringify(e) 
        throw new Error(errorMessage);
      }
    }



    setDefaultAddress(address){
      this.defaultAddress = address
    }
    
    setAddressNames(names){
      this.addressNames = names
    }

    setName(name){
      this.name = name
    }


    changeAddressName(address,name){
      this.addressNames[address] = name
    }

    getDefaultAddress(){
        if (this.defaultAddress === null) {
            this.defaultAddress = this.getAddress();
        }
        return this.defaultAddress;
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