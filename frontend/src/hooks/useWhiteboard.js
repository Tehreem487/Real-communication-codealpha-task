import { useState, useEffect, useRef } from 'react';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '../utils/constants';

export const useWhiteboard = () => {
  const { socket } = useSocket();
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff6600'); // Orange accent match
  const [brushSize, setBrushSize] = useState(3);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctxRef.current = ctx;

    if (socket) {
      socket.on(SOCKET_EVENTS.WHITEBOARD_DRAW, ({ x0, y0, x1, y1, color, size }) => {
        drawLine(x0, y0, x1, y1, color, size, false);
      });
    }

    return () => {
      if (socket) socket.off(SOCKET_EVENTS.WHITEBOARD_DRAW);
    };
  }, [socket, brushColor, brushSize]);

  const drawLine = (x0, y0, x1, y1, color, size, emit = true) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    if (!emit || !socket) return;

    socket.emit(SOCKET_EVENTS.WHITEBOARD_DRAW, {
      x0,
      y0,
      x1,
      y1,
      color,
      size,
    });
  };

  return {
    canvasRef,
    isDrawing,
    setIsDrawing,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    drawLine,
  };
};