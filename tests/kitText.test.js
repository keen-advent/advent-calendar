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
