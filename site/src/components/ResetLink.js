// "Почати вправи спочатку" (Figma 7:77). Pressing it swaps the link, in place, for an
// inline confirmation (Figma 81:878): the question and two small buttons, "так" / "ні".
// Focus goes to "ні" so an accidental Enter erases nothing. "ні", Esc or 5 seconds
// without an answer cancel; "так" runs the reset. Either way the link comes back.
import { COPY } from "../data/copy.js";
import { esc } from "../lib/dom.js";

const CONFIRM_WINDOW = 5000;
const R = COPY.reset;

/**
 * @param {HTMLElement} slot
 * @param {{ onReset: () => void }} handlers
 */
export function createResetLink(slot, { onReset }) {
  const link = document.createElement("button");
  link.type = "button";
  link.className = "text-link reset-link";
  link.textContent = R.idle;

  const confirm = document.createElement("div");
  confirm.className = "reset-confirm";
  confirm.setAttribute("role", "group");
  confirm.setAttribute("aria-labelledby", "reset-question");
  confirm.hidden = true;
  confirm.innerHTML =
    `<p class="reset-confirm__question" id="reset-question">${esc(R.question)}</p>` +
    '<div class="reset-confirm__actions">' +
    `<button type="button" class="btn btn--secondary btn--small" data-answer="yes">${esc(R.yes)}</button>` +
    `<button type="button" class="btn btn--secondary btn--small" data-answer="no">${esc(R.no)}</button>` +
    "</div>";
  slot.append(link, confirm);

  const yes = /** @type {HTMLButtonElement} */ (confirm.querySelector('[data-answer="yes"]'));
  const no = /** @type {HTMLButtonElement} */ (confirm.querySelector('[data-answer="no"]'));

  let timer = 0;

  /** Back to the link; focus follows only if it was inside the confirmation. */
  const close = (moveFocus = confirm.contains(document.activeElement)) => {
    clearTimeout(timer);
    confirm.hidden = true;
    link.hidden = false;
    if (moveFocus) link.focus();
  };

  link.addEventListener("click", () => {
    link.hidden = true;
    confirm.hidden = false;
    no.focus();
    clearTimeout(timer);
    timer = window.setTimeout(() => close(), CONFIRM_WINDOW);
  });

  no.addEventListener("click", () => close(true));
  yes.addEventListener("click", () => {
    close(true);
    onReset();
  });
  confirm.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    }
  });
}
