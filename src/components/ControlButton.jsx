import React from 'react';
import './ComponentCss/ControlButton.css';


const ControlButton = ({ active, disabled, onClick, mode, displayName }) => (
  <div className={`SquareBox${active ? ' Active' : ''}`}>
    <button
      type="button"
      className="ControlButtonContainer control_button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      data-mode={mode}
    >
      <span className="control_button_content">{displayName}</span>
    </button>
  </div>
);

export default ControlButton;
