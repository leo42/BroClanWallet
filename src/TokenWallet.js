import {   C , Lucid, Blockfrost , TxComplete ,Kupmios , Data , Constr} from "lucid-cardano";
const { Transaction} = C;
import {  toast } from 'react-toastify';
import { Program } from "@hyperionbt/helios"

class Wallet {
    constructor(token, utxo, collateralUtxo) {
    console.log(token, utxo, collateralUtxo)

      const policy = token.substring(0, 56)
      const assetName = token.substring(56 )
      console.log(policy, assetName)
      const SpendingSrc = `
      spending TokenKey

      const  MintingPolicy: ByteArray = #${policy}
      const TokenName: String = "${assetName}"
      func main(_, _, ctx: ScriptContext) -> Bool {
           
      
      tt_assetclass: AssetClass = AssetClass::new(
             MintingPolicyHash::new(MintingPolicy),
                TokenName.serialize()
          );
      
      ctx.tx.inputs.any((input: TxInput) -> Bool { 
                                              input.value.get_safe( tt_assetclass) !=  0
                                          })
                                          
      }
`     
      const program = Program.new(SpendingSrc)

      const simplify = true
    
      const myUplcProgram = program.compile(simplify)
    
      this.token = token 

      this.ValidatorScript = { type: "PlutusV2", script : JSON.parse(myUplcProgram.serialize()).cborHex }

      this.wallet_address = "";
      this.delegation = {poolId: null, rewards: null}
      this.defaultAddress= ""
      this.txDetails = {}
      this.pendingTxs = [];
      this.addressNames = {}
      this.utxos = []
      this.hostUtxo = utxo
      this.collateralUtxo = collateralUtxo
    }

  
 

    async initialize (settings){
      this.settings = settings
      this.lucid = await this.newLucidInstance(settings);
      

     
      
      this.lucid.selectWalletFrom(  { "address":this.getAddress()})
      await this.loadUtxos()
      // reload utxos every 15 seconds
      setInterval(() => {
        this.loadUtxos()
      }
      , 15000);

    } 

  async newLucidInstance(settings) {
    if (settings.provider === "Blockfrost") {
      return await Lucid.new(
        new Blockfrost(settings.api.url, settings.api.projectId),
        settings.network
      );
    } else if (settings.provider === "Kupmios") {
      return await Lucid.new(
        new Kupmios(settings.api.kupoUrl, settings.api.ogmiosUrl),
        settings.network
      );
    } else if (settings.provider === "MWallet") {
      return await Lucid.new(
        new Blockfrost(settings.api.url, settings.api.projectId),
        settings.network
      );
    }
  }

    async changeSettings(settings){
      this.settings = settings
      if(settings.network !== this.lucid.network){
        this.utxos = []
        this.delegation = {poolId: null, rewards: null}
      }

      try{
      if (settings.provider === "Blockfrost"){
        await this.lucid.switchProvider(new Blockfrost(settings.api.url, settings.api.projectId), settings.network)
      }else if (settings.provider === "Kupmios"){
        await this.lucid.switchProvider(new Kupmios(settings.api.kupoUrl, settings.api.ogmiosUrl), settings.network)
      }else if (settings.provider === "MWallet"){
        await this.lucid.switchProvider(new Blockfrost(settings.api.url, settings.api.projectId), settings.network)
      }
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

    getCBOR() {
      return  JSON.stringify(this.ValidatorScript);
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
      //  return "addr1qx0mmzuwnya2yasfy78klcqazd73a320a9agpunuv4zqlyjwrycda8m2jmtws4hktfq6xp59q2t2a8w6elnky6a9txts5a6hkj"
        const rewardAddress = stakingAddress === "" ? this.lucid.utils.validatorToScriptHash(this.ValidatorScript) : this.lucid.utils.getAddressDetails(stakingAddress).stakeCredential.hash
        return this.lucid.utils.validatorToAddress(this.ValidatorScript, {type:"key", hash: rewardAddress} )
    }

    getStakingAddress() {
      return this.lucid.utils.validatorToRewardAddress(this.ValidatorScript)
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
      console.log(utxos)
      return utxos.filter(utxo => utxo.datum !== undefined )
    }

    async loadUtxos() {
      try{
      const utxos = this.filterUtxos (await this.lucid.provider.getUtxos(this.lucid.utils.getAddressDetails(this.getAddress()).paymentCredential))
      
     
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
          console.log("Remove Pending Tx")
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
      return true
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
      const lucid = await this.newLucidInstance(this.settings);
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
        //check if there is enough funds in the wallet
        const balance = this.getBalanceFull()
        
        console.log("createTx")
        
        for (const [key, value] of Object.entries(sumOfRecipientsMinusSendAll)) {
          if (key in balance){
            if (balance[key] < value){
                throw new Error('Not enough funds');
              }
            }else{
              throw new Error('Not enough funds');
            }
          }
    
          let utxos = this.utxos
        if(sendFrom!==""){ 
          utxos = this.utxos.filter( (utxo,index) => (utxo.address === sendFrom)  )
          lucid.selectWalletFrom(  { "address":sendFrom, "utxos": []})
       }else{
          lucid.selectWalletFrom(  { "address":this.getAddress(), "utxos": []})
        }

        const sendAllAmount = this.substructBalanceFull(sumOfRecipientsMinusSendAll,sendFrom) 
        sendAllAmount["lovelace"] = sendAllAmount["lovelace"] - BigInt(500_000  +  200_000 * signers.length + 500_000 * recipients.length)

        const OutputTx = lucid.newTx()
        recipients.map( (recipient,index) => (
          sendAll === index ? OutputTx.payToAddress(recipient.address,  sendAllAmount ) : OutputTx.payToAddress(recipient.address,recipient.amount)
        ))
        const TokenHostTx = lucid.newTx().payToAddress(this.hostUtxo.address, this.hostUtxo.assets).collectFrom([this.hostUtxo])
        console.log(utxos, this.hostUtxo, this.collateralUtxo)
        const collateralTx = lucid.newTx().payToAddress(this.collateralUtxo.address, this.collateralUtxo.assets).collectFrom([this.collateralUtxo])
        
        // if(withdraw && Number(this.delegation.rewards) > 0 ){
        //   tx.withdraw(this.lucid.utils.validatorToRewardAddress(this.ValidatorScript), this.delegation.rewards).collectFrom( this.collateralUtxo)
        // }

        const inputsTx = lucid.newTx().collectFrom(utxos , Data.void()).attachSpendingValidator(this.ValidatorScript)
        const signersTx = lucid.newTx().addSigner(this.hostUtxo.address)
     //   const complete = await tx.complete()
        const finaltx = lucid.newTx()
                        .compose(inputsTx)
                        .compose(collateralTx)
                        .compose(TokenHostTx)
                        .compose(OutputTx)
                        .compose(signersTx)
                        
      const completedTx = await finaltx.complete()
       // const completedTx = sendAll === null ? await finaltx.complete( ) : await finaltx.complete({ change :{address :recipients[sendAll].address }}) 
        console.log(completedTx.toString())
        return completedTx
        const txId = await completedTx.submit()
        console.log(txId)
      
        return "Sucsess"
    }

    async importTransaction(transaction)
    { 
      if (!await this.checkTransaction(transaction)){
        throw new Error("Transaction invalid")
      }
      let uint8Array , tx

      try{
        //if transaction type is string


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

      this.pendingTxs.push({tx:tx, signatures:{}})
      
      }catch(e){
        console.log(e)
        throw new Error('Transaction already registered');
      }
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
      const rewardAddress =  this.lucid.utils.validatorToRewardAddress(this.ValidatorScript)

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
        tx.withdraw(this.lucid.utils.validatorToRewardAddress(this.ValidatorScript), this.delegation.rewards)
      }

      if (sigCheck.requires_after !== false){
        tx.validFrom( this.lucid.utils.slotToUnixTime(sigCheck.requires_after))
        
      }

      if (sigCheck.requires_before !== false){
        tx.validTo( this.lucid.utils.slotToUnixTime(sigCheck.requires_before))
      }


      const completedTx = await tx.attachSpendingValidator(this.ValidatorScript)
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
      const rewardAddress =  this.lucid.utils.validatorToRewardAddress(this.ValidatorScript)
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
      .attachSpendingValidator(this.ValidatorScript)
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