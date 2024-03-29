import React, { Component } from 'react';
import './ComponentCss/TemperatureFooter.css';

class TemperatureFooter extends Component {
  constructor(props) {
    super(props);
    this.state = { temperature: '...' };
  }

  getLatestTemperature() {
    fetch('http://192.168.0.69:8080/getTemperature').then(response => {
      console.log(response);
      return response.json();
    }).then(data => {
      console.log(data);
      this.setState({ temperature: data.temperature });
    })
  }

  componentDidMount() {
    this.getLatestTemperature();

    this.temperatureRefresher = setInterval(
      () => this.getLatestTemperature(),
      30000
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
