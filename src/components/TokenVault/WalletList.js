import React from 'react';
import {useState , useEffect} from 'react';
import "./WalletList.css"
import { Lucid, C } from "lucid-cardano";
function WalletList (props) {
    const [tokens, setTokens] = useState(["test1","test2"])
    
    async function getTokens ()  {
        const lucid = await Lucid.new( );
        
        const api =  await window.cardano[props.wallet].enable()
        lucid.selectWallet(api)
        const utxos = await lucid.wallet.getUtxos()
        setTokens(getUtxoTokens(utxos))
    }

    function getUtxoTokens(utxos) {
        const tokens = []
        utxos.map(utxo => {
             Object.keys(utxo.assets).map(asset => {
                if (asset !== "lovelace") {
                 console.log(utxo.assets[asset])
                 if (!( asset in tokens)) 
                    tokens.push(asset)
                 
                }
            })
        }
        )
        console.log(tokens)
        return tokens

    }

    useEffect(() => {
        getTokens();
    }, [props.wallet]); 
    
    return (
    <div className='WalletListContainer'>

        <select className="MWalletList" onChange={(event) => props.moduleRoot.selectWallet(event.target.value)}>
        {tokens.map( (item, index) => (
               <option key={index} value={index}> {item}{props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  } </option>
        ))}
</select>
    </div>
    );
    
}
 
export default WalletList;