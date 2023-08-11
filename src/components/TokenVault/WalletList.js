import React from 'react';
import {useState , useEffect} from 'react';
import "./WalletList.css"
import TokenThumbnail from '../TokenThumbnail'; 
import  { ReactComponent as LoadingIcon } from '../../html/assets/loading.svg';

function WalletList (props) {
    const [tokens, setTokens] = useState({})
    const [collateralUtxo, setCollateralUtxo] = useState(undefined)
    const [expanded, setExpanded] = useState(false)
    const [loading, setLoading] = useState(true)

    async function getTokens ()  {
        
        const lucid = await props.moduleRoot.state.connectedWallet.lucid
        const utxos = await lucid.wallet.getUtxos()
        console.log(utxos)
        setTokens(getUtxoTokens(utxos))
        setLoading(false)
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
              
        <div className="tokenWalletSelected" onClick={() => setExpanded(!expanded)}> 
        {props.selected ? <TokenThumbnail tokenId={props.selected} f={selectWallet} key={props.selected}/> : <div className="tokenWalletSelectedEmpty" >Select a token</div>
        
        }
        </div>
        {( loading && !props.selected)  ? <LoadingIcon className="loadingIcon"> </LoadingIcon> : 
        <div >
        {(Object.keys(tokens).length === 0 && !props.selected )? "No tokenized wallets found, Please visit TODO to get one" :
        (expanded || !props.selected) &&  <div className='tokenWalletListContainer'> <div className='tokenWalletList' > {Object.keys(tokens).map( (item, index) => (
                 <TokenThumbnail tokenId={item} f={selectWallet} key={item}/>
                 
        )) }
        <div className='Overlay' onClick={() => setExpanded(false)} />
        </div>
        </div>}
       </div>
        
        
        }
         
    </div>
    );
    
}
 
export default WalletList;