// The building illustration: dark base image, lit-window crops of the glow image,
// SVG overlays for the other lights, a snow canvas and the snowdrift. The load-time
// paint-in adds a temporary cover canvas over the stage (PaintIn.js).
// Geometry (crop boxes, overlay coordinates, drift path) is reused from the prototype
// unchanged; see lights.js and houseOverlays.js.
import { LIGHT_SEQUENCE, WINDOW_BOXES } from "../data/lights.js";
import { COPY } from "../data/copy.js";
import { buildOverlaySvg, OVERLAY_VIEWBOX } from "./houseOverlays.js";
import { paintIn } from "./PaintIn.js";
import { createSnowBurst } from "./SnowBurst.js";

const IMG_DARK = "assets/img/building-dark.webp";
const IMG_GLOW = "assets/img/building-glow.webp";

const DRIFT_SVG =
  '<svg class="house-figure__drift" viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
  '<path d="M0 40 C120 10 220 30 330 22 C450 12 560 34 680 20 C800 8 900 28 1000 18 V90 H0Z" fill="#fff"/>' +
  '<path d="M0 58 C160 40 300 62 480 50 C660 40 820 60 1000 48 V90 H0Z" fill="#eef1f6"/></svg>';

/**
 * One lit-window crop: a box over the base image showing the same region of the
 * glow image. Same math as the prototype.
 * @param {string} id
 * @param {number[]} box [left, top, width, height] in percent
 */
function windowMarkup(id, [left, top, width, height]) {
  const imgStyle =
    `width:${(10000 / width).toFixed(3)}%;` +
    `left:${((-left / width) * 100).toFixed(3)}%;` +
    `top:${((-top / height) * 100).toFixed(3)}%`;
  return (
    `<div class="house__window" id="w-${id}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%">` +
    `<img src="${IMG_GLOW}" alt="" style="${imgStyle}"></div>`
  );
}

/**
 * @param {HTMLElement} slot  element the illustration is rendered into
 */
export function createHouseIllustration(slot) {
  slot.innerHTML =
    '<div class="house-figure">' +
    '<div class="house-figure__stage">' +
    '<div class="house">' +
    `<img class="house__base" src="${IMG_DARK}" alt="${COPY.house.alt(0)}" width="1400" height="1177">` +
    `<div class="house__windows">${Object.entries(WINDOW_BOXES).map(([id, box]) => windowMarkup(id, box)).join("")}</div>` +
    `<svg class="house__overlays" viewBox="${OVERLAY_VIEWBOX}" aria-hidden="true" focusable="false">${buildOverlaySvg()}</svg>` +
    '<canvas class="house__snow" aria-hidden="true"></canvas>' +
    "</div></div>" +
    DRIFT_SVG +
    "</div>";

  const figure = /** @type {HTMLElement} */ (slot.querySelector(".house-figure"));
  const house = /** @type {HTMLElement} */ (slot.querySelector(".house"));
  const stage = /** @type {HTMLElement} */ (slot.querySelector(".house-figure__stage"));
  const base = /** @type {HTMLImageElement} */ (slot.querySelector(".house__base"));
  const lights = LIGHT_SEQUENCE.map((id) => house.querySelector(`#w-${id}`));
  const burst = createSnowBurst(/** @type {HTMLCanvasElement} */ (slot.querySelector(".house__snow")));

  return {
    element: figure,

    /** Switches on the light of every completed day and updates the alt text. */
    setLit(/** @type {Set<number>} */ done) {
      lights.forEach((el, i) => el?.classList.toggle("is-lit", done.has(i + 1)));
      base.alt = COPY.house.alt(done.size);
    },

    /** Snowfall after completing a day. */
    burst,

    /** Watercolor paint-in; waits for the base image, which the sketch is drawn from. */
    paintIn() {
      const run = () => requestAnimationFrame(() => paintIn({ stage, base }));
      if (base.complete) run();
      else base.addEventListener("load", run, { once: true });
    },
  };
}
