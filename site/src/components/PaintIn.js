// Watercolor paint-in of the house on page load. Logic copied from the published
// prototype artifact: soft white blobs grow from our first floor (bottom left/centre)
// upward inside a canvas that is used as the house's CSS mask, over a faint grey
// sketch of the building. Skipped entirely under prefers-reduced-motion.
import { prefersReducedMotion } from "../lib/motion.js";

const DURATION = 3000;

/**
 * @param {{ house: HTMLElement, sketch: HTMLElement }} parts
 */
export function paintIn({ house, sketch }) {
  if (prefersReducedMotion()) return;

  const W = 240, H = 202;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return;

  let s = 21;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // Blobs bloom from our first floor (bottom left/centre) upward.
  const B = Array.from({ length: 90 }, () => {
    const x = r() * W, y = H * (0.15 + r() * 0.9);
    const d = Math.hypot((x - W * 0.4) / W, (y - H * 0.95) / H);
    return { x, y, R: 14 + r() * 34, t0: Math.min(0.58, d * 0.68 + r() * 0.1), k: Array.from({ length: 14 }, () => 0.72 + r() * 0.5) };
  });

  const start = performance.now();
  let frame = 0;
  house.classList.add("is-painting");
  sketch.classList.add("is-on");
  const ease = (v) => 1 - Math.pow(1 - v, 3);

  const finish = () => {
    house.classList.remove("is-painting");
    house.style.webkitMaskImage = "";
    house.style.maskImage = "";
    sketch.classList.remove("is-on");
  };

  const step = (now) => {
    const t = Math.min(1, (now - start) / DURATION);
    // Redraw the mask every second frame; it is a soft blur, so half rate is invisible.
    if (frame++ % 2 === 0) {
      g.clearRect(0, 0, W, H);
      g.filter = "blur(2.5px)";
      for (const b of B) {
        const p = (t - b.t0) / 0.32;
        if (p <= 0) continue;
        const rad = b.R * ease(Math.min(1, p));
        g.globalAlpha = 0.55;
        g.fillStyle = "#fff";
        g.beginPath();
        b.k.forEach((k, i) => {
          const a = (i / b.k.length) * Math.PI * 2;
          const px = b.x + Math.cos(a) * rad * k, py = b.y + Math.sin(a) * rad * k * 0.85;
          i ? g.lineTo(px, py) : g.moveTo(px, py);
        });
        g.closePath();
        g.fill();
        g.globalAlpha = 0.35;
        g.fill();
      }
      if (t > 0.78) {
        g.globalAlpha = (t - 0.78) / 0.22;
        g.fillRect(0, 0, W, H);
      }
      g.globalAlpha = 1;
      g.filter = "none";
      const url = `url(${c.toDataURL()})`;
      house.style.webkitMaskImage = url;
      house.style.maskImage = url;
    }
    if (t < 1) requestAnimationFrame(step);
    else finish();
  };
  requestAnimationFrame(step);
}
