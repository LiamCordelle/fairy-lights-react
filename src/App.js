import React, { Component } from 'react';
import './App.css';
import ControlButton from './components/ControlButton.js';
import TemperatureFooter from './components/TemperatureFooter.js';
import { Modal, TimePicker, InputNumber } from 'antd';
import 'antd/dist/antd.css'
import moment from 'moment';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modes: [],
      activeMode: "OFF",
      onTimer: false,
      offTimer: false,
      showTimerModal: false,
      isOnTimerModal: null,
      timerEndTime: null,
      fadeTime: 0,
      timerCallLoading: false
    }

    this.resetTimerState = this.resetTimerState.bind(this);
    this.setTimer = this.setTimer.bind(this);
  }

  updateActiveModes() {
    fetch("http://192.168.1.207:8080/activeMode").then(response => {
      return response.json();
    }).then(data => {
      this.setState({ activeMode: data.mode, onTimer: data.onTimer, offTimer: data.offTimer })
    })
  }

  UNSAFE_componentWillMount() {
    fetch("http://192.168.1.207:8080/getModes").then(response => {
      return response.json();
    }).then(data => {
      this.setState({ modes: data });
    });
    this.updateActiveModes();
  }

  componentDidMount() {
    this.modeRefresher = setInterval(
      () => this.updateActiveModes(),
      5000
    );
  }

  componentWillUnmount() {
    clearInterval(this.modeRefresher);
  }

  setLightMode(mode) {
    fetch("http://192.168.1.207:8080/activeMode/" + mode).then(response => {
      return response.json();
    }).then(data => {
      if (data.status === "OK") {
        this.setState({ activeMode: mode })
      }
    })
  }

  setTimer() {
    this.setState({ timerCallLoading: true });

    let endTimeMoment = this.state.timerEndTime;

    if (endTimeMoment.isBefore(moment())) {
      endTimeMoment.add(1, 'days');
    }

    let minutesUntilEnd = (endTimeMoment.unix() - moment().unix()) / 60;


    fetch("http://192.168.1.207:8080/timer/" + (this.state.isOnTimerModal ? "on" : "off") + "/" + Math.round(minutesUntilEnd) + "/" + this.state.fadeTime).then(response => {
      return response.json();
    }).then(data => {
      if (this.state.isOnTimerModal) {
        this.setState({ onTimer: true })
      } else {
        this.setState({ offTimer: true })
      }

      this.resetTimerState();
    });
  }

  resetTimerState() {
    this.setState({
      showTimerModal: false,
      timerEndTime: null,
      fadeTime: 0,
      timerCallLoading: false
    });
  }

  renderControls() {
    var buttons = [];
    Object.keys(this.state.modes).forEach((key) => {
      buttons.push(<ControlButton mode={key} onClick={() => this.setLightMode(key)} displayName={this.state.modes[key]} active={(key === this.state.activeMode)} />)
    })

    buttons.push(<ControlButton mode="scheduleOn" onClick={() => this.setState({ showTimerModal: true, isOnTimerModal: true })} displayName="Schedule On" active={this.state.onTimer} />)
    buttons.push(<ControlButton mode="scheduleOff" onClick={() => this.setState({ showTimerModal: true, isOnTimerModal: false })} displayName="Schedule Off" active={this.state.offTimer} />)
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
          onCancel={this.resetTimerState}
          confirmLoading={this.state.timerCallLoading}
        >
          Time: <TimePicker value={this.state.timerEndTime} onChange={(time) => this.setState({ timerEndTime: time })} format="h:mm a" />
          <br />
          <br />
          Fade period (minutes): <InputNumber min={0} max={30} defaultValue={0} onChange={(fadeMins) => this.setState({ fadeTime: fadeMins })} />
        </Modal>

        <TemperatureFooter />
      </div>
    )
  }
}

export default App;
