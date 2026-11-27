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
import { prefersReducedMotion } from "../lib/motion.js";
import { createTimer } from "./Timer.js";

const M = COPY.modal;
const FADE_OUT = 150; // ms, matches .modal.is-closing in modal.css
const EXPAND = 200;   // ms, "Навіщо це" open/close

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
    // Only this wrapper scrolls (Figma 98:1233); the actions bar below stays put.
    '<div class="sheet__scroll">' +
    '<div class="sheet__header">' +
    '<div class="sheet__heading">' +
    '<p class="sheet__meta" id="modal-meta"></p>' +
    '<h2 class="sheet__title" id="modal-title"></h2>' +
    "</div>" +
    `<button type="button" class="sheet__close" aria-label="${esc(M.close)}"><span aria-hidden="true">×</span></button>` +
    "</div>" +
    '<p class="sheet__idea"></p>' +
    `<details class="why"><summary class="why__summary"><span class="why__label">${esc(M.why)}</span></summary><p class="why__text"></p></details>` +
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
    // Small action (Figma 73:634): same block as "Приклад", with its own label and portrait.
    '<div class="example example--small sheet__small" hidden>' +
    `<img class="example__photo" src="assets/img/mho-portrait-small.webp" alt="${esc(M.mhoPortraitAlt)}" width="72" height="72" decoding="async">` +
    `<div class="example__body"><p class="block-label">${esc(M.smallLabel)}</p><p class="example__action"></p></div>` +
    "</div>" +
    '<div class="sheet__timer-group">' +
    '<div class="sheet__timer"></div>' +
    `<p class="sheet__tip">${esc(M.tip)}</p>` +
    "</div>" +
    // Day-25 support kit card (Figma 50:219): after the timer, in both modes.
    '<div class="sheet__kit" hidden></div>' +
    // Full exercise only; shown and hidden together with .sheet__full in setMode().
    `<div class="reflection"><p class="block-label">${esc(M.reflection)}</p><p class="reflection__text"></p></div>` +
    "</div>" + // .sheet__scroll
    // Actions bar (Figma 98:1126): outside the scroll area, pinned to the bottom.
    '<div class="sheet__bar">' +
    '<p class="done-message" role="status" hidden></p>' +
    '<div class="sheet__actions">' +
    '<button type="button" class="btn btn--secondary sheet__later"></button>' +
    `<button type="button" class="btn btn--primary sheet__complete">${esc(M.complete)}</button>` +
    "</div>" +
    "</div>" +
    '<p class="visually-hidden" aria-live="polite" data-announce></p>' +
    "</div></dialog>";

  const dialog = /** @type {HTMLDialogElement} */ (root.querySelector("dialog"));
  const sheet = /** @type {HTMLElement} */ (dialog.querySelector(".sheet"));
  const scroller = /** @type {HTMLElement} */ (sheet.querySelector(".sheet__scroll"));
  const q = (sel) => /** @type {HTMLElement} */ (sheet.querySelector(sel));
  const el = {
    meta: q(".sheet__meta"), title: q(".sheet__title"), idea: q(".sheet__idea"),
    full: q(".sheet__full"), small: q(".sheet__small"), smallText: q(".example__action"), steps: q(".steps"), kit: q(".sheet__kit"),
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
    el.kit.hidden = day !== DAYS; // shown in both modes; switching keeps typed text
    el.reflectionBlock.hidden = mode !== "full";
    el.small.hidden = mode !== "small";
    timer.set(mode === "full" ? p.minutes : p.smallMinutes);
    scroller.scrollTop = 0;
    syncOverflow();
  }

  /** Width of a classic scrollbar gutter (0 for overlay scrollbars, e.g. on phones);
   *  modal.css subtracts it from the right padding so the content keeps its width. */
  function measureGutter() {
    const gutter = scroller.offsetWidth - scroller.clientWidth;
    scroller.style.setProperty("--sheet-gutter", `${Math.max(0, gutter)}px`);
  }

  // .is-scrolling when content is taller than the scroll area: 16px more space at the
  // end so the last section scrolls fully clear of the bar's fade. The class itself adds
  // those 16px, so they are subtracted to judge the natural size.
  const syncOverflow = () => {
    const added = scroller.classList.contains("is-scrolling") ? 16 : 0;
    scroller.classList.toggle("is-scrolling", scroller.scrollHeight - added > scroller.clientHeight + 1);
  };
  if ("ResizeObserver" in window) {
    const watch = new ResizeObserver(syncOverflow);
    [scroller, ...scroller.children].forEach((child) => watch.observe(child));
  }

  // Keep a focused field or button above the pinned actions bar while tabbing.
  scroller.addEventListener("focusin", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    const bar = /** @type {HTMLElement} */ (q(".sheet__bar"));
    const hidden = target.getBoundingClientRect().bottom - bar.getBoundingClientRect().top;
    if (hidden > 0 && scroller.scrollHeight > scroller.clientHeight) scroller.scrollTop += hidden + 12;
  });

  let closing = 0;

  /** The dialog is really closed and onClose runs after the 150 ms fade-out. */
  function finishClose() {
    clearTimeout(closing);
    closing = 0;
    dialog.classList.remove("is-closing");
    dialog.close();
    document.documentElement.classList.remove("has-modal");
    onClose({ day, completed: completedNow });
  }

  function close() {
    if (!dialog.open || closing) return;
    timer.stop();
    releaseTrap();
    if (prefersReducedMotion()) {
      finishClose();
      return;
    }
    dialog.classList.add("is-closing");
    closing = window.setTimeout(finishClose, FADE_OUT);
  }

  /** "Навіщо це": the text expands and collapses over 200 ms instead of jumping. */
  el.why.querySelector("summary")?.addEventListener("click", (e) => {
    if (prefersReducedMotion() || !el.whyText.animate) return; // native toggle
    e.preventDefault();
    const text = el.whyText;
    const opening = !el.why.open;
    if (opening) el.why.open = true;
    const full = { height: `${text.scrollHeight}px`, marginTop: getComputedStyle(text).marginTop, opacity: 1 };
    const shut = { height: "0px", marginTop: "0px", opacity: 0 };
    text.style.overflow = "hidden";
    el.why.classList.toggle("is-collapsing", !opening); // arrow turns back right away
    const anim = text.animate(opening ? [shut, full] : [full, shut], { duration: EXPAND, easing: "ease" });
    anim.onfinish = anim.oncancel = () => {
      text.style.overflow = "";
      if (!opening) el.why.open = false;
      el.why.classList.remove("is-collapsing");
    };
  });

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

  /** Shared button variant (button.css): "primary" (gold) or "secondary". */
  const setVariant = (button, variant) => {
    button.classList.toggle("btn--primary", variant === "primary");
    button.classList.toggle("btn--secondary", variant === "secondary");
  };

  el.complete.addEventListener("click", () => {
    completedNow = true;
    onComplete(day);
    timer.stop();
    const line = COMPLETION_LINES[Math.floor(Math.random() * COMPLETION_LINES.length)];
    el.done.textContent = M.litNow(line, lightNameForDay(day));
    el.done.hidden = false;
    el.complete.hidden = true;
    el.later.textContent = M.seeHouse;
    // The day was just lit: "Подивитися на дім" becomes the primary action.
    setVariant(el.later, "primary");
    el.later.focus();
  });

  return {
    /** @param {number} d */
    open(d) {
      if (closing) finishClose();
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
      el.smallText.textContent = p.small;
      el.whyText.textContent = p.why;
      el.why.open = false;
      el.why.classList.remove("is-collapsing");

      const lit = isDone(d);
      el.done.hidden = !lit;
      el.done.textContent = lit ? M.alreadyLit : "";
      el.complete.hidden = lit;
      el.later.textContent = lit ? M.close : M.later;
      setVariant(el.later, "secondary"); // "Повернуся пізніше" / "Закрити" stay secondary

      setMode("full");
      document.documentElement.classList.add("has-modal");
      dialog.showModal();
      dialog.scrollTop = 0;
      scroller.scrollTop = 0;
      measureGutter();
      releaseTrap = trapFocus(dialog);
      el.close.focus();
    },

    close,

    /** Container for the day-25 support kit card (stage 6). */
    kitSlot: el.kit,
  };
}
