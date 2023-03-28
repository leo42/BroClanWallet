import React from "react";

function NativeToken (props) {
    const [metadata, setMetadata] = React.useState({});

    async function getMetadata(){
       await fetch()
    }   

    getMetadata()
    return (
        <div className="MWalletList">
        {addWalletOpen && <AddWalletModal setOpenModal={setAddWalletOpen} root={props.root} />}

        {props.root.state.wallets.map( (item, index) => (

            <MWalletThumb wallet={item} key={index} index={index} root={props.root}></MWalletThumb>
        ))}

        <button className='addWalletButton' onClick={ () => setAddWalletOpen(true)}>+</button>

    </div>);
    
}
 
export default NativeToken;