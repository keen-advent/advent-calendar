// Plain-text version of the day-25 card for the clipboard. Same format as the prototype.
import { KIT_ROWS, KIT_EXTRA } from "../data/supportKit.js";
import { COPY } from "../data/copy.js";

/** Field keys, kept from the prototype: c{row}a/b/c for table cells, e{i} for extras. */
export const kitKey = {
  tool: (i) => `c${i}a`,
  quick: (i) => `c${i}b`,
  fallback: (i) => `c${i}c`,
  extra: (i) => `e${i}`,
};

/** @param {Record<string, string>} card */
export function buildKitText(card) {
  const v = (k) => card[k] || "…";
  const rows = KIT_ROWS.map(
    (r, i) =>
      `${r.when}: ${v(kitKey.tool(i))} · 1–3 хв: ${v(kitKey.quick(i))} · якщо не допомагає: ${r.fallback} ${card[kitKey.fallback(i)] || ""}`,
  );
  const extras = KIT_EXTRA.map((t, i) => `${t} ${card[kitKey.extra(i)] || ""}`);
  return `${COPY.kit.title}\n\n${rows.join("\n")}\n\n${extras.join("\n")}`;
}
