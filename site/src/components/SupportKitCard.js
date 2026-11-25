// Day-25 "Мій набір опори" card (prototype state, restyled with Figma tokens).
// Every field saves on input to this browser only; "Скопіювати картку" puts a
// plain-text version on the clipboard.
import { KIT_ROWS, KIT_EXTRA } from "../data/supportKit.js";
import { COPY } from "../data/copy.js";
import { esc } from "../lib/dom.js";
import { buildKitText, kitKey } from "../lib/kitText.js";

const K = COPY.kit;

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
  const [hWhen, hTool, hQuick, hFallback] = K.headers;
  const input = (key, label) =>
    `<input class="kit__input" type="text" id="kit-${key}" data-key="${key}" aria-label="${esc(label)}" autocomplete="off">`;

  slot.innerHTML =
    '<div class="kit">' +
    // Explicit roles: the table is restyled with CSS grid, which can drop native table
    // semantics in some browsers.
    `<table class="data-table kit__table" role="table" aria-label="${esc(K.title)}">` +
    `<thead role="rowgroup"><tr role="row">${K.headers.map((h) => `<th scope="col" role="columnheader">${esc(h)}</th>`).join("")}</tr></thead>` +
    '<tbody role="rowgroup">' +
    KIT_ROWS.map(
      (r, i) =>
        '<tr role="row">' +
        `<th scope="row" role="rowheader">${esc(r.when)}</th>` +
        `<td role="cell" data-label="${esc(hTool)}">${input(kitKey.tool(i), K.fieldLabel(r.when, hTool))}</td>` +
        `<td role="cell" data-label="${esc(hQuick)}">${input(kitKey.quick(i), K.fieldLabel(r.when, hQuick))}</td>` +
        `<td role="cell" data-label="${esc(hFallback)}"><span class="kit__fallback">${esc(r.fallback)}</span>${input(kitKey.fallback(i), K.fieldLabel(r.when, hFallback))}</td>` +
        "</tr>",
    ).join("") +
    "</tbody></table>" +
    '<div class="kit__extra">' +
    KIT_EXTRA.map(
      (t, i) =>
        `<label class="kit__label" for="kit-${kitKey.extra(i)}">${esc(t)}</label>` +
        `<input class="kit__input" type="text" id="kit-${kitKey.extra(i)}" data-key="${kitKey.extra(i)}" autocomplete="off">`,
    ).join("") +
    "</div>" +
    `<p class="kit__note">${esc(K.note)}</p>` +
    `<button type="button" class="btn btn--secondary kit__copy">${esc(K.copy)}</button>` +
    "</div>";

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
