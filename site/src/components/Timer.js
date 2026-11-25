// Silent countdown with a ring (Figma 13:126). Logic from the prototype: the end time
// is kept as a timestamp, so the timer stays correct if the tab sleeps.
// The ticking time is not announced to screen readers; only "time's up" is.
import { COPY } from "../data/copy.js";

const R = 20.16; // Figma ring: 48px, 6.72px stroke
const C = 2 * Math.PI * R;

const pad = (n) => String(n).padStart(2, "0");
const format = (seconds) => {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

/**
 * @param {HTMLElement} slot
 * @param {{ announce: (message: string) => void }} deps
 */
export function createTimer(slot, { announce }) {
  slot.innerHTML =
    '<div class="timer">' +
    '<svg class="timer__ring" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
    `<circle cx="24" cy="24" r="${R}" class="timer__track"/>` +
    `<circle cx="24" cy="24" r="${R}" class="timer__arc" transform="rotate(-90 24 24)" stroke-dasharray="${C.toFixed(3)}"/>` +
    "</svg>" +
    '<div class="timer__controls">' +
    '<span class="timer__time" role="timer"></span>' +
    '<div class="timer__buttons">' +
    `<button type="button" class="btn btn--secondary timer__go">${COPY.timer.start}</button>` +
    `<button type="button" class="btn btn--secondary timer__reset">${COPY.timer.reset}</button>` +
    "</div></div></div>";

  const timeEl = /** @type {HTMLElement} */ (slot.querySelector(".timer__time"));
  const arc = /** @type {SVGCircleElement} */ (slot.querySelector(".timer__arc"));
  const go = /** @type {HTMLButtonElement} */ (slot.querySelector(".timer__go"));
  const resetBtn = /** @type {HTMLButtonElement} */ (slot.querySelector(".timer__reset"));

  let total = 0;
  let left = 0;
  let endAt = 0;
  let interval = 0;

  function draw() {
    timeEl.textContent = format(left);
    arc.style.strokeDashoffset = String(total ? C * (1 - left / total) : 0);
  }

  // "Скинути" has nothing to do while the timer sits at its full duration and is not
  // running: on open, after a format switch and right after a reset.
  function syncReset() {
    resetBtn.disabled = !interval && left >= total;
  }

  function stop() {
    clearInterval(interval);
    interval = 0;
    go.textContent = left > 0 && left < total ? COPY.timer.resume : COPY.timer.start;
    syncReset();
  }

  function tick() {
    left = (endAt - Date.now()) / 1000;
    if (left <= 0) {
      left = 0;
      stop();
      timeEl.textContent = COPY.timer.over;
      arc.style.strokeDashoffset = String(C);
      announce(COPY.timer.over);
      return;
    }
    draw();
  }

  go.addEventListener("click", () => {
    if (interval) {
      stop();
      return;
    }
    if (left <= 0) left = total;
    endAt = Date.now() + left * 1000;
    interval = window.setInterval(tick, 250);
    go.textContent = COPY.timer.pause;
    syncReset();
  });

  resetBtn.addEventListener("click", () => {
    const hadFocus = document.activeElement === resetBtn;
    set(total / 60);
    // The reset button is now disabled and would drop focus; hand it to "Почати".
    if (hadFocus) go.focus();
  });

  /** @param {number} minutes */
  function set(minutes) {
    clearInterval(interval);
    interval = 0;
    total = left = minutes * 60;
    go.textContent = COPY.timer.start;
    draw();
    syncReset();
  }

  return { set, stop };
}
