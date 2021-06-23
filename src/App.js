import React, { Component } from 'react';
import './App.css';
import ControlButton from './components/ControlButton.js';
import TemperatureFooter from './components/TemperatureFooter.js';
import { Modal } from 'antd';

class App extends Component {
  constructor(props) {
      super(props);

      this.state = {
          modes: [],
          activeMode: "OFF",
          onTimer: false,
          offTimer: false,
          showTimerModal: false,
          isOnTimerModal: null
      }
  }

  componentWillMount() {
      fetch("http://192.168.1.13:8081/getModes").then(response => {
          return response.json();
      }).then(data => {
          this.setState({modes: data});
      });
      fetch("http://192.168.1.13:8081/activeMode").then(response => {
        return response.json();
      }).then(data => {
        this.setState({activeMode: data.mode, onTimer: data.onTimer, offTimer: data.offTimer})
      })
  }

  setLightMode(mode) {
      fetch("http://192.168.1.13:8081/activeMode/" + mode).then(response => {
          return response.json();
      }).then(data => {
          if (data.status === "OK") {
              this.setState({activeMode: mode})
          }
      })
  }

  setTimer() {

  }

  renderControls() {
      var buttons = [];
      Object.keys(this.state.modes).forEach((key) => {
          buttons.push(<ControlButton mode={key} onClick={() => this.setLightMode(key)} displayName={this.state.modes[key]} active={(key === this.state.activeMode)} />)
      })

      buttons.push(<ControlButton mode="scheduleOn" onClick={() => this.setState({showTimerModal: true, isOnTimerModal: true})} displayName="Schedule On" active={this.onTimer} />)
      buttons.push(<ControlButton mode="scheduleOff" onClick={() => this.setState({showTimerModal: true, isOnTimerModal: false})} displayName="Schedule Off" active={this.offTimer} />)
      return buttons;
  }

  render() {
    return (
      <div id="wrapper">
        {this.renderControls()}

        <Modal
          visible={this.state.showTimerModal}
          title={"Set " + (this.state.isOnTimerModal ? "On" : "Off") + " Timer"}
          okText="Set Timer"
          onOk={this.setTimer}
          onCancel={this.setState({showTimerModal: false})}
        >

        </Modal>

        <TemperatureFooter />
      </div>
    )
  }
}

export default App;
