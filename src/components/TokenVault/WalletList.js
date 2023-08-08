import React from 'react';
import {useState , useEffect} from 'react';
import "./WalletList.css"

function WalletList (props) {
    const [tokens, setTokens] = useState({})
    const [collateralUtxo, setCollateralUtxo] = useState(undefined)

    async function getTokens ()  {
        const lucid = await props.moduleRoot.state.connectedWallet.lucid
        const utxos = await lucid.wallet.getUtxos()
        console.log(utxos)
        setTokens(getUtxoTokens(utxos))
       
    }

    function getUtxoTokens(utxos) {
        const tokens = {}
        console.log(utxos)
        let localCollateralUtxo = undefined
       utxos.map(utxo => {
            if (Object.keys(utxo.assets).length = 1 && Number( utxo.assets["lovelace"]) > 5_000_000 && (localCollateralUtxo === undefined || Number(utxo.assets["lovelace"]) < Number(localCollateralUtxo.assets["lovelace"])) ) {
                console.log("setting collateral", utxo)
                localCollateralUtxo = utxo
                setCollateralUtxo(localCollateralUtxo)
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
        }   )
    
       setCollateralUtxo(localCollateralUtxo)
        

        console.log(tokens)
        if (Object.keys(tokens).length > 0 && collateralUtxo) {
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