import React from "react";
import "./NavBar.css"
import { ReactComponent as SettingsIcon } from '../html/assets/settings.svg';
import { useState , useEffect} from "react";
function NavBar(props){
    const [hovering, setHovering] = React.useState("");
    const [isMobile, setIsMobile] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    useEffect(() => {
        const updateWindowDimensions = () => {
          const newIsMobile = window.innerWidth <= 768;
          if (isMobile !== newIsMobile) {
            setIsMobile(newIsMobile);
          }
        };
        window.addEventListener("resize", updateWindowDimensions);
        updateWindowDimensions();
        return () => window.removeEventListener("resize", updateWindowDimensions);
      }, [isMobile]);
  
    return (
        <div className="NavBarWrapper"   >
            <img src={"./assets/logoFull.png"} alt="Logo" className='MainAppLogo' />
        
        <div onMouseEnter={() => setHovering("settings")} onMouseLeave={() => setHovering("")} onClick={() => setNavOpen(true)} className='iconWraper settingsButton'>
            <SettingsIcon className="icon" alt="settingsIcon" />
            {  (hovering === "settings" || isMobile) &&  <label className='iconLabel'>Settings</label> }
            </div>
            {navOpen && 
            <div className="navMenuBackground" onClick={() => setNavOpen(false)}>
            <div className="navMenu"> 
                <div className="navMenuOption" onClick={() =>  props.root.setModule("multisig")}>Multisig</div>
                <div className="navMenuOption" onClick={() =>  props.root.setModule("tokenVault")}>TokenVaults</div>
                <div className="navMenuOption" onClick={() => props.root.showModal("settings")}>Settings</div>
            </div>
            </div>
            }
            
        </div>
    )
                
}

export default NavBar
    