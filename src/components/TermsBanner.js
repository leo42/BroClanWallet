import React, { useState } from 'react';
import './TermsBanner.css';
function TermsAndConditionsBanner(props) {

  function handleAcceptClick() {
    props.root.setState({
      settings: {
        ...props.root.state.settings,
        termsAccepted: "acceptedV1"
      }
    });
  }

  if (props.root.state.settings.termsAccepted === "acceptedV1" ) {
    return null;
  }

  return (
    <div className="terms-and-conditions-banner">
      <p>By using this software, you agree to be bound by our <a href="https://github.com/leo42/BroClanWallet/blob/main/LICENSE" target='blank'>open source license</a>.</p>
      <button className='commonBtn' onClick={handleAcceptClick}>I Agree</button>
    </div>
  );
}

export default TermsAndConditionsBanner;