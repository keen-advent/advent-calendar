// "Почати вправи спочатку" (Figma 7:77). Two-step: the first press asks for
// confirmation, the second within 5 seconds clears everything.
import { COPY } from "../data/copy.js";

const CONFIRM_WINDOW = 5000;

/**
 * @param {HTMLElement} slot
 * @param {{ onReset: () => void }} handlers
 */
export function createResetLink(slot, { onReset }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "text-link reset-link";
  button.textContent = COPY.reset.idle;
  slot.appendChild(button);

  let timer = 0;
  const disarm = () => {
    clearTimeout(timer);
    button.classList.remove("is-confirming");
    button.textContent = COPY.reset.idle;
  };

  button.addEventListener("click", () => {
    if (!button.classList.contains("is-confirming")) {
      button.classList.add("is-confirming");
      button.textContent = COPY.reset.confirm;
      clearTimeout(timer);
      timer = window.setTimeout(disarm, CONFIRM_WINDOW);
      return;
    }
    disarm();
    onReset();
  });
}
