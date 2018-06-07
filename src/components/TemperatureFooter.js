import React, { Component } from 'react';
import './ComponentCss/TemperatureFooter.css';

class TemperatureFooter extends Component {
  constructor(props) {
        super(props);
        this.state = {temperature: this.getLatestTemperature()};
  }

  getLatestTemperature() {
    fetch('/getTemperature').then(response => {
      return response.json();
    }).then(data => {
      this.setState({temperature: data});
    })
  }

  componentDidMount() {
    this.temperatureRefresher = setInterval(
      () => this.getLatestTemperature(),
      5000
    );
  }

  componentWillUnmount() {
      clearInterval(this.temperatureRefresher);
  }

  render() {
    return (
      <div className="TemperatureFooter">
        <div className="centering-table">
          <p className="centering-table-cell">The temperature is {this.state.temperature}&deg;C</p>
        </div>
      </div>
    )
  }
}

export default TemperatureFooter;
