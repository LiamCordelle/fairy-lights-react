import React from 'react';
import './ComponentCss/ControlButton.css';

const ControlButton = ({ active, onClick, mode, displayName }) => {
  let outerBoxClassName = "SquareBox";

  if (active) {
    outerBoxClassName += " Active";
  }

  return (
    <div className={outerBoxClassName}>
      <div className='ControlButtonContainer'>
        <div className='centering-table'>
          <a className="centering-table-cell control_button" onClick={onClick} href={"#" + mode}>
            <div className="control_button_content">{displayName}</div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default ControlButton;
