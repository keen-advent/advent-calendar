// Run: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { createProgressStore, KEYS } from "../site/src/lib/storage.js";

/** Minimal in-memory Storage. */
function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    dump: () => Object.fromEntries(data),
  };
}

/** Storage that throws on every call, like Safari with site data blocked. */
const brokenStorage = {
  getItem() { throw new Error("SecurityError"); },
  setItem() { throw new Error("QuotaExceededError"); },
  removeItem() { throw new Error("SecurityError"); },
};

test("empty storage gives no progress and an empty card", () => {
  const s = createProgressStore(memoryStorage());
  assert.deepEqual(s.loadDone(), new Set());
  assert.deepEqual(s.loadCard(), {});
});

test("progress round-trips and is saved sorted", () => {
  const mem = memoryStorage();
  const s = createProgressStore(mem);
  assert.equal(s.saveDone(new Set([3, 1, 2])), true);
  assert.equal(mem.dump()[KEYS.done], "[1,2,3]");
  assert.deepEqual(s.loadDone(), new Set([1, 2, 3]));
});

test("malformed progress is ignored or filtered", () => {
  assert.deepEqual(createProgressStore(memoryStorage({ [KEYS.done]: "not json" })).loadDone(), new Set());
  assert.deepEqual(createProgressStore(memoryStorage({ [KEYS.done]: '{"a":1}' })).loadDone(), new Set());
  assert.deepEqual(
    createProgressStore(memoryStorage({ [KEYS.done]: '[1, 0, 26, 2.5, "3", 25, 25]' })).loadDone(),
    new Set([1, 25]),
  );
});

test("card round-trips; non-string fields are dropped", () => {
  const s = createProgressStore(memoryStorage({ [KEYS.card]: '{"c0a":"STOP","c0b":5,"e1":"Оля"}' }));
  assert.deepEqual(s.loadCard(), { c0a: "STOP", e1: "Оля" });
  s.saveCard({ c1a: "прогулянка" });
  assert.deepEqual(s.loadCard(), { c1a: "прогулянка" });
});

test("clearAll removes progress and card only", () => {
  const mem = memoryStorage({ [KEYS.done]: "[1]", [KEYS.card]: '{"a":"b"}', other: "keep" });
  createProgressStore(mem).clearAll();
  assert.deepEqual(mem.dump(), { other: "keep" });
});

test("unavailable or throwing storage never throws", () => {
  for (const storage of [null, brokenStorage]) {
    const s = createProgressStore(storage);
    assert.deepEqual(s.loadDone(), new Set());
    assert.deepEqual(s.loadCard(), {});
    assert.equal(s.saveDone(new Set([1])), false);
    assert.equal(s.saveCard({ a: "b" }), false);
    assert.doesNotThrow(() => s.clearAll());
  }
});
