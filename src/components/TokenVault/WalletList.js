import React from 'react';
import {useState , useEffect} from 'react';
import "./WalletList.css"
import { Lucid, C } from "lucid-cardano";
function WalletList (props) {
    const [tokens, setTokens] = useState({})
    const [collateralUtxo, setCollateralUtxo] = useState(undefined)
    async function getTokens ()  {
        const lucid = await Lucid.new( );
        
        const api =  await window.cardano[props.wallet].enable()
        lucid.selectWallet(api)
        const utxos = await lucid.wallet.getUtxos()
        console.log(utxos)
        setTokens(getUtxoTokens(utxos))
       
    }

    function getUtxoTokens(utxos) {
        const tokens = {}
        console.log(utxos)
       utxos.map(utxo => {
            if (Object.keys(utxo.assets).length = 1 && Number( utxo.assets["lovelace"]) > 5_000_000 && (collateralUtxo === undefined || Number(utxo.assets["lovelace"]) < Number(collateralUtxo.assets["lovelace"])) ) {
                console.log("setting collateral")
               setCollateralUtxo(utxo)
           }
             Object.keys(utxo.assets).map(asset => {
                if (asset !== "lovelace") {
                 console.log(utxo.assets[asset])
                 if (!( asset in tokens)) 
                    {
                        tokens[asset] = utxo
                    }
                }
                
            })
        })

        console.log(tokens)
        if (Object.keys(tokens).length > 0) {
            props.moduleRoot.selectWallet(Object.keys(tokens)[0],  tokens[Object.keys(tokens)[0]] , collateralUtxo)
        }
        return tokens
    }

    useEffect(() => {
        getTokens();
    }, [props.wallet]); 
    
    return (
    <div className='WalletListContainer'>

        <select className="MWalletList" onChange={(event) => props.moduleRoot.selectWallet(event.target.value,  tokens[event.target.value] , collateralUtxo)}>
        {Object.keys(tokens).map( (item, index) => (
               <option key={index} value={item}> {item}{props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"  } </option>
        ))}
</select>
    </div>
    );
    
}
 
export default WalletList;