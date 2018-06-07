import React, { Component } from 'react';
import './ComponentCss/ControlButton.css';

class ControlButton extends Component {
  render() {
    return (
      <div className='SquareBox'>
        <div className='ControlButtonContainer'>
          <div className='centering-table'>
            <a class="centering-table-cell control_button">
              <div class="control_button_content">PLACEHOLDER CONTENT</div>
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default ControlButton;
