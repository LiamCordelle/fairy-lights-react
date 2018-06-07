import React, { Component } from 'react';
import './ComponentCss/TemperatureFooter.css';

class TemperatureFooter extends Component {
  render() {
    return (
      <div class="TemperatureFooter">
        <div class="centering-table">
          <p class="centering-table-cell">The temperature is TEMPERATURE_PLACEHOLDER&deg;C</p>
        </div>
      </div>
    )
  }
}

export default TemperatureFooter;
