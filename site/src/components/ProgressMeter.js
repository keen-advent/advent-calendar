// "Засвічено вогників: N з 25" and the gold meter (Figma 7:11–7:13).
import { COPY } from "../data/copy.js";
import { DAYS } from "../lib/calendar.js";

/** @param {HTMLElement} slot */
export function createProgressMeter(slot) {
  slot.innerHTML =
    '<p class="progress__label"></p>' +
    '<div class="progress__meter" aria-hidden="true"><div class="progress__fill"></div></div>';
  const label = /** @type {HTMLElement} */ (slot.querySelector(".progress__label"));
  const fill = /** @type {HTMLElement} */ (slot.querySelector(".progress__fill"));

  return {
    /** @param {{ count: number, beforeLaunch: boolean }} input */
    render({ count, beforeLaunch }) {
      label.textContent =
        count > 0 ? COPY.progress.count(count) : beforeLaunch ? COPY.progress.beforeLaunch : COPY.progress.empty;
      fill.style.width = `${(count / DAYS) * 100}%`;
    },
  };
}
