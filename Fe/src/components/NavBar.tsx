import React from "react";
import "./NavBar.css"
import { ReactComponent as SettingsIcon } from '../html/assets/menu.svg';
import { ReactComponent as SunIcon } from '../html/assets/sun.svg';
import { ReactComponent as MoonIcon } from '../html/assets/moon.svg';
import { useState , useEffect} from "react";
import { App } from "../index";


function NavBar(props: {root: App}){
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
        <div className="modeToggle" onClick={() => props.root.toggleMode()}> 
            {props.root.state.mode === "lightMode" ? <MoonIcon className="modeIcon nightIcon" /> : <SunIcon className="modeIcon dayIcon" /> }
        </div>

            <img src={props.root.state.mode === "lightMode" ? "./assets/fullLogoDark.png"  : "./assets/fullLogo.png"} alt="Logo" className='MainAppLogo' />
        <div onMouseEnter={() => setHovering("settings")} onMouseLeave={() => setHovering("")} onClick={() => setNavOpen(true)} className={ "settingsButton menuIcon " + (navOpen ? "menuIconOpen" : "" )}>
            <SettingsIcon  />

            {  (hovering === "settings" || isMobile) &&  <label className='iconLabel'></label> }
            </div>
            {navOpen && 
            <div className="navMenuBackground" onClick={() => setNavOpen(false)}>
            <div className="navMenu"> 
                <div className="navMenuCarveLeft" ></div>

                <div className="navMenuPop" ></div>
                <div className="navMenuOption" onClick={() =>  props.root.setModule("multisig")}>Multisig</div>
                <div className="navMenuOption" onClick={() =>  props.root.setModule("smartWallets")}>Smart Wallets</div>
                <div className="navMenuOption" onClick={() => props.root.showModal("settings")}>Settings</div>
            </div>
            </div>
            }
             <div className="navMenuBar" ></div>
        </div>
    )
                
}

export default NavBar
    