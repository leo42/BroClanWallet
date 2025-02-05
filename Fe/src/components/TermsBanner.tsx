import {App} from '../index';
import './TermsBanner.css';

function TermsAndConditionsBanner(props: {root: App}) {
  const version = "acceptedV1"
  function handleAcceptClick() {
    props.root.acceptTerms(version)
  }


  if (props.root.state.settings.termsAccepted === version ) {
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