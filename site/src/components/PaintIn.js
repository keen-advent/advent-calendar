// Watercolor paint-in of the house on page load (3 s). Same look and timing as the
// published prototype: soft white blobs bloom from our first floor (bottom left/centre)
// upward and reveal the house, which starts as a faint grey sketch on the page
// background; at the end the rest fades out.
//
// How: a cover canvas sits over the house stage. Each frame it is painted with the
// page background and the sketch, then the blobs (drawn on a small 240×202 canvas and
// scaled up, which softens their edges) are erased from it with "destination-out".
// No mask images are swapped, so mobile browsers have nothing to decode per frame
// (the old toDataURL + mask-image approach flickered on iOS). Canvas `filter` is not
// used: older Safari ignores it.
//
// Skipped under prefers-reduced-motion. On slow or low-memory/save-data devices the
// cover simply fades out over 400 ms instead.
import { prefersReducedMotion } from "../lib/motion.js";

const DURATION = 3000;
const SKETCH_FADE = 1200;   // the grey sketch fades in, as the old CSS transition did
const SKETCH_OPACITY = 0.32;
const SIMPLE_FADE = 400;
const SLOW_FRAME = 32;      // ms; average over the first frames
const PROBE_FRAMES = 8;
const W = 240, H = 202;     // blob canvas (the prototype's mask resolution)

/** CSS filter grayscale(1) contrast(1.6) brightness(1.15), baked into pixels once. */
function sketchCanvas(img, width, height) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return null;
  g.drawImage(img, 0, 0, width, height);
  try {
    const data = g.getImageData(0, 0, width, height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      const v = Math.max(0, Math.min(255, ((lum - 127.5) * 1.6 + 127.5) * 1.15));
      px[i] = px[i + 1] = px[i + 2] = v;
      px[i + 3] *= SKETCH_OPACITY;
    }
    g.putImageData(data, 0, 0);
  } catch {
    return null; // pixels unavailable: the cover is plain background
  }
  return c;
}

/** First non-transparent background behind the element (the page band it sits on). */
function backgroundBehind(el) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg)) return bg;
  }
  return getComputedStyle(document.documentElement).getPropertyValue("--bg-page").trim() || "#fbf7f0";
}

/** Low memory or data saver: skip the watercolor. */
function prefersLight() {
  const nav = /** @type {any} */ (navigator);
  return Boolean(nav.connection?.saveData) || (typeof nav.deviceMemory === "number" && nav.deviceMemory < 2);
}

/**
 * @param {{ stage: HTMLElement, base: HTMLImageElement }} parts
 */
export function paintIn({ stage, base }) {
  if (prefersReducedMotion()) return;

  // Cover canvas over the stage, sized to it now; CSS keeps it aligned (100% × 100%)
  // if the stage resizes or the phone rotates during the 3 s.
  const scale = Math.min(devicePixelRatio || 1, 2);
  const cw = Math.max(1, Math.round(stage.clientWidth * scale));
  const ch = Math.max(1, Math.round(stage.clientHeight * scale));
  const cover = document.createElement("canvas");
  cover.className = "house-figure__cover";
  cover.setAttribute("aria-hidden", "true");
  cover.width = cw;
  cover.height = ch;
  const ctx = cover.getContext("2d");
  if (!ctx) return;
  stage.appendChild(cover);

  const bg = backgroundBehind(stage);
  const sketch = sketchCanvas(base, cw, ch);

  /** Background + sketch (faded in by `sketchAlpha`). */
  const paintCover = (sketchAlpha) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
    if (sketch && sketchAlpha > 0) {
      ctx.globalAlpha = sketchAlpha;
      ctx.drawImage(sketch, 0, 0);
      ctx.globalAlpha = 1;
    }
  };

  const remove = () => cover.remove();

  /** Fallback: the cover fades out in 400 ms, no watercolor. */
  const simpleFade = () => {
    cover.style.transition = `opacity ${SIMPLE_FADE}ms ease`;
    requestAnimationFrame(() => (cover.style.opacity = "0"));
    setTimeout(remove, SIMPLE_FADE + 50);
  };

  paintCover(0);
  if (prefersLight()) {
    simpleFade();
    return;
  }

  // Blobs: the prototype's seeded random blobs, timing and easing, unchanged.
  const blobs = document.createElement("canvas");
  blobs.width = W;
  blobs.height = H;
  const g = blobs.getContext("2d");
  if (!g) {
    simpleFade();
    return;
  }
  let s = 21;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const B = Array.from({ length: 90 }, () => {
    const x = r() * W, y = H * (0.15 + r() * 0.9);
    const d = Math.hypot((x - W * 0.4) / W, (y - H * 0.95) / H);
    return { x, y, R: 14 + r() * 34, t0: Math.min(0.58, d * 0.68 + r() * 0.1), k: Array.from({ length: 14 }, () => 0.72 + r() * 0.5) };
  });
  const ease = (v) => 1 - Math.pow(1 - v, 3);
  // Soft edges: a white shadow under each blob (stands in for the old blur(2.5px)),
  // then bilinear scaling of the small canvas onto the cover.
  g.shadowColor = "#fff";
  g.shadowBlur = 5;
  g.fillStyle = "#fff";

  const drawBlobs = (t) => {
    g.clearRect(0, 0, W, H);
    for (const b of B) {
      const p = (t - b.t0) / 0.32;
      if (p <= 0) continue;
      const rad = b.R * ease(Math.min(1, p));
      g.beginPath();
      b.k.forEach((k, i) => {
        const a = (i / b.k.length) * Math.PI * 2;
        const px = b.x + Math.cos(a) * rad * k, py = b.y + Math.sin(a) * rad * k * 0.85;
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      });
      g.closePath();
      g.globalAlpha = 0.55;
      g.fill();
      g.globalAlpha = 0.35;
      g.fill();
    }
    g.globalAlpha = 1;
  };

  const start = performance.now();
  let last = start;
  let frames = 0;
  let slowTotal = 0;

  const step = (now) => {
    // Performance probe: a slow device gets the simple fade instead.
    if (frames > 0 && frames <= PROBE_FRAMES) slowTotal += now - last;
    last = now;
    frames++;
    if (frames === PROBE_FRAMES + 1 && slowTotal / PROBE_FRAMES > SLOW_FRAME) {
      simpleFade();
      return;
    }

    const t = Math.min(1, (now - start) / DURATION);
    drawBlobs(t);
    paintCover(Math.min(1, (now - start) / SKETCH_FADE));
    ctx.globalCompositeOperation = "destination-out";
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(blobs, 0, 0, cw, ch);
    ctx.globalCompositeOperation = "source-over";
    // End: whatever is still covered fades out (the prototype filled the mask here).
    cover.style.opacity = t > 0.78 ? String(1 - (t - 0.78) / 0.22) : "";

    if (t < 1) requestAnimationFrame(step);
    else remove();
  };
  requestAnimationFrame(step);
}
