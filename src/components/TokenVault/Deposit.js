import React, { useEffect , useState} from 'react';
import { Lucid , Data , C } from 'lucid-cardano';

function Deposit(props) {
    const [utxos, setUtxos] = useState([])
    const [amount, setAmount] = useState(10000000)
    const api = props.moduleRoot.state.connectedWallet.api
    const lucid = props.moduleRoot.state.connectedWallet.lucid
    console.log(props)


    useEffect(() => {
        async function getUtxos() {
            if (lucid){
                const utxos = await lucid.wallet.getUtxos()
               setUtxos(utxos)
            }
        }
        getUtxos()
    }, [lucid, api])

    async function performDeposit() {
        console.log("performing deposit", props.moduleRoot.state.connectedWallet.lucid)
        const lucid = await props.moduleRoot.state.wallet.newLucidInstance(props.root.state.settings)
        lucid.selectWallet(props.moduleRoot.state.connectedWallet.api)
        const tx = await lucid.newTx().payToContract(props.moduleRoot.state.wallet.getAddress() , Data.void(), {"lovelace" : BigInt(amount)}).complete()
        const signedTx = await tx.sign().complete()
        const txHash = await signedTx.submit()
        console.log(props.moduleRoot.state.wallet.getAddress())
       
        
    }

    return(
        <div>
            <h1>Deposit</h1>
            <p>Deposit your tokens to the vault</p>
            <input type="text" placeholder="Amount" value={amount}  onChange={(event) => setAmount(event.target.value) }/>
            <button onClick={() => { performDeposit() }}>Deposit</button>
            <p> </p>
            </div>
            )
        }

export default Deposit;