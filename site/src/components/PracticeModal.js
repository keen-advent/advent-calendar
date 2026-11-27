// Practice modal (Figma 13:94). Built on <dialog> + showModal(), so the rest of the
// page is inert while it is open; a focus trap keeps Tab cycling inside the sheet.
// Behaviour follows the prototype: two formats with their own timer length, the
// completion message, and the light switching on only after the modal closes.
import { PRACTICES } from "../data/practices.js";
import { lightNameForDay } from "../data/lights.js";
import { COMPLETION_LINES } from "../data/completionLines.js";
import { COPY } from "../data/copy.js";
import { DAYS } from "../lib/calendar.js";
import { esc } from "../lib/dom.js";
import { trapFocus } from "../lib/focusTrap.js";
import { createTimer } from "./Timer.js";

const M = COPY.modal;

/**
 * @param {HTMLElement} root
 * @param {{
 *   isDone: (day: number) => boolean,
 *   onComplete: (day: number) => void,
 *   onClose: (result: { day: number, completed: boolean }) => void,
 * }} handlers
 */
export function createPracticeModal(root, { isDone, onComplete, onClose }) {
  root.innerHTML =
    '<dialog class="modal" aria-labelledby="modal-title">' +
    '<div class="sheet">' +
    '<div class="sheet__header">' +
    '<div class="sheet__heading">' +
    '<p class="sheet__meta" id="modal-meta"></p>' +
    '<h2 class="sheet__title" id="modal-title"></h2>' +
    "</div>" +
    `<button type="button" class="sheet__close" aria-label="${esc(M.close)}"><span aria-hidden="true">×</span></button>` +
    "</div>" +
    '<p class="sheet__idea"></p>' +
    `<details class="why"><summary class="why__summary">${esc(M.why)}</summary><p class="why__text"></p></details>` +
    `<div class="switch" role="group" aria-label="${esc(M.formatGroup)}">` +
    '<button type="button" class="switch__option" data-mode="full" aria-pressed="true"></button>' +
    '<button type="button" class="switch__option" data-mode="small" aria-pressed="false"></button>' +
    "</div>" +
    '<div class="sheet__full">' +
    '<ol class="steps"></ol>' +
    // Same portrait on every day: it belongs to the Example block layout, not to the day's data.
    '<div class="example">' +
    `<img class="example__photo" src="assets/img/mho-portrait.webp" alt="${esc(M.mhoPortraitAlt)}" width="80" height="80" decoding="async">` +
    `<div class="example__body"><p class="block-label">${esc(M.example)}</p><p class="example__text"></p></div>` +
    "</div>" +
    "</div>" +
    '<p class="sheet__small" hidden></p>' +
    '<div class="sheet__timer-group">' +
    '<div class="sheet__timer"></div>' +
    `<p class="sheet__tip">${esc(M.tip)}</p>` +
    "</div>" +
    // Day-25 support kit card (Figma 50:219): after the timer, full exercise only (setMode()).
    '<div class="sheet__kit" hidden></div>' +
    // Full exercise only; shown and hidden together with .sheet__full in setMode().
    `<div class="reflection"><p class="block-label">${esc(M.reflection)}</p><p class="reflection__text"></p></div>` +
    '<p class="done-message" role="status" hidden></p>' +
    '<div class="sheet__actions">' +
    '<button type="button" class="btn btn--secondary sheet__later"></button>' +
    `<button type="button" class="btn btn--primary sheet__complete">${esc(M.complete)}</button>` +
    "</div>" +
    '<p class="visually-hidden" aria-live="polite" data-announce></p>' +
    "</div></dialog>";

  const dialog = /** @type {HTMLDialogElement} */ (root.querySelector("dialog"));
  const sheet = /** @type {HTMLElement} */ (dialog.querySelector(".sheet"));
  const q = (sel) => /** @type {HTMLElement} */ (sheet.querySelector(sel));
  const el = {
    meta: q(".sheet__meta"), title: q(".sheet__title"), idea: q(".sheet__idea"),
    full: q(".sheet__full"), small: q(".sheet__small"), steps: q(".steps"), kit: q(".sheet__kit"),
    example: q(".example__text"), reflectionBlock: q(".reflection"), reflection: q(".reflection__text"),
    why: /** @type {HTMLDetailsElement} */ (q(".why")), whyText: q(".why__text"),
    done: q(".done-message"), later: q(".sheet__later"), complete: q(".sheet__complete"),
    close: q(".sheet__close"), announce: q("[data-announce]"),
  };
  const options = /** @type {HTMLButtonElement[]} */ ([...sheet.querySelectorAll(".switch__option")]);

  const announce = (message) => {
    el.announce.textContent = "";
    requestAnimationFrame(() => (el.announce.textContent = message));
  };
  const timer = createTimer(q(".sheet__timer"), { announce });

  let day = 0;
  let completedNow = false;
  let releaseTrap = () => {};

  /** @param {"full" | "small"} mode */
  function setMode(mode) {
    const p = PRACTICES[day - 1];
    options.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    el.full.hidden = mode !== "full";
    el.kit.hidden = day !== DAYS || mode !== "full";
    el.reflectionBlock.hidden = mode !== "full";
    el.small.hidden = mode !== "small";
    timer.set(mode === "full" ? p.minutes : p.smallMinutes);
  }

  function close() {
    if (!dialog.open) return;
    timer.stop();
    releaseTrap();
    dialog.close();
    document.documentElement.classList.remove("has-modal");
    onClose({ day, completed: completedNow });
  }

  options.forEach((b) => b.addEventListener("click", () => setMode(/** @type {"full" | "small"} */ (b.dataset.mode))));
  el.close.addEventListener("click", close);
  el.later.addEventListener("click", close);
  // Escape: let our close() run so focus and the light are handled the same way.
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  // Click on the dimmed area outside the sheet.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close();
  });

  el.complete.addEventListener("click", () => {
    completedNow = true;
    onComplete(day);
    timer.stop();
    const line = COMPLETION_LINES[Math.floor(Math.random() * COMPLETION_LINES.length)];
    el.done.textContent = M.litNow(line, lightNameForDay(day));
    el.done.hidden = false;
    el.complete.hidden = true;
    el.later.textContent = M.seeHouse;
    el.later.focus();
  });

  return {
    /** @param {number} d */
    open(d) {
      day = d;
      completedNow = false;
      const p = PRACTICES[d - 1];
      el.meta.textContent = M.meta(d);
      el.title.textContent = p.title;
      el.idea.textContent = p.idea;
      options[0].textContent = M.formatFull(p.minutes);
      options[1].textContent = M.formatSmall(p.smallMinutes);
      el.steps.innerHTML = p.steps.map((s) => `<li>${esc(s)}</li>`).join("");
      el.example.textContent = p.example;
      el.reflection.textContent = p.reflection;
      el.small.textContent = p.small;
      el.whyText.textContent = p.why;
      el.why.open = false;

      const lit = isDone(d);
      el.done.hidden = !lit;
      el.done.textContent = lit ? M.alreadyLit : "";
      el.complete.hidden = lit;
      el.later.textContent = lit ? M.close : M.later;

      setMode("full");
      document.documentElement.classList.add("has-modal");
      dialog.showModal();
      dialog.scrollTop = 0;
      releaseTrap = trapFocus(dialog);
      el.close.focus();
    },

    close,

    /** Container for the day-25 support kit card (stage 6). */
    kitSlot: el.kit,
  };
}
