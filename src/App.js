import React, { Component } from 'react';
import './App.css';
import ControlButton from './components/ControlButton.js';
import TemperatureFooter from './components/TemperatureFooter.js';

class App extends Component {
  constructor(props) {
      super(props);

      this.state = {
          modes: [],
          activeMode: "OFF"
      }
  }

  componentWillMount() {
      fetch("/getModes").then(response => {
          return response.json();
      }).then(data => {
          this.setState({modes: data});
      });
  }

  setLightMode(mode) {
      fetch("/setMode/" + mode).then(response => {
          return response.json();
      }).then(data => {
          if (data.status === "OK") {
              this.setState({activeMode: mode})
          }
      })
  }

  renderControls() {
      var buttons = [];
      Object.keys(this.state.modes).forEach((key) => {
          buttons.push(<ControlButton mode={key} onClick={() => this.setLightMode(key)} displayName={this.state.modes[key]} active={(key === this.state.activeMode) ? true : false} />)
      })
      return buttons;
  }

  render() {
    return (
      <div id="wrapper">
        {this.renderControls()}

        <TemperatureFooter />
      </div>
    )
  }
}

export default App;
