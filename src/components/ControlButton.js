import React, { Component } from 'react';
import './ComponentCss/ControlButton.css';

class ControlButton extends Component {
  render() {
    var outerBoxClassName = "SquareBox";

    if (this.props.active) {
        outerBoxClassName += " Active";
    }

    return (
      <div className={outerBoxClassName}>
        <div className='ControlButtonContainer'>
          <div className='centering-table'>
            <a className="centering-table-cell control_button" onClick={this.props.onClick} href={"#" + this.props.mode}>
              <div className="control_button_content">{this.props.displayName}</div>
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default ControlButton;
