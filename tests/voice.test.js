// Run: npm test
// All user-facing copy addresses the reader with informal "ти". This guards against
// formal "ви" forms coming back in practice texts or UI strings.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRACTICES } from "../site/src/data/practices.js";
import { METHODS } from "../site/src/data/methods.js";
import { COMPLETION_LINES } from "../site/src/data/completionLines.js";

const L = "[а-яіїєґʼ’А-ЯІЇЄҐ]";
// Pronouns, 2nd-person plural present tense and imperatives (-іть/-йте/-ьте/-те…).
const FORMAL = new RegExp(
  `(?<!${L})(ви|вас|вам|вами|ваш${L}*|${L}+(?:йте|ьте|йтеся|ьтеся|ітеся|ете|єте|ите|їте|етеся|єтеся|итеся)|${L}+[бвгджзклмнпрстфхцчшщ]те(?:ся)?|${L}+іть(?:ся)?)(?!${L})`,
  "gu",
);
// Words that match the patterns above but are not formal address.
const ALLOWED = new Set([
  "навіть", // "even"
  "поміть", "Поміть", // singular imperative of "помітити"
]);

function formalForms(text) {
  return [...text.matchAll(FORMAL)].map((m) => m[1]).filter((w) => !ALLOWED.has(w));
}

test("practice texts use informal ти", () => {
  const found = [];
  for (const p of PRACTICES) {
    for (const key of ["title", "idea", "steps", "example", "reflection", "small", "why"]) {
      for (const text of [].concat(p[key])) {
        for (const w of formalForms(text)) found.push(`day ${p.day} ${key}: ${w}`);
      }
    }
  }
  assert.deepEqual(found, []);
});

test("methods table and completion lines use informal ти", () => {
  const found = [...METHODS.map((m) => m.about), ...COMPLETION_LINES].flatMap(formalForms);
  assert.deepEqual(found, []);
});

test("page and UI copy use informal ти", () => {
  const files = ["../site/index.html", "../site/src/data/copy.js"];
  const found = files.flatMap((f) => formalForms(readFileSync(new URL(f, import.meta.url), "utf8")).map((w) => `${f}: ${w}`));
  assert.deepEqual(found, []);
});
