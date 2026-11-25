// "Методи календаря простими словами": collapsed by default (Figma 7:90).
import { METHODS } from "../data/methods.js";
import { COPY } from "../data/copy.js";
import { esc } from "../lib/dom.js";

/** @param {HTMLElement} slot */
export function createMethodsTable(slot) {
  const [hName, hAbout, hDays] = COPY.methods.headers;
  slot.innerHTML =
    '<details class="methods">' +
    `<summary class="methods__summary">${esc(COPY.methods.summary)}</summary>` +
    // Explicit roles: on phones the rows are restyled as stacked blocks, which can drop
    // native table semantics in some browsers.
    '<table class="data-table data-table--stack methods__table" role="table">' +
    `<thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">${esc(hName)}</th><th scope="col" role="columnheader">${esc(hAbout)}</th><th scope="col" role="columnheader">${esc(hDays)}</th></tr></thead>` +
    '<tbody role="rowgroup">' +
    METHODS.map(
      (m) =>
        `<tr role="row"><td role="cell" data-label="${esc(hName)}">${esc(m.name)}</td>` +
        `<td role="cell" data-label="${esc(hAbout)}">${esc(m.about)}</td>` +
        `<td role="cell" data-label="${esc(hDays)}">${esc(m.days)}</td></tr>`,
    ).join("") +
    "</tbody></table></details>";
}
