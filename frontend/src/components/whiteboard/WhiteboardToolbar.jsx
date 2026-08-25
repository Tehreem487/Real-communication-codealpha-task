import React from 'react';

export const WhiteboardToolbar = ({ brushColor, setBrushColor, brushSize, setBrushSize }) => {
  return (
    <div className="whiteboard-toolbar">
      <button 
        className={`tool-icon-btn ${brushColor === '#ff6600' ? 'active' : ''}`} 
        onClick={() => setBrushColor('#ff6600')}
      >
        Orange Accent
      </button>
      <button 
        className={`tool-icon-btn ${brushColor === '#ffffff' ? 'active' : ''}`} 
        onClick={() => setBrushColor('#ffffff')}
      >
        White
      </button>
      <div className="size-selector">
        <span>Size:</span>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={brushSize} 
          onChange={(e) => setBrushSize(Number(e.target.value))} 
        />
      </div>
    </div>
  );
};