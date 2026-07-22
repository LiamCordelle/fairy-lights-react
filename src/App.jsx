import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ConfigProvider, InputNumber, Modal, TimePicker, theme } from 'antd';
import dayjs from 'dayjs';

import './App.css';
import {
  ApiError,
  cancelTimer,
  getActiveStatus,
  getModes,
  setMode,
  setTimer,
} from './api';
import ControlButton from './components/ControlButton';
import TemperatureFooter from './components/TemperatureFooter';
import { calculateMinutesUntil } from './timerUtils';


const DEFAULT_MODES = {
  OFF: 'Lights Off',
  ON: 'Lights On',
  FADE_FAST: 'Fade Fast',
  FADE_SLOW: 'Fade Slow',
};

const App = () => {
  const [modes, setModes] = useState(DEFAULT_MODES);
  const [activeMode, setActiveMode] = useState('OFF');
  const [onTimer, setOnTimer] = useState(false);
  const [offTimer, setOffTimer] = useState(false);
  const [timer, setTimerStatus] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [isOnTimerModal, setIsOnTimerModal] = useState(null);
  const [timerEndTime, setTimerEndTime] = useState(null);
  const [fadeTime, setFadeTime] = useState(0);
  const [timerCallLoading, setTimerCallLoading] = useState(false);
  const [actionInFlight, setActionInFlight] = useState(null);
  const [connection, setConnection] = useState({
    connected: false,
    lastSeen: null,
    error: null,
  });
  const [modalError, setModalError] = useState(null);
  const statusRequestInFlight = useRef(false);
  const mounted = useRef(true);

  const markConnected = useCallback(() => {
    setConnection({ connected: true, lastSeen: new Date(), error: null });
  }, []);

  const reportError = useCallback((error) => {
    const message = error?.message || 'Something went wrong.';
    setConnection((current) => ({
      connected: error instanceof ApiError && error.status ? current.connected : false,
      lastSeen: current.lastSeen,
      error: message,
    }));
  }, []);

  const applyStatus = useCallback((data) => {
    setActiveMode(data.mode);
    setOnTimer(data.onTimer);
    setOffTimer(data.offTimer);
    setTimerStatus(data.timer);
    setTransitioning(Boolean(data.transitioning));
  }, []);

  const updateActiveModes = useCallback(async () => {
    if (statusRequestInFlight.current) {
      return;
    }

    statusRequestInFlight.current = true;
    try {
      const data = await getActiveStatus();
      if (mounted.current) {
        applyStatus(data);
        if (data.error) {
          setConnection({ connected: true, lastSeen: new Date(), error: data.error });
        } else {
          markConnected();
        }
      }
    } catch (error) {
      if (mounted.current) {
        reportError(error);
      }
    } finally {
      statusRequestInFlight.current = false;
    }
  }, [applyStatus, markConnected, reportError]);

  useEffect(() => {
    mounted.current = true;

    const loadModes = async () => {
      try {
        const data = await getModes();
        if (mounted.current) {
          setModes(data);
          markConnected();
        }
      } catch (error) {
        if (mounted.current) {
          reportError(error);
        }
      }
    };

    loadModes();
    updateActiveModes();
    const modeRefresher = setInterval(updateActiveModes, 5000);

    return () => {
      mounted.current = false;
      clearInterval(modeRefresher);
    };
  }, [markConnected, reportError, updateActiveModes]);

  const setLightMode = async (mode) => {
    setActionInFlight(mode);
    try {
      await setMode(mode);
      await updateActiveModes();
    } catch (error) {
      reportError(error);
    } finally {
      setActionInFlight(null);
    }
  };

  const resetTimerState = () => {
    setShowTimerModal(false);
    setTimerEndTime(null);
    setFadeTime(0);
    setTimerCallLoading(false);
    setModalError(null);
  };

  const openTimerModal = (isOnTimer) => {
    setIsOnTimerModal(isOnTimer);
    setTimerEndTime(null);
    setFadeTime(0);
    setModalError(null);
    setShowTimerModal(true);
  };

  const handleSetTimer = async () => {
    setTimerCallLoading(true);
    setModalError(null);

    try {
      const minutesUntilEnd = calculateMinutesUntil(timerEndTime);
      const target = isOnTimerModal ? 'on' : 'off';
      const data = await setTimer(target, minutesUntilEnd, fadeTime);
      setTimerStatus(data.timer);
      setOnTimer(target === 'on');
      setOffTimer(target === 'off');
      resetTimerState();
      await updateActiveModes();
    } catch (error) {
      setModalError(error?.message || 'Could not set the timer.');
      reportError(error);
      setTimerCallLoading(false);
    }
  };

  const handleCancelTimer = async () => {
    setActionInFlight('cancelTimer');
    try {
      await cancelTimer();
      await updateActiveModes();
    } catch (error) {
      reportError(error);
    } finally {
      setActionInFlight(null);
    }
  };

  const timerSummary = timer
    ? `${timer.target === 'ON' ? 'Lights on' : 'Lights off'} at ${dayjs(timer.dueAt).format('ddd h:mm a')}`
    : null;
  const connectionClass = !connection.connected
    ? 'disconnected'
    : connection.error
      ? 'warning'
      : 'connected';
  const connectionMessage = connection.connected
    ? connection.error || `Controller connected${transitioning ? ' — changing lights…' : ''}`
    : connection.error || 'Connecting to controller…';

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <main id="wrapper">
        <div
          className={`connection-status ${connectionClass}`}
          role="status"
        >
          {connectionMessage}
          {!connection.connected && connection.lastSeen && (
            <span> Last seen {dayjs(connection.lastSeen).format('h:mm:ss a')}.</span>
          )}
        </div>

        <section className="controls" aria-label="Fairy light controls">
          {Object.entries(modes).map(([key, displayName]) => (
            <ControlButton
              mode={key}
              onClick={() => setLightMode(key)}
              displayName={displayName}
              active={key === activeMode}
              disabled={Boolean(actionInFlight)}
              key={key}
            />
          ))}

          <ControlButton
            mode="scheduleOn"
            onClick={() => openTimerModal(true)}
            displayName="Schedule On"
            active={onTimer}
            disabled={Boolean(actionInFlight)}
          />
          <ControlButton
            mode="scheduleOff"
            onClick={() => openTimerModal(false)}
            displayName="Schedule Off"
            active={offTimer}
            disabled={Boolean(actionInFlight)}
          />
        </section>

        {timerSummary && (
          <section className="timer-summary" aria-live="polite">
            <span>{timerSummary}</span>
            <button
              type="button"
              onClick={handleCancelTimer}
              disabled={Boolean(actionInFlight)}
            >
              {actionInFlight === 'cancelTimer' ? 'Cancelling…' : 'Cancel timer'}
            </button>
          </section>
        )}

        <Modal
          open={showTimerModal}
          title={`Set ${isOnTimerModal ? 'On' : 'Off'} Timer`}
          okText="Set Timer"
          onOk={handleSetTimer}
          onCancel={resetTimerState}
          confirmLoading={timerCallLoading}
          okButtonProps={{ disabled: !timerEndTime }}
        >
          <div className="timer-field">
            <label htmlFor="timer-time">Time</label>
            <TimePicker
              id="timer-time"
              value={timerEndTime}
              onChange={setTimerEndTime}
              format="h:mm a"
              minuteStep={1}
            />
          </div>
          <div className="timer-field">
            <label htmlFor="fade-time">Fade period (minutes)</label>
            <InputNumber
              id="fade-time"
              min={0}
              max={30}
              value={fadeTime}
              onChange={(fadeMinutes) => setFadeTime(fadeMinutes ?? 0)}
            />
          </div>
          {modalError && <p className="modal-error" role="alert">{modalError}</p>}
        </Modal>

        <TemperatureFooter />
      </main>
    </ConfigProvider>
  );
};

export default App;
