import React from 'react';
import {useState , useEffect} from 'react';
import "./WalletList.css"
import TokenThumbnail from '../TokenThumbnail'; 
import  { ReactComponent as LoadingIcon } from '../../html/assets/loading.svg';
const policies = {
    Preprod : "abe45e53eddc87ce371e8164681173952560249d44f03973fdf426da"
}

function WalletList (props) {
    const [tokens, setTokens] = useState({})
    const [collateralUtxo, setCollateralUtxo] = useState(undefined)
    const [expanded, setExpanded] = useState(false)
    const [loading, setLoading] = useState(true)

    async function getTokens ()  {
        
        const lucid = await props.moduleRoot.state.connectedWallet.lucid
        const utxos = await lucid.wallet.getUtxos()
        setTokens(getUtxoTokens(utxos))
        setLoading(false)
    }

    function selectWallet(token) {
        props.moduleRoot.selectWallet(token)
        setExpanded(false)
    }

    function isValidToken(token) {
        if (token.substring(0, 56) === policies[props.root.state.settings.network]) {
           return true
        }else {
            return false
        }
}
    function getUtxoTokens(utxos) {
        const tokens = {}
        let localCollateralUtxo = undefined
       utxos.map(utxo => {
            if (Object.keys(utxo.assets).length = 1 && Number( utxo.assets["lovelace"]) > 5_000_000 && (localCollateralUtxo === undefined || Number(utxo.assets["lovelace"]) < Number(localCollateralUtxo.assets["lovelace"])) ) {
                localCollateralUtxo = utxo
                setCollateralUtxo(localCollateralUtxo)
           }
             Object.keys(utxo.assets).map(asset => {
                if (asset !== "lovelace") {
                 if (!( asset in tokens) && isValidToken(asset)) {
                    {
                        tokens[asset] = utxo
                    }
                }
                
       }})
        }   )
    
       setCollateralUtxo(localCollateralUtxo)
        
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
        {(Object.keys(tokens).length === 0 && !props.selected )? <div className='walletListNotFound'> No tokenized wallets found <br/>Please visit the <href onClick={() => props.root.setModule("minting")}>minting page</href> to get one </div>:
        (expanded || !props.selected) &&  <div className='tokenWalletListContainer'> <div className='tokenWalletList' > {Object.keys(tokens).map( (item, index) => (
                 <TokenThumbnail tokenId={item} f={selectWallet} key={item}/>
                 
        )) }
            { props.moduleRoot.state.wallet && <div className='Overlay' onClick={() => setExpanded(false)} /> }
        </div>
        </div>}
       </div>
        
        
        }
         
    </div>
    );
    
}
 
export default WalletList;