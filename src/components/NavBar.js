import React from "react";
import "./NavBar.css"
import { ReactComponent as SettingsIcon } from '../html/assets/settings.svg';
import { useState , useEffect} from "react";
function NavBar(props){
    const [hovering, setHovering] = React.useState("");
    const [isMobile, setIsMobile] = useState(false);

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

        <div onMouseEnter={() => setHovering("settings")} onMouseLeave={() => setHovering("")} onClick={() => props.root.showModal("settings")} className='iconWraper settingsButton'>
            <SettingsIcon className="icon" alt="settingsIcon" />
            {  (hovering === "settings" || isMobile) &&  <label className='iconLabel'>Settings</label> }
            < br/>  </div>
        </div>
    )
                
}

export default NavBar
    