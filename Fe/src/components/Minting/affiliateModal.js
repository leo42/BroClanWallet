
import React, { useEffect } from "react";
import "./affiliateModal.css";
import { useState} from 'react';    
import { Lucid } from "lucid-cardano";
import copyTextToClipboard from "../../helpers/copyTextToClipboard";
import { toast } from "react-toastify";

function AffiliateModal({ setOpenModal, operation }) {
    
  const disclaimerTexts = [
    "I understand that these materials are provided for informational purposes only and do not constitute legal, financial, or professional advice. Users should seek independent professional advice as needed.",
    "I understand that these are not investment products and do not hold any promise of profit. Users should carefully assess the risks associated with any actions they take and consult with a financial advisor if necessary.",
    "I understand that BroClan maintains the right to alter the price for minting and the amount paid to affiliates. Users participating in affiliate programs should disclose their relationship with BroClan and be aware that they may earn commissions for referrals.",
    "BroClan cannot guarantee that the affiliate payment will happen; users can circumvent the system if they have the required knowledge. Users should act in accordance with ethical standards and guidelines when promoting BroClan.",
    "By using this link, I will promote BroClan truthfully and attempt to assist my audience in getting a good understanding of the product. I agree to abide by the Terms and Conditions and Privacy Policy of BroClan's website, and I understand that these terms may change over time."
  ];
  
    const [disclaimer, setDisclaimer] = useState(disclaimerTexts.map(() => false))
    const [affiliateAddress, setAffiliateAddress] = useState("")
    const [lucid, setLucid] = useState(undefined)
    const toggleDisclamer = (index) => {
        const newDisclaimer = [...disclaimer]
        newDisclaimer[index] = !newDisclaimer[index]
        setDisclaimer(newDisclaimer)

    }

    useEffect(() => {
        Lucid.new(
            null,
            null,
          ).then((lucidCompleted) => {
            setLucid(lucidCompleted)
          });
    }, [])    

    function isAddressValid(address) {
        try{
        return lucid.utils.getAddressDetails(address)
        }catch(e){
            console.log(e)
            return false
        }
    }

    const acceptedTerms = () => {
        return disclaimer.every((item) => item === true)
    }

    const copyLink = () => {
        copyTextToClipboard(`${window.location.href}?affiliate=${affiliateAddress}`)
        toast.success("Copied to clipboard")
    }
        return (
        <div className="modalBackground" onClick={() => { setOpenModal(false); }}>
          <div className="modalContainer"  onClick={ (e) => e.stopPropagation()}   >
            <div className="titleCloseBtn">
              <button
                onClick={() => {
                  setOpenModal(false);
                }}
              >
                X
              </button>
                </div>
              <br/>


              Hello, on this menu, you can generate an affiliate link.
<br/>
You will receive a 5 ADA reward for each person who mints a token after discovering BroClan through your link
             <br/>

                <div className="affiliateDisclaimers">
                    {disclaimerTexts.map((item, index) =>                        
                                        <div className="affiliateDisclaimer" key={item+index}>  <input  type="checkbox" id="disclaimer" name="disclaimer" value={disclaimer[index]} onClick={() => toggleDisclamer(index)  } /> {item} </div> 
                    )        }
                
                </div>
                <br/>
                {acceptedTerms()  &&

                <div className="affiliateLinkMenu">
                    Glad to have you onboard! 
                    <br/>
                    Your address: 
                    <input type="text"   value={affiliateAddress}  onChange={(event) => setAffiliateAddress(event.target.value)}/>
                    <br/>
                    {isAddressValid(affiliateAddress) && 
                    <div className="affiliateLinkReadyWrapper2">  
                        <br/>

                        Your affiliate link is:
                        <div className="affiliateLinkReadyWrapper"> 
                            
                            <span className="affiliateLinkReady">
                            {window.location.href}?affiliate={affiliateAddress}
                            
                        </span>
                        <svg className="copyIcon" onClick={copyLink}  id="meteor-icon-kit__solid-copy-s" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7 5H14C15.1046 5 16 5.89543 16 7V14C16 15.1046 15.1046 16 14 16H7C5.89543 16 5 15.1046 5 14V7C5 5.89543 5.89543 5 7 5zM3 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0H9C10.1046 0 11 0.89543 11 2V3H7C4.79086 3 3 4.79086 3 7V11z" fill="#758CA3"/></svg>
                        </div>
                        </div> 
                    }
                </div>
             }

            </div>
            </div>

)

}

export default AffiliateModal;