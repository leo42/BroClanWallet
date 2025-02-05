import {  Lucid } from "lucid-cardano";
import io from 'socket.io-client'
import { toast } from 'react-toastify';
import MultisigContainer from "../components/Multisig/MultisigContainer";
import MultisigWallet from "../components/Multisig/multisigWallet";
async function  connectSocket(wallet: string, root: MultisigContainer, syncService: string){
    const api = await window.cardano[wallet].enable()
    const lucid = await Lucid.new();
        lucid.selectWallet(api);
        const address = await lucid.wallet.address();
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
                for(let i = 0; i < root.state.wallets.length; i++){
                    root.walletHash(root.state.wallets[i].getJson()).then(walletHash => {
                        if ( walletHash === transaction.wallet){

                        root.loadTransaction(transaction, i)
                    }}
                )}
            })

        });


            
              
  
        
        //a function to decode CBOR address to base 68
        
    socket.on("authentication_challenge", (data) => {
        
        const signed = lucid.wallet.signMessage( address,data.challenge );
        signed.then((signature) => {
            socket.emit("authentication_response", {address : address  ,signature: signature , wallets:  root.state.wallets.map((wallet) => wallet.getJson() )})   
        }).catch((error) => {
            socket.close()
        })
        
    });

    socket.on("authentication_success", (data) => {
        localStorage.setItem("token_"+address, data.authenticationToken)
    });
    
    const token = localStorage.getItem("token_"+address) ? localStorage.getItem("token_"+address) : null;
    
    socket.emit("authentication_start", {token: token , wallets:  root.state.wallets.map((wallet : MultisigWallet) => wallet.getJson() ) });
    
    async function  handleWalletsFound (data : any){
        const pendingWallets = root.state.pendingWallets ? root.state.pendingWallets : {}
        const walletsHashes = root.state.wallets.map((wallet) => root.walletHash(wallet.getJson()))
        const res = await Promise.all(walletsHashes)
        var newWallets = false
        data.wallets.forEach((wallet: any) => {

            if(!Object.keys(pendingWallets).includes(wallet.hash) && !res.includes(wallet.hash)){
                pendingWallets[wallet.hash] = wallet
                newWallets = true
            }
        })
        if(newWallets){
            toast("New pending wallets added")
          }else{
            toast("No new pending wallets")
        }

        const state = root.state
        state.pendingWallets = pendingWallets
        root.setState(state)

    } 
    return socket
}  


export default  connectSocket