import React, { useRef, useEffect } from 'react';

export const Canvas = ({ canvasRef, isDrawing, setIsDrawing, brushColor, brushSize, drawLine }) => {
  const lastPos = useRef({ x: 0, y: 0 });

  const startDrawing = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawLine(lastPos.current.x, lastPos.current.y, x, y, brushColor, brushSize, true);
    lastPos.current = { x, y };
  };

  const stopDrawing = () => setIsDrawing(false);

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};