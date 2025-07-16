import {  Lucid } from "@evolution-sdk/lucid";
import io from 'socket.io-client'
import { toast } from 'react-toastify';
import MultisigContainer from "../components/Multisig/MultisigContainer";
import MultisigWallet from "../core/multisigWallet";
import SmartWalletContainer from "../components/SmartWallet/SmartWalletContainer";
import SmartWallet from "../core/smartWallet";

async function  connectSocket(wallet: string, root: MultisigContainer | SmartWalletContainer, syncService: string, network?: string){
    console.log("attempting to connect to network", network)
    const api = await window.cardano[wallet].enable()
    const lucid = await Lucid();
        lucid.selectWallet.fromAPI(api);
        const address = await lucid.wallet().address();
        const socket = io(syncService);
        
        

        socket.on('disconnect', () => {
            root.disconnectWallet()
            socket.close()
        });
        
        socket.on("error", (error) => {
            toast.error(error.error)
            socket.disconnect()
            
        });

        socket.on('connect_error', (error) => {
            root.disconnectWallet("Backend is not available" + error)
            socket.close()
          });

        socket.on('wallets_found', (data) => {
            handleWalletsFound(data)

        });

        socket.on('transaction', (data) => {
            data.transactions.map((transaction: any) => {
                    root.syncTransaction(transaction)
            })
        });
       
        //a function to decode CBOR address to base 68
        
    socket.on("authentication_challenge", async (data) => {
        
        const signed =  lucid.wallet().signMessage( address,data.challenge );
        console.log("signed", signed)
        signed.then((signature) => {
            socket.emit("authentication_response", {address : address  ,signature: signature , wallets:  root.state.wallets.map((wallet) => wallet.getId() )})   
        }).catch((error) => {
            socket.close()
        })
        
    });
    const tokenName = root instanceof SmartWalletContainer ? "token_smart" : "token_multisig"

    socket.on("authentication_success", (data) => {
        localStorage.setItem(tokenName+"_"+address, data.authenticationToken)
    });

        
    const token =  localStorage.getItem(tokenName+"_"+address) ? localStorage.getItem(tokenName+"_"+address) : null;
    
    socket.emit("authentication_start", {token: token , wallets:  root.state.wallets.map((wallet : MultisigWallet | SmartWallet) => wallet.getId() ) , network}  );
    
    async function  handleWalletsFound (data : any){
        const pendingWallets = root.state.pendingWallets ? root.state.pendingWallets : {}
        const walletsHashes = root.state.wallets.map((wallet) => wallet.getId())
        const res = await Promise.all(walletsHashes)
        var newWallets = false
        data.wallets.forEach((wallet: any) => {
            console.log("wallet", wallet)
            if(wallet.hash && !Object.keys(pendingWallets).includes(wallet.hash) && !res.includes(wallet.hash)){
                pendingWallets[wallet.hash] = wallet
                newWallets = true
            } // TODO depricate Hash for _id
             else if(!Object.keys(pendingWallets).includes(wallet.walletId) && !res.includes(wallet.walletId)){
                pendingWallets[wallet.walletId] = wallet
                newWallets = true
            }
        })
        if(newWallets){
            toast("New pending wallets added")
          }else{
            if(root.state.expectingWallets === true){
                toast("No new pending wallets")
            }
        }

        root.setPendingWallets(pendingWallets)
 
        root.stopExpectingWallets()

    } 
    return socket
}  


export default  connectSocket