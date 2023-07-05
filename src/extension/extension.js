import React from 'react';
import ReactDOM from 'react-dom';

// Background script or content script

// Function to get information about the current active tab
function getCurrentTabInfo(callback) {
    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // tabs is an array of Tab objects, but we only need the first tab
      var currentTab = tabs[0];
      
      // Extract the desired information from the Tab object
      var tabInfo = {
        url: currentTab.url,
        title: currentTab.title,
        // Add any other information you want to retrieve
      };
      
      // Invoke the callback function with the tab information
      callback(tabInfo);
    });
  }
  
  // Usage example
  getCurrentTabInfo(function (tabInfo) {
    console.log(tabInfo.url);
    console.log(tabInfo.title);
  });

class App extends React.Component {
    state = {
        url: '',
        title: '',
    };

    componentDidMount() {
        // Get information about the current active tab
        getCurrentTabInfo((tabInfo) => {
            this.setState({
                url: tabInfo.url,
                title: tabInfo.title,
            });
        });
    }

    render() {
        return (<h1>You are viewing: {this.state.title}</h1>);
    }

}

    ReactDOM.render(<App />, document.getElementById('root'));