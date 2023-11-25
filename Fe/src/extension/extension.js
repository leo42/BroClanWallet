import React from 'react';
import ReactDOM from 'react-dom';


  



class App extends React.Component {
    state = {
        walletName: '',
        ballance: '',
        signers: []
    };

    componentDidMount() {
        // Get information about the current active tab
        this.getInfo()
    }

    getInfo(){
        console.log("getInfo");
        chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
            // Received the data from the background
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
              } else {
      
                this.setState(response);
              }            
            return true; // Indicate that we will send a response asynchronously
          });
   }

    render() {
        return (
        <div className="extensionWindow">
          <h1>BroClan dApp Connector  </h1>
          <h2>{this.state.walletName}Leo</h2>
          <h2>{this.state.ballance}Hey</h2>
          <h2>{this.state.signers}</h2>
          </div>
        );
    }

}

    ReactDOM.render(<App />, document.getElementById('root'));