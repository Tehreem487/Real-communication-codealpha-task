import React, { useRef } from 'react';

export const Canvas = ({ canvasRef, isDrawing, setIsDrawing, brushColor, brushSize, drawLine }) => {
  const lastPos = useRef({ x: 0, y: 0 });

  // Start Drawing (Mouse & Touch)
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Support both mouse and touch coordinates
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    lastPos.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  // Draw (Mouse & Touch)
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    drawLine(lastPos.current.x, lastPos.current.y, x, y, brushColor, brushSize, true);
    lastPos.current = { x, y };
  };

  const stopDrawing = () => setIsDrawing(false);

  return (
    <div className="canvas-wrapper" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ touchAction: 'none' }} // Mobile par page scroll hone se rokne ke liye
      />
    </div>
  );
};