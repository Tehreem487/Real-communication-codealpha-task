import React, {
  useRef,
} from 'react';

export const Canvas = ({
  canvasRef,
  isDrawing,
  setIsDrawing,
  brushColor,
  brushSize,
  drawLine,
}) => {
  const lastPos = useRef({
    x: 0,
    y: 0,
  });

  const getPosition = (e) => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect =
      canvas.getBoundingClientRect();

    const point =
      e.touches?.[0] ||
      e.changedTouches?.[0] ||
      e;

    return {
      x:
        point.clientX -
        rect.left,
      y:
        point.clientY -
        rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();

    const position =
      getPosition(e);

    lastPos.current =
      position;

    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();

    if (!isDrawing) return;

    const position =
      getPosition(e);

    drawLine(
      lastPos.current.x,
      lastPos.current.y,
      position.x,
      position.y,
      brushColor,
      brushSize,
      true
    );

    lastPos.current =
      position;
  };

  const stopDrawing = (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    setIsDrawing(false);
  };

  return (
    <div
      className="canvas-wrapper"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent:
          'center',
        alignItems: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={
          startDrawing
        }
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={
          stopDrawing
        }
        onTouchStart={
          startDrawing
        }
        onTouchMove={draw}
        onTouchEnd={
          stopDrawing
        }
        style={{
          touchAction: 'none',
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
    </div>
  );
};

export default Canvas;