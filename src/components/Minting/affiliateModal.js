
import React, { useEffect } from "react";
import "./affiliateModal.css";
import { useState} from 'react';    
import { Lucid } from "lucid-cardano";
import copyTextToClipboard from "../../helpers/copyTextToClipboard";
import { toast } from "react-toastify";

function AffiliateModal({ setOpenModal, operation }) {
    
    const disclaimerTexts = [ "I undestand that this are not investment products, and do not hold any promice of profit.",
    "I undestand that BroClan maintains the right to alter the price for minting and the amount payed to affiliates.",
    "BroClan cannot guaranty that they affiliate payment will happen, users can circomvent the system if they have the required knowlage",
    "By using this link I will promote BroClan truthfully and attemt to assist my audience get a good undestanding of the product"]
 

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
            console.log(lucid)
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


               Hello, on this menu you can generate an affiliate link.
            <br/>
                You will get a 5ADA reward for each that mints a  token, who found out about BroClan from your link.
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