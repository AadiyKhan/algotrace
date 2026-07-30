import React, { useEffect, useRef } from 'react';

const Background2DGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = 1000;
    let height = 1000;
    const CELL_SIZE = 40;

    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }
    };

    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();

    let mouseX = -1000;
    let mouseY = -1000;
    const activeCells = new Map(); // key: "x,y", value: { life, char }

    const CHARS = ['0', '1', '+', '-', ':', '.', ''];

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      
      // If mouse is outside the canvas bounds, do nothing
      if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
      
      const gridX = Math.floor(mouseX / CELL_SIZE);
      const gridY = Math.floor(mouseY / CELL_SIZE);
      
      // Light up the cell under cursor and neighbors
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (Math.random() > 0.3) { // 70% chance to light up a neighbor
            const key = `${gridX + dx},${gridY + dy}`;
            activeCells.set(key, { 
              life: 1.0, 
              char: CHARS[Math.floor(Math.random() * CHARS.length)] 
            });
          }
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint static 2D grid
      ctx.beginPath();
      for (let x = 0; x <= width; x += CELL_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += CELL_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Process and draw active cells
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const [key, cell] of activeCells.entries()) {
        const [gx, gy] = key.split(',').map(Number);
        const px = gx * CELL_SIZE;
        const py = gy * CELL_SIZE;

        // Draw glowing background block
        ctx.fillStyle = `rgba(245, 158, 11, ${cell.life * 0.15})`;
        ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);

        // Draw character
        if (cell.char) {
          ctx.fillStyle = `rgba(245, 158, 11, ${cell.life * 0.8})`;
          ctx.fillText(cell.char, px + CELL_SIZE / 2, py + CELL_SIZE / 2);
        }

        // Fade out
        cell.life -= 0.02;
        if (cell.life <= 0) {
          activeCells.delete(key);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default Background2DGrid;
