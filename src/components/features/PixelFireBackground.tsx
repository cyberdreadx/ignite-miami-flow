import React, { useEffect, useRef } from "react";

// 8-bit fire palette: deep red → orange → yellow → white-hot
const FIRE_PALETTE = [
  [7, 0, 0],
  [30, 0, 0],
  [60, 0, 0],
  [100, 5, 0],
  [150, 15, 0],
  [200, 40, 0],
  [230, 80, 0],
  [245, 120, 0],
  [255, 160, 10],
  [255, 200, 40],
  [255, 230, 100],
  [255, 245, 180],
  [255, 255, 230],
];

const PIXEL = 6; // pixel block size
const COLS = 80;
const ROWS = 40;

export const PixelFireBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireRef = useRef<number[]>(new Array(COLS * ROWS).fill(0));
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = COLS * PIXEL;
    canvas.height = ROWS * PIXEL;

    const fire = fireRef.current;

    // Seed the bottom row with max heat
    const seedFire = () => {
      for (let x = 0; x < COLS; x++) {
        fire[(ROWS - 1) * COLS + x] = FIRE_PALETTE.length - 1;
      }
    };

    const spreadFire = (src: number) => {
      const pixel = fire[src];
      if (pixel === 0) {
        fire[src - COLS] = 0;
        return;
      }
      const rand = Math.floor(Math.random() * 3);
      const dst = src - COLS - rand + 1;
      if (dst >= 0 && dst < COLS * ROWS) {
        fire[dst] = pixel - (rand & 1);
      }
    };

    const renderFire = () => {
      seedFire();
      for (let x = 0; x < COLS; x++) {
        for (let y = 1; y < ROWS; y++) {
          spreadFire(y * COLS + x);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const val = fire[y * COLS + x];
          if (val > 0) {
            const [r, g, b] = FIRE_PALETTE[Math.min(val, FIRE_PALETTE.length - 1)];
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
          }
        }
      }

      frameRef.current = requestAnimationFrame(renderFire);
    };

    frameRef.current = requestAnimationFrame(renderFire);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Top fade: fire blends into dark background */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "220px",
          background: "linear-gradient(to top, transparent 0%, transparent 30%, hsl(0 0% 6% / 0.6) 70%, hsl(0 0% 6%) 100%)",
          zIndex: 2,
        }}
      />

      {/* Bottom fade: fire fades INTO the page bottom (no hard cut-off) */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "60px",
          background: "linear-gradient(to bottom, transparent 0%, hsl(0 0% 6%) 100%)",
          zIndex: 4,
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "220px",
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)",
          zIndex: 3,
        }}
      />

      {/* Canvas fire — bottom-anchored, pixelated, max 220px tall */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "220px",
          imageRendering: "pixelated",
          zIndex: 1,
          opacity: 0.78,
        }}
      />
    </div>
  );
};
