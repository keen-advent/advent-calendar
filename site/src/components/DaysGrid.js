// 5 × 5 grid of day tiles with the hover/focus hint.
import { PRACTICES } from "../data/practices.js";
import { lightNameForDay } from "../data/lights.js";
import { COPY } from "../data/copy.js";
import { tileState, isAvailable } from "../lib/calendar.js";
import { createDayTile, renderDayTile } from "./DayTile.js";
import { createDayHint } from "./DayHint.js";

/**
 * @param {HTMLElement} slot
 * @param {{ onSelect: (day: number, available: boolean) => void }} handlers
 */
export function createDaysGrid(slot, { onSelect }) {
  const wrap = document.createElement("div");
  wrap.className = "days";
  const grid = document.createElement("div");
  grid.className = "days__grid";
  const tiles = PRACTICES.map((p) => createDayTile(p.day));
  grid.append(...tiles);
  wrap.appendChild(grid);
  slot.appendChild(wrap);

  const hint = createDayHint(wrap);
  /** @type {import("../lib/calendar.js").CalendarContext | null} */
  let ctx = null;

  const tileFrom = (target) => /** @type {HTMLButtonElement | null} */ (target instanceof Element ? target.closest(".day-tile") : null);

  function showHint(tile) {
    if (!ctx) return;
    const day = Number(tile.dataset.day);
    const p = PRACTICES[day - 1];
    hint.show(tile, {
      date: COPY.day.date(day),
      title: p.title,
      minutes: p.minutes,
      light: COPY.hint.lights(lightNameForDay(day)),
      note: isAvailable(day, ctx) ? undefined : COPY.hint.opensOn(day),
    });
  }

  grid.addEventListener("pointerover", (e) => {
    const tile = tileFrom(e.target);
    if (tile && e.pointerType === "mouse") showHint(tile);
  });
  grid.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    // Keep the hint if a tile still has keyboard focus.
    const focused = tileFrom(document.activeElement);
    if (focused && focused.matches(":focus-visible")) showHint(focused);
    else hint.hide();
  });
  grid.addEventListener("focusin", (e) => {
    const tile = tileFrom(e.target);
    if (tile && tile.matches(":focus-visible")) showHint(tile);
  });
  grid.addEventListener("focusout", (e) => {
    if (!grid.contains(/** @type {Node | null} */ (e.relatedTarget))) hint.hide();
  });
  grid.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hint.hide();
  });
  grid.addEventListener("click", (e) => {
    const tile = tileFrom(e.target);
    if (!tile || !ctx) return;
    const day = Number(tile.dataset.day);
    onSelect(day, isAvailable(day, ctx));
  });
  window.addEventListener("resize", () => hint.place(), { passive: true });
  window.addEventListener("scroll", () => hint.place(), { passive: true });

  return {
    /** @param {{ done: Set<number>, ctx: import("../lib/calendar.js").CalendarContext }} state */
    render(state) {
      ctx = state.ctx;
      tiles.forEach((button, i) => {
        const day = i + 1;
        renderDayTile(button, { day, title: PRACTICES[i].title, state: tileState(day, state) });
      });
      if (hint.anchor) showHint(hint.anchor);
    },

    /**
     * @param {number} day
     * @param {FocusOptions} [options]
     */
    focusDay(day, options) {
      tiles[day - 1]?.focus(options);
    },

    /** Soft gold fade on a tile that has just been lit (CSS animation, see days-panel.css). */
    markJustLit(/** @type {number} */ day) {
      const tile = tiles[day - 1];
      if (!tile) return;
      tile.classList.add("is-just-lit");
      tile.addEventListener("animationend", () => tile.classList.remove("is-just-lit"), { once: true });
    },
  };
}
