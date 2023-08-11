import React from 'react';
import {useState , useEffect} from 'react';
import "./WalletList.css"
import TokenThumbnail from '../TokenThumbnail'; 


function WalletList (props) {
    const [tokens, setTokens] = useState({})
    const [collateralUtxo, setCollateralUtxo] = useState(undefined)
    const [expanded, setExpanded] = useState(true)

    async function getTokens ()  {
        const lucid = await props.moduleRoot.state.connectedWallet.lucid
        const utxos = await lucid.wallet.getUtxos()
        console.log(utxos)
        setTokens(getUtxoTokens(utxos))
       
    }

    function selectWallet(token) {
        props.moduleRoot.selectWallet(token)
        setExpanded(false)
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
        <div className="tokenWalletSelected" onClick={() => setExpanded(!expanded)}> {props.selected && <TokenThumbnail tokenId={props.selected} f={selectWallet} key={props.selected}/> }
        
        </div>
        
        {expanded &&  <div className='tokenWalletList' > {Object.keys(tokens).map( (item, index) => (
                 <TokenThumbnail tokenId={item} f={selectWallet} key={item}/>
                 
        )) }
        <div className='Overlay' onClick={() => setExpanded(false)} />
       </div>
        
        
        }
    </div>
    );
    
}
 
export default WalletList;