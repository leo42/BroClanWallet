import React from 'react';
import MWalletThumb from "./MWalletThumb";
import AddWalletModal from './AddWalletModal';

function WWalletList (props) {
    const [addWalletOpen, setAddWalletOpen] = React.useState(false);

    return (
        <div className="MWalletList">
        {addWalletOpen && <AddWalletModal setOpenModal={setAddWalletOpen} root={props.root} />}

        {props.root.state.wallets.map( (item, index) => (

            <MWalletThumb wallet={item} key={index} index={index} root={props.root}></MWalletThumb>
        ))}

        <button className='addWalletButton' onClick={ () => setAddWalletOpen(true)}>+</button>

    </div>);
    
}
 
export default WWalletList;