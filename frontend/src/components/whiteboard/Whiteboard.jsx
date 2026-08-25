import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from './Canvas';

export default function Whiteboard({ socket, roomId }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff6600');
  const [brushSize, setBrushSize] = useState(3);

  // Canvas size ko responsive banane ke liye taake poori screen/box par draw ho sake
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      canvasRef.current.width = containerRef.current.clientWidth - 20;
      canvasRef.current.height = containerRef.current.clientHeight - 20;
    }
  }, []);

  const drawLine = (x0, y0, x1, y1, color, size, emit) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Color kit options
  const colors = ['#ff6600', '#ffffff', '#3b82f6', '#10b981', '#ef4444', '#eab308', '#a855f7', '#ec4899'];

  return (
    <div style={{ flex: 1, background: '#111', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '10px', boxSizing: 'border-box' }}>
      
      {/* Top Professional Color Kit & Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', padding: '10px 14px', background: '#1a1a1a', borderRadius: '10px', border: '1px solid #333', marginBottom: '8px' }}>
        
        {/* Color Palette / Kit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold' }}>Colors:</span>
          {colors.map((col) => (
            <button
              key={col}
              onClick={() => setBrushColor(col)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: col,
                border: brushColor === col ? '2px solid #fff' : '2px solid transparent',
                cursor: 'pointer',
                boxShadow: brushColor === col ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
                transition: 'all 0.2s'
              }}
            />
          ))}

          {/* Custom Color Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px', borderLeft: '1px solid #333', paddingLeft: '8px' }}>
            <span style={{ color: '#aaa', fontSize: '0.75rem' }}>Custom:</span>
            <input 
              type="color" 
              value={brushColor} 
              onChange={(e) => setBrushColor(e.target.value)}
              style={{ width: '28px', height: '24px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* Size Slider & Clear Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.8rem' }}>
            <span style={{ color: '#aaa', fontSize: '0.75rem' }}>Size: {brushSize}px</span>
            <input 
              type="range" 
              min="1" 
              max="25" 
              value={brushSize} 
              onChange={(e) => setBrushSize(Number(e.target.value))} 
              style={{ cursor: 'pointer', accentColor: '#ff6600' }}
            />
          </div>

          <button 
            onClick={clearCanvas}
            style={{ background: '#262626', color: '#ef4444', border: '1px solid #333', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Clear Board
          </button>
        </div>
      </div>

      {/* Expanded Interactive Canvas Container */}
      <div ref={containerRef} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', border: '1px solid #222', borderRadius: '12px', background: '#000' }}>
        <Canvas 
          canvasRef={canvasRef}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          brushColor={brushColor}
          brushSize={brushSize}
          drawLine={drawLine}
        />
      </div>
    </div>
  );
}