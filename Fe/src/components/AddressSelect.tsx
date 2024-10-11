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

const AddressSelect: React.FC<AddressSelectProps> = ({ wallet, moduleRoot, selectedAddress, onAddressChange, showAll = true  , setName = false}) => {
  return (
    <div className="address-select-container">
        <div>
      <select
        className="addressSelect"
        value={selectedAddress}
        onChange={(event) => onAddressChange(event.target.value)}
      >
        {showAll && <option value="">All</option>}
        {wallet.getFundedAddress().map((item: string, index: number) => (
          <option key={index} value={item}>
            {wallet.getAddressName(item)}
          </option>
        ))}
      </select>
      {selectedAddress !== wallet.getDefaultAddress() && (
        <button className="defaultButton" onClick={() => moduleRoot.setDefaultAddress(selectedAddress)}>
          Make Default
        </button>
      )}
      </div>
      {setName &&  !["",wallet.getAddress()].includes(selectedAddress) && <input type="text" placeholder="Name" onChange={(event) => moduleRoot.changeAddressName(selectedAddress, event.target.value)} />}
    </div>
  );
};

export default AddressSelect;