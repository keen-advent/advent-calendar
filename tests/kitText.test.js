// Run: npm test
// The clipboard text must match what the prototype produced for the same card.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";
import { buildKitText } from "../site/src/lib/kitText.js";

const PROTOTYPE = new URL("../Gentle December — сайт/index.html", import.meta.url);

/** Runs the prototype's own copy-text expression for a given card. */
function prototypeText(card) {
  const html = readFileSync(PROTOTYPE, "utf8");
  const data = html.slice(html.indexOf("const ROWS="), html.indexOf("const LINES="));
  const line = html.split("\n").find((l) => l.trimStart().startsWith('const txt="Мій набір опори'));
  return vm.runInNewContext(`${data}\nconst card=${JSON.stringify(card)};\nconst v=k=>card[k]||"…";\n${line}\ntxt`);
}

const cards = {
  empty: {},
  partial: { c0a: "STOP", c0b: "пауза 1 хв", c2c: "розмова з керівником", e1: "Оля" },
  full: Object.fromEntries([
    ...[0, 1, 2, 3, 4].flatMap((i) => [[`c${i}a`, `інструмент ${i}`], [`c${i}b`, `швидко ${i}`], [`c${i}c`, `далі ${i}`]]),
    ["e0", "думскролінг"], ["e1", "сестра"], ["e2", "два тижні поспіль погано сплю"],
  ]),
};

for (const [name, card] of Object.entries(cards)) {
  test(`kit text matches the prototype (${name} card)`, { skip: !existsSync(PROTOTYPE) && "prototype not found" }, () => {
    assert.equal(buildKitText(card), prototypeText(card));
  });
}

test("every card field has a placeholder example, and none leak into the copied text", async () => {
  const { KIT_PLACEHOLDERS, KIT_ROWS, KIT_EXTRA } = await import("../site/src/data/supportKit.js");
  const { kitKey } = await import("../site/src/lib/kitText.js");
  const keys = [
    ...KIT_ROWS.flatMap((_, i) => [kitKey.tool(i), kitKey.quick(i), kitKey.fallback(i)]),
    ...KIT_EXTRA.map((_, i) => kitKey.extra(i)),
  ];
  assert.deepEqual(Object.keys(KIT_PLACEHOLDERS).sort(), [...keys].sort());
  const text = buildKitText({});
  for (const p of Object.values(KIT_PLACEHOLDERS)) assert.ok(!text.includes(p), `placeholder copied: ${p}`);
});
