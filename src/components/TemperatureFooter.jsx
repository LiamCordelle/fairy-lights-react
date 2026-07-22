import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getTemperature } from '../api';
import './ComponentCss/TemperatureFooter.css';


const TemperatureFooter = () => {
  const [temperature, setTemperature] = useState(null);
  const [status, setStatus] = useState('loading');
  const requestInFlight = useRef(false);
  const mounted = useRef(true);

  const getLatestTemperature = useCallback(async () => {
    if (requestInFlight.current) {
      return;
    }

    requestInFlight.current = true;
    try {
      const data = await getTemperature();
      if (!mounted.current) {
        return;
      }
      setTemperature(data.available ? data.temperature : null);
      setStatus(data.available ? 'available' : 'unavailable');
    } catch {
      if (mounted.current) {
        setStatus('unavailable');
      }
    } finally {
      requestInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    getLatestTemperature();
    const temperatureRefresher = setInterval(getLatestTemperature, 30000);

    return () => {
      mounted.current = false;
      clearInterval(temperatureRefresher);
    };
  }, [getLatestTemperature]);

  let message = 'Checking temperature…';
  if (status === 'available') {
    message = `The temperature is ${temperature}°C`;
  } else if (status === 'unavailable') {
    message = 'Temperature unavailable';
  }

  return (
    <footer className="TemperatureFooter" aria-live="polite">
      <p>{message}</p>
    </footer>
  );
};

export default TemperatureFooter;
