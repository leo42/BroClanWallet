
import React from 'react';
import WalletConnector from './walletConnector';
import Wallet from "../../TokenWallet.js"
import "./TokenVaultContainer.css"
import MWalletList from './WalletList';
import WalletMain from './WalletMain';
import { Lucid } from 'lucid-cardano';
import { toast } from 'react-toastify';

class TokenVaultsContainer extends React.Component {
    state= {
      connectedWallet: "none",
      wallet : undefined
    }

    async componentDidMount(){
      const connectedWallet = JSON.parse( localStorage.getItem("TokenVaultsConnectedWallet") )
      console.log(connectedWallet)
      if(connectedWallet){
        await  this.connectWallet(connectedWallet)
        const selectedWallet = JSON.parse( localStorage.getItem("TokenVaultsSelectedWallet") )
        if(selectedWallet){
          await this.selectWallet(selectedWallet )
        }
      }
      setInterval(() => {
        this.reloadUtXOs()
      }
      , 15000);
    }

    async selectWallet(token){
      console.log("selecting wallet")
      const wallet = new Wallet(token, this.state.connectedWallet.api)    
      await wallet.initialize(this.props.root.state.settings)
      localStorage.setItem("TokenVaultsSelectedWallet", JSON.stringify(token))
      this.setState({wallet: wallet})
      this.loadAddress()
     }
 
   async connectWallet(walletName){
    try{
      console.log(window.cardano)
      const connection =  await window.cardano[walletName].enable();
      const lucid = await Lucid.new( );
      lucid.selectWallet(connection)
      localStorage.setItem("TokenVaultsConnectedWallet", JSON.stringify(walletName))
      this.setState({connectedWallet: { name: walletName, api : connection , lucid : lucid}})
    }catch(e){
      console.log(e)
    }
    }

    storeAddress()  {
      if (this.state.loading) return
      const addressDataPack = JSON.parse(localStorage.getItem("tokenWalletAddressDataPack")) ?JSON.parse(localStorage.getItem("tokenWalletAddressDataPack")) : {}
      const wallet = this.state.wallet
      addressDataPack[wallet.getToken()] =  {  defaultAddress: wallet.getDefaultAddress(),
                                               addressNames: wallet.getAddressNames()                                                              
                                          }
      localStorage.setItem("tokenWalletAddressDataPack", JSON.stringify(addressDataPack))
    }

    loadAddress() {
      const addressDataPack = JSON.parse(localStorage.getItem("tokenWalletAddressDataPack"))  ? JSON.parse(localStorage.getItem("tokenWalletAddressDataPack")) : undefined
      
      if (addressDataPack && addressDataPack[this.state.wallet.getToken()]) {
        const wallet = this.state.wallet
        wallet.setDefaultAddress(addressDataPack[this.state.wallet.getToken()].defaultAddress)
        wallet.setAddressNames(addressDataPack[this.state.wallet.getToken()].addressNames)
        this.setState({wallet: wallet})
      }
    }

    disconnectWallet(){
      this.setState({connectedWallet: "none"})
      this.setState({wallet: undefined})
      localStorage.removeItem("TokenVaultsConnectedWallet")
      localStorage.removeItem("TokenVaultsSelectedWallet")
    }

    async createTx(recipients,signers,sendFrom, sendAll=null){
      try{
       const tx = await this.state.wallet.createTx(recipients,signers,sendFrom,sendAll)
        const signature = await this.state.connectedWallet.api.signTx(tx.toString(), true)
        const signedTx = await tx.assemble([signature]).complete()
        const submiting =  this.state.wallet.submitTransaction(signedTx)
        toast.promise(submiting, {
          pending: 'Submitting transaction',
          success: 'Transaction confirmed',
          error: 'Transaction failed',
        })
      }catch(e){
        console.log(e)
        toast.error(e)
      }
    }

    async createDelegationTx(poolId){
      try{
        const tx = await this.state.wallet.createDelegationTx(poolId)
        console.log(tx)

        const signature = await this.state.connectedWallet.api.signTx(tx.toString(), true)
        const signedTx = await tx.assemble([signature]).complete()
        const submiting =  this.state.wallet.submitTransaction(signedTx)
        toast.promise(submiting, {
          pending: 'Submitting Delegation transaction',
          success: 'Delegation confirmed',
          error: 'Delegation failed',
        })
      }catch(e){
        console.log(e)
        toast.error(e)
      }
      
    }

    async createStakeUnregistrationTx(){
      try{
        const tx = await this.state.wallet.createStakeUnregistrationTx()
        console.log(tx)
        
        const signature = await this.state.connectedWallet.api.signTx(tx.toString(), true)
        const signedTx = await tx.assemble([signature]).complete()
        const submiting =  this.state.wallet.submitTransaction(signedTx)
        toast.promise(submiting, {
          pending: 'Submitting Undelegation transaction',
          success: 'Undelegation confirmed',
          error: 'Undelegation failed',
        })
      }catch(e){
        console.log(e)
        toast.error(e)
      }

    }

    changeAddressName (address, name) {
      const wallet = this.state.wallet
      this.state.wallet.changeAddressName(address, name)
      this.setState({wallet: wallet})
      this.storeAddress() 
    }

    setDefaultAddress (address) {
      const wallet = this.state.wallet
      this.state.wallet.setDefaultAddress(address)
      this.setState({wallet: wallet})
      this.storeAddress() 
    }

    reloadUtXOs(){
      if(!this.state.wallet) return
      const wallet = this.state.wallet
      wallet.loadUtxos()
      this.setState({wallet: wallet})
    }

render() {  
    return(
      <div className={ this.state.connectedWallet !== "none" ? "TokenVaultsContainer TokenVaultsContainerActive" :  "TokenVaultsContainer"} >
          <React.StrictMode>
          {this.state.connectedWallet !== "none" && <MWalletList wallet={this.state.connectedWallet} root={this.props.root} moduleRoot={this}  selected={this.state.wallet ? this.state.wallet.getToken(): undefined}></MWalletList> }
  
          <WalletConnector  moduleRoot={this}   key={this.state.connectedWallet}></WalletConnector>
          <div className='WalletInner'>

          {this.state.wallet  && <WalletMain key={this.state.wallet} wallet={this.state.wallet} root={this.props.root} moduleRoot={this}  ></WalletMain>}
          </div>
          </React.StrictMode>
      </div>
    )  
  }
  }

    export default TokenVaultsContainer;