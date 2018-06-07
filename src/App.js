import React, { Component } from 'react';
import './App.css';
import ControlButton from './components/ControlButton.js';
import TemperatureFooter from './components/TemperatureFooter.js';

class App extends Component {
  render() {
    return (
      <div id="wrapper">
        <ControlButton /> <ControlButton />
        <ControlButton /> <ControlButton />

        <TemperatureFooter />
      </div>
    )
  }
}

export default App;
