import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import ControlButton from './components/ControlButton';
import TemperatureFooter from './components/TemperatureFooter';
import { Modal, TimePicker, InputNumber, ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';

const App = () => {
  const [modes, setModes] = useState([]);
  const [activeMode, setActiveMode] = useState("OFF");
  const [onTimer, setOnTimer] = useState(false);
  const [offTimer, setOffTimer] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [isOnTimerModal, setIsOnTimerModal] = useState(null);
  const [timerEndTime, setTimerEndTime] = useState(null);
  const [fadeTime, setFadeTime] = useState(0);
  const [timerCallLoading, setTimerCallLoading] = useState(false);

  const updateActiveModes = useCallback(() => {
    fetch("http://192.168.1.69:8080/activeMode").then(response => {
      return response.json();
    }).then(data => {
      setActiveMode(data.mode);
      setOnTimer(data.onTimer);
      setOffTimer(data.offTimer);
    })
  }, []);

  useEffect(() => {
    fetch("http://192.168.1.69:8080/getModes").then(response => {
      return response.json();
    }).then(data => {
      setModes(data);
    });
    updateActiveModes();

    const modeRefresher = setInterval(
      () => updateActiveModes(),
      5000
    );

    return () => clearInterval(modeRefresher);
  }, [updateActiveModes]);

  const setLightMode = (mode) => {
    fetch("http://192.168.1.69:8080/activeMode/" + mode).then(response => {
      return response.json();
    }).then(data => {
      if (data.status === "OK") {
        setActiveMode(mode);
      }
    })
  };

  const resetTimerState = () => {
    setShowTimerModal(false);
    setTimerEndTime(null);
    setFadeTime(0);
    setTimerCallLoading(false);
  };

  const handleSetTimer = () => {
    setTimerCallLoading(true);

    const endTimeDayjs = timerEndTime;
    const currentTime = dayjs().subtract(1, 'minutes');

    if (endTimeDayjs.isBefore(currentTime, 'minute')) {
      endTimeDayjs.add(1, 'days');
    }

    let minutesUntilEnd = Math.max((endTimeDayjs.unix() - currentTime.unix()) / 60, 0);

    fetch("http://192.168.1.69:8080/timer/" + (isOnTimerModal ? "on" : "off") + "/" + Math.round(minutesUntilEnd) + "/" + fadeTime).then(response => {
      return response.json();
    }).then(data => {
      if (isOnTimerModal) {
        setOnTimer(true);
      } else {
        setOffTimer(true);
      }

      resetTimerState();
    });
  };

  const renderControls = () => {
    var buttons = [];
    Object.keys(modes).forEach((key) => {
      buttons.push(<ControlButton mode={key} onClick={() => setLightMode(key)} displayName={modes[key]} active={(key === activeMode)} key={key} />)
    })

    buttons.push(<ControlButton mode="scheduleOn" onClick={() => { setShowTimerModal(true); setIsOnTimerModal(true); }} displayName="Schedule On" active={onTimer} key="scheduleOn" />)
    buttons.push(<ControlButton mode="scheduleOff" onClick={() => { setShowTimerModal(true); setIsOnTimerModal(false); }} displayName="Schedule Off" active={offTimer} key="scheduleOff" />)
    return buttons;
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <div id="wrapper">
        {renderControls()}

        <Modal
          open={showTimerModal}
          title={"Set " + (isOnTimerModal ? "On" : "Off") + " Timer"}
          okText="Set Timer"
          onOk={handleSetTimer}
          onCancel={resetTimerState}
          confirmLoading={timerCallLoading}
        >
          Time: <TimePicker value={timerEndTime} onChange={(time) => setTimerEndTime(time)} format="h:mm a" />
          <br />
          <br />
          Fade period (minutes): <InputNumber min={0} max={30} defaultValue={0} onChange={(fadeMins) => setFadeTime(fadeMins)} />
        </Modal>

        <TemperatureFooter />
      </div>
    </ConfigProvider>
  )
}

export default App;
