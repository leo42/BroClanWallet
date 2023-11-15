
import React from 'react';
import WalletConnector from './walletConnector';
import Wallet from "../../../../shared/wallets/TokenWallet.js"
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
      if(connectedWallet){
        await  this.connectWallet(connectedWallet)
        const selectedWallet = JSON.parse( localStorage.getItem("TokenVaultsSelectedWallet"+this.state.connectedWallet.name) )
        if(selectedWallet){
          await this.selectWallet(selectedWallet )
        }
      }
      setInterval(() => {
        this.reloadUtXOs()
      }
      , 5000);
    }

    async selectWallet(token){
      if(!((await this.state.connectedWallet.lucid.wallet.getUtxos() ).map(utxo =>  Object.keys(utxo.assets).map (asset => asset))).flat(1).includes(token)) return
      const wallet = new Wallet(token, this.state.connectedWallet.api)    
      await wallet.initialize(this.props.root.state.settings)
      
      localStorage.setItem("TokenVaultsSelectedWallet"+this.state.connectedWallet.name, JSON.stringify(token))
      this.setState({wallet: wallet})
    }
 
   async connectWallet(walletName){
    try{
      const connection =  await window.cardano[walletName].enable();
      const lucid = await Lucid.new( );
      lucid.selectWallet(connection)
      localStorage.setItem("TokenVaultsConnectedWallet", JSON.stringify(walletName))
      this.setState({connectedWallet: { name: walletName, api : connection , lucid : lucid}})
      this.listenforAddressChange()
      this.setState({wallet: undefined})
    }catch(e){
      console.log(e)
    }
    }

    listenforAddressChange(){
      this.state.connectedWallet.lucid.wallet.address().then((ogAddress) => {
        //loop every 5 seconds to check if address has changed
        var id = setInterval((interval) => {
          this.state.connectedWallet.lucid.wallet.address().then((address) => {
            if(ogAddress !== address){
              clearInterval(id)
              this.connectWallet(this.state.connectedWallet.name)
              
              return
              
            }
          })
        }
        , 1000);

      })
      
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
        toast.error(e.message ? e.message : e)
        console.log(e)
      }
    }

    async createDelegationTx(poolId){
      try{
        const tx = await this.state.wallet.createDelegationTx(poolId)

        const signature = await this.state.connectedWallet.api.signTx(tx.toString(), true)
        const signedTx = await tx.assemble([signature]).complete()
        const submiting =  this.state.wallet.submitTransaction(signedTx)
        toast.promise(submiting, {
          pending: 'Submitting Delegation transaction',
          success: 'Delegation confirmed',
          error: 'Delegation failed',
        })
      }catch(e){
        toast.error(e.message ? e.message : e)
        console.log(e)
      }
      
    }

    async createStakeUnregistrationTx(){
      try{
        const tx = await this.state.wallet.createStakeUnregistrationTx()        
        const signature = await this.state.connectedWallet.api.signTx(tx.toString(), true)
        const signedTx = await tx.assemble([signature]).complete()
        const submiting =  this.state.wallet.submitTransaction(signedTx)
        toast.promise(submiting, {
          pending: 'Submitting Undelegation transaction',
          success: 'Undelegation confirmed',
          error: 'Undelegation failed',
        })
      }catch(e){
        toast.error(e.message ? e.message : e)
        console.log(e)
      }

    }

    modalType(){
      return "tokenVault"
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
            <div className="TokenVaultsContainerHeader">
          {this.state.connectedWallet !== "none" && <MWalletList wallet={this.state.connectedWallet} root={this.props.root} moduleRoot={this}  selected={this.state.wallet ? this.state.wallet.getToken(): undefined}></MWalletList> }
          <WalletConnector  moduleRoot={this} root={this.props.root}   key={this.state.connectedWallet}></WalletConnector>
          </div>
          <div className='WalletInner'>

          {this.state.wallet  && <WalletMain key={this.state.wallet} wallet={this.state.wallet} root={this.props.root} moduleRoot={this}  ></WalletMain>}
          </div>
          </React.StrictMode>
      </div>
    )  
  }
  }

    export default TokenVaultsContainer;