// Tooltip next to a day tile (Figma "hint", 10:30; placement as in 7:2).
// Shown on mouse hover and on keyboard focus; not on touch, where a tap opens the day.
// Placement follows the Figma frame: the card's top sits at ~64% of the tile height,
// so it overlaps the tile below its number, centred on the tile and kept inside the
// viewport. If there is no room below, it flips above the tile, mirrored.
import { esc } from "../lib/dom.js";

const OVERLAP = 49 / 76; // Figma: tooltip top 49px into a 76px tile
const VIEWPORT_MARGIN = 16;

/**
 * @param {HTMLElement} container  positioned ancestor of the tiles (the tooltip lives here)
 */
export function createDayHint(container) {
  const el = document.createElement("div");
  el.className = "day-hint";
  el.id = "day-hint";
  el.setAttribute("role", "tooltip");
  el.hidden = true;
  container.appendChild(el);

  let anchor = /** @type {HTMLElement | null} */ (null);

  function place() {
    if (!anchor) return;
    const box = container.getBoundingClientRect();
    const tile = anchor.getBoundingClientRect();
    const tipW = el.offsetWidth;
    const tipH = el.offsetHeight;

    let left = tile.left + tile.width / 2 - tipW / 2;
    left = Math.min(Math.max(left, VIEWPORT_MARGIN), document.documentElement.clientWidth - VIEWPORT_MARGIN - tipW);

    let top = tile.top + tile.height * OVERLAP;
    if (top + tipH > window.innerHeight - VIEWPORT_MARGIN) top = tile.bottom - tile.height * OVERLAP - tipH;

    el.style.left = `${left - box.left}px`;
    el.style.top = `${top - box.top}px`;
  }

  return {
    /**
     * @param {HTMLElement} tile
     * @param {{ date: string, title: string, minutes: number, light: string, note?: string }} content
     */
    show(tile, { date, title, minutes, light, note }) {
      if (anchor && anchor !== tile) anchor.removeAttribute("aria-describedby");
      anchor = tile;
      el.innerHTML =
        `<p><strong>${esc(date)}.</strong> ${esc(title)} · ${minutes} хв</p>` +
        `<p>${esc(light)}${note ? ` · ${esc(note)}` : ""}</p>`;
      el.hidden = false;
      tile.setAttribute("aria-describedby", el.id);
      place();
    },

    hide() {
      el.hidden = true;
      anchor?.removeAttribute("aria-describedby");
      anchor = null;
    },

    /** Re-position after layout changes (resize, scroll). */
    place,

    get anchor() {
      return anchor;
    },
  };
}
