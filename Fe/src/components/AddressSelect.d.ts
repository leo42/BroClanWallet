import React from 'react';
import './AddressSelect.css';
interface AddressSelectProps {
    wallet: any;
    moduleRoot: any;
    selectedAddress: string;
    onAddressChange: (address: string) => void;
    showAll?: boolean;
    setName?: boolean;
}
declare const AddressSelect: React.FC<AddressSelectProps>;
export default AddressSelect;
