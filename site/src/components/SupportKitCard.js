// Day-25 "Мій набір опори" card (Figma 50:219; input states 56:122).
// Every field saves on input to this browser only (same storage key and field keys as
// before); "Скопіювати картку" puts a plain-text version on the clipboard.
import { KIT_ROWS, KIT_EXTRA, KIT_PLACEHOLDERS } from "../data/supportKit.js";
import { COPY } from "../data/copy.js";
import { esc } from "../lib/dom.js";
import { buildKitText, kitKey } from "../lib/kitText.js";

const K = COPY.kit;

/** Native placeholder attribute for a field key (examples only; never saved or copied). */
const placeholder = (key) => (KIT_PLACEHOLDERS[key] ? ` placeholder="${esc(KIT_PLACEHOLDERS[key])}"` : "");

/** Clipboard API where available; falls back to a hidden textarea on plain http. */
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  (document.querySelector("dialog[open]") ?? document.body).appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("copy failed");
}

/**
 * @param {HTMLElement} slot
 * @param {{
 *   getCard: () => Record<string, string>,
 *   onChange: (key: string, value: string) => void,
 *   notify: (message: string) => void,
 * }} deps
 */
export function createSupportKitCard(slot, { getCard, onChange, notify }) {
  const [, hTool, hQuick, hFallback] = K.headers;

  /** One labeled field; its label is a real <label>, helper text is tied by aria-describedby. */
  const field = (key, label, helper) => {
    const id = `kit-${key}`;
    const helpId = helper ? `${id}-help` : "";
    return (
      '<div class="kit__field">' +
      `<label class="kit__field-label" for="${id}">${esc(label)}</label>` +
      `<input class="kit__input" type="text" id="${id}" data-key="${key}" autocomplete="off"${placeholder(key)}${helpId ? ` aria-describedby="${helpId}"` : ""}>` +
      (helper ? `<p class="kit__helper" id="${helpId}">${esc(helper)}</p>` : "") +
      "</div>"
    );
  };

  slot.innerHTML =
    '<section class="kit" aria-labelledby="kit-heading">' +
    // Card header (Figma 64:531); h3 under the dialog's h2 title.
    '<div class="kit__header">' +
    `<h3 class="kit__heading" id="kit-heading">${esc(K.heading)}</h3>` +
    `<p class="kit__subtitle">${esc(K.subtitle)}</p>` +
    "</div>" +
    // One block per situation (Figma 50:226 …): title, then three labeled fields in a row.
    KIT_ROWS.map(
      (r, i) =>
        `<div class="kit__row" role="group" aria-labelledby="kit-row-${i}">` +
        `<p class="kit__row-title" id="kit-row-${i}">${esc(r.when)}</p>` +
        '<div class="kit__fields">' +
        field(kitKey.tool(i), hTool) +
        field(kitKey.quick(i), hQuick) +
        field(kitKey.fallback(i), hFallback, r.fallback) +
        "</div></div>",
    ).join("") +
    '<div class="kit__extra">' +
    KIT_EXTRA.map(
      (t, i) =>
        '<div class="kit__extra-field">' +
        `<label class="kit__label" for="kit-${kitKey.extra(i)}">${esc(t)}</label>` +
        `<input class="kit__input" type="text" id="kit-${kitKey.extra(i)}" data-key="${kitKey.extra(i)}" autocomplete="off"${placeholder(kitKey.extra(i))}>` +
        "</div>",
    ).join("") +
    "</div>" +
    `<p class="kit__note">${esc(K.note)}</p>` +
    `<button type="button" class="btn btn--secondary kit__copy">${esc(K.copy)}</button>` +
    "</section>";

  const inputs = /** @type {HTMLInputElement[]} */ ([...slot.querySelectorAll(".kit__input")]);
  inputs.forEach((el) => el.addEventListener("input", () => onChange(/** @type {string} */ (el.dataset.key), el.value)));

  slot.querySelector(".kit__copy")?.addEventListener("click", async () => {
    try {
      await copyText(buildKitText(getCard()));
      notify(K.copied);
    } catch {
      notify(K.copyFailed);
    }
  });

  return {
    /** Puts saved values into the fields (on open and after a reset). */
    fill(/** @type {Record<string, string>} */ card) {
      inputs.forEach((el) => (el.value = card[/** @type {string} */ (el.dataset.key)] ?? ""));
    },
  };
}
