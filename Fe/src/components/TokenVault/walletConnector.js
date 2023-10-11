import React, { useState, useEffect }   from "react";
import "./walletConnector.css";
import WalletPicker from "../WalletPicker";
import { ReactComponent as ConnectIcon } from '../../html/assets/connect.svg';
import { ReactComponent as DisconnectIcon } from '../../html/assets/disconnect.svg';
import { ReactComponent as ChangeIcon } from '../../html/assets/change.svg';



function walletConnector(props){
    const [configMenu, openConfigMenu] = React.useState(false);
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


    function connectWallet(walletName){
        props.moduleRoot.connectWallet(walletName)
    }


    const connectorSettings = () =>
    <div>
        <div className="connectorSettings">

        {/* { <button onClick={() => props.root.disconnectWallet()}> disconnect</button> } */
        <div onMouseEnter={() => setHovering("disconnect")} onMouseLeave={() => setHovering("") } onClick={() => props.moduleRoot.disconnectWallet()} className='iconWraper disconnectButton'>
        <DisconnectIcon className="icon" alt="disconnectIcon" />
        { ( hovering === "disconnect"|| isMobile)   &&  <label className='iconLabel'>Disconnect</label> }
        < br/>   
        </div>}
        <div onMouseEnter={() => setHovering("change")} onMouseLeave={() => setHovering("") } onClick={() => props.root.openWalletPicker(connectWallet)} className='iconWraper changeButton'>
        <ChangeIcon className="icon" alt="changeIcon" />
        {  (hovering === "change"  || isMobile) &&  <label className='iconLabel'>Change</label> }

        < br/>   
        </div>

     <div className="connectorSettingsOverlay" onClick={() => openConfigMenu(!configMenu)} />

        </div>
        </div>  


        

    if(props.moduleRoot.state.connectedWallet === "none") {
        return (
          
        <div className="tokenWalletConnectorWrapperInitial">
        <div className="tokenWalletConnector">

            <div  onMouseEnter={() => setHovering("connect")} onMouseLeave={() => setHovering("") } onClick={() => props.root.openWalletPicker(connectWallet)}  className='iconWraper connectButton'>
             <ConnectIcon className="icon"  alt="connectIcon" />
             { ( hovering === "connect"  || isMobile) &&   <label className='iconLabel'>Connect</label> }
            < br/>   
          </div>

            </div>
            </div>)
    }else{   

        return (
          <div className="tokenWalletConnectorWrapper">
             <div className="tokenWalletConnector">
            { props.moduleRoot.state.connectedWallet && ((props.moduleRoot.state.connectedWallet.name==="nami") ? <img onClick={() => openConfigMenu(!configMenu)} className="connectedWalletImg" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0ODYuMTcgNDk5Ljg2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzM0OWVhMzt9PC9zdHlsZT48L2RlZnM+PGcgaWQ9IkxheWVyXzIiIGRhdGEtbmFtZT0iTGF5ZXIgMiI+PGcgaWQ9IkxheWVyXzEtMiIgZGF0YS1uYW1lPSJMYXllciAxIj48cGF0aCBpZD0icGF0aDE2IiBjbGFzcz0iY2xzLTEiIGQ9Ik03My44Nyw1Mi4xNSw2Mi4xMSw0MC4wN0EyMy45MywyMy45MywwLDAsMSw0MS45LDYxLjg3TDU0LDczLjA5LDQ4Ni4xNyw0NzZaTTEwMi40LDE2OC45M1Y0MDkuNDdhMjMuNzYsMjMuNzYsMCwwLDEsMzIuMTMtMi4xNFYyNDUuOTRMMzk1LDQ5OS44Nmg0NC44N1ptMzAzLjM2LTU1LjU4YTIzLjg0LDIzLjg0LDAsMCwxLTE2LjY0LTYuNjh2MTYyLjhMMTMzLjQ2LDE1LjU3SDg0TDQyMS4yOCwzNDUuNzlWMTA3LjZBMjMuNzIsMjMuNzIsMCwwLDEsNDA1Ljc2LDExMy4zNVoiLz48cGF0aCBpZD0icGF0aDE4IiBjbGFzcz0iY2xzLTEiIGQ9Ik0zOC4yNywwQTM4LjI1LDM4LjI1LDAsMSwwLDc2LjQ5LDM4LjI3djBBMzguMjgsMzguMjgsMCwwLDAsMzguMjcsMFpNNDEuOSw2MS44YTIyLDIyLDAsMCwxLTMuNjMuMjhBMjMuOTQsMjMuOTQsMCwxLDEsNjIuMTgsMzguMTNWNDBBMjMuOTQsMjMuOTQsMCwwLDEsNDEuOSw2MS44WiIvPjxwYXRoIGlkPSJwYXRoMjAiIGNsYXNzPSJjbHMtMSIgZD0iTTQwNS43Niw1MS4yYTM4LjI0LDM4LjI0LDAsMCwwLDAsNzYuNDYsMzcuNTcsMzcuNTcsMCwwLDAsMTUuNTItMy4zQTM4LjIyLDM4LjIyLDAsMCwwLDQwNS43Niw1MS4yWm0xNS41Miw1Ni40YTIzLjkxLDIzLjkxLDAsMSwxLDguMzktMTguMThBMjMuOTEsMjMuOTEsMCwwLDEsNDIxLjI4LDEwNy42WiIvPjxwYXRoIGlkPSJwYXRoMjIiIGNsYXNzPSJjbHMtMSIgZD0iTTEzNC41OCwzOTAuODFBMzguMjUsMzguMjUsMCwxLDAsMTU3LjkyLDQyNmEzOC4yNCwzOC4yNCwwLDAsMC0yMy4zNC0zNS4yMlptLTE1LDU5LjEzQTIzLjkxLDIzLjkxLDAsMSwxLDE0My41NCw0MjZhMjMuOSwyMy45LDAsMCwxLTIzLjk0LDIzLjkxWiIvPjwvZz48L2c+PC9zdmc+" /> 
             : <img onClick={() => openConfigMenu(!configMenu)} className="connectedWalletImg" src={window.cardano[props.moduleRoot.state.connectedWallet.name].icon.replace(/\s/g, ';')} />)}   
            
            {configMenu ? connectorSettings() : ""}

            </div>
        </div>)
    }

}

export default walletConnector