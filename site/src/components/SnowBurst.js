// A short snowfall over the house after a day is completed (3.2 s, then fades).
// Logic copied from the prototype. Does nothing under prefers-reduced-motion.
import { prefersReducedMotion } from "../lib/motion.js";

const DURATION = 3200;

/** @param {HTMLCanvasElement} canvas */
export function createSnowBurst(canvas) {
  const ctx = canvas.getContext("2d");
  let raf = 0;

  return function burst() {
    if (!ctx || prefersReducedMotion()) return;
    const dpr = devicePixelRatio || 1;
    const W = (canvas.width = canvas.clientWidth * dpr);
    const H = (canvas.height = canvas.clientHeight * dpr);
    const flakes = Array.from({ length: 90 }, () => ({
      x: Math.random() * W,
      y: -Math.random() * H * 0.6,
      r: (1.5 + Math.random() * 3) * dpr,
      v: (0.6 + Math.random() * 1.4) * dpr,
      s: Math.random() * 6,
    }));
    const t0 = performance.now();
    cancelAnimationFrame(raf);
    const step = (t) => {
      const k = (t - t0) / DURATION;
      ctx.clearRect(0, 0, W, H);
      if (k > 1) return;
      ctx.fillStyle = `rgba(255,255,255,${k < 0.8 ? 0.95 : (1 - k) * 4.75})`;
      for (const f of flakes) {
        f.y += f.v * 2;
        f.x += Math.sin(t / 600 + f.s) * 0.6 * dpr;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, 7);
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
}
