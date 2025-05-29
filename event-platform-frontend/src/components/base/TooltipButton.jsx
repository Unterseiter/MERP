import React, { useState } from 'react';
import './TooltipButton.css';

const TooltipButton = ({ icon: IconComponent, tooltipContent, iconSize = 24, iconColor = 'currentColor' }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="tooltip-container">
      <button
        className="tooltip-icon-button"
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        aria-label="Информация"
      >
        <IconComponent size={iconSize} color={iconColor} />
      </button>
      {isTooltipVisible && (
        <div className="tooltip-box">
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default TooltipButton;