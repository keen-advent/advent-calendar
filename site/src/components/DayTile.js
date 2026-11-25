// One day of the calendar (Figma component "Day", 6:16).
// Figma states: Lit, Open, Today, Locked, Door locked, Door lit. Combinations Figma
// does not draw follow from the same rules: "today" adds the 3px red border to lit or
// open; the door adds the "двері" label to any state.
import { COPY } from "../data/copy.js";
import { esc } from "../lib/dom.js";

/**
 * Creates the tile button once; render() updates it in place so focus is kept.
 * @param {number} day
 */
export function createDayTile(day) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "day-tile";
  button.dataset.day = String(day);
  return button;
}

/**
 * @param {HTMLButtonElement} button
 * @param {{ day: number, title: string, state: import("../lib/calendar.js").TileState }} input
 */
export function renderDayTile(button, { day, title, state }) {
  const { status, isToday, isDoor } = state;
  button.className = [
    "day-tile",
    `day-tile--${status}`,
    isToday ? "is-today" : "",
    isDoor ? "day-tile--door" : "",
  ].filter(Boolean).join(" ");

  const parts = [];
  if (isDoor) parts.push(COPY.day.stateDoor);
  if (isToday) parts.push(COPY.day.stateToday);
  if (status === "lit") parts.push(COPY.day.stateLit);
  if (status === "locked") parts.push(COPY.day.stateLocked(day));
  button.setAttribute("aria-label", COPY.day.ariaLabel(day, title, parts.join(", ")));

  // Locked days stay focusable (their hint is still useful) but are marked unavailable.
  if (status === "locked") button.setAttribute("aria-disabled", "true");
  else button.removeAttribute("aria-disabled");
  if (isToday) button.setAttribute("aria-current", "date");
  else button.removeAttribute("aria-current");

  button.innerHTML =
    `<span class="day-tile__number" aria-hidden="true">${day}</span>` +
    (isDoor ? `<span class="day-tile__label" aria-hidden="true">${esc(COPY.day.doorLabel)}</span>` : "");
}
