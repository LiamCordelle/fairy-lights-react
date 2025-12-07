import React, { useState, useEffect } from 'react';
import './ComponentCss/TemperatureFooter.css';

const TemperatureFooter = () => {
  const [temperature, setTemperature] = useState('...');

  const getLatestTemperature = () => {
    fetch('http://192.168.1.69:8080/getTemperature').then(response => {
      console.log(response);
      return response.json();
    }).then(data => {
      console.log(data);
      setTemperature(data.temperature);
    })
  };

  useEffect(() => {
    getLatestTemperature();

    const temperatureRefresher = setInterval(
      () => getLatestTemperature(),
      30000
    );

    return () => clearInterval(temperatureRefresher);
  }, []);

  return (
    <div className="TemperatureFooter">
      <div className="centering-table">
        <p className="centering-table-cell">The temperature is {temperature}&deg;C</p>
      </div>
    </div>
  )
}

export default TemperatureFooter;
