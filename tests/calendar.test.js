// Run: npm test
import test from "node:test";
import assert from "node:assert/strict";
import {
  parseDateParam, resolveContext, getPhase, todayDay, isAvailable, tileState, initialHintDay,
} from "../site/src/lib/calendar.js";

const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h);
const ctx = (date, preview = false) => ({ today: date, preview });
const openDays = (c) => Array.from({ length: 25 }, (_, i) => i + 1).filter((d) => isAvailable(d, c));

test("parseDateParam accepts valid dates and rejects the rest", () => {
  assert.deepEqual(parseDateParam("2026-12-14"), new Date(2026, 11, 14));
  for (const bad of ["2026-02-30", "2026-13-01", "2026-12-1", "14.12.2026", "", null, undefined]) {
    assert.equal(parseDateParam(bad), null, String(bad));
  }
});

test("resolveContext: ?date overrides the clock, ?preview opens all, junk is ignored", () => {
  const now = at(2026, 11, 25);
  assert.deepEqual(resolveContext({ now, search: "?date=2026-12-14" }).today, new Date(2026, 11, 14));
  assert.equal(resolveContext({ now, search: "?date=nonsense" }).today, now);
  assert.equal(resolveContext({ now, search: "?preview" }).preview, true);
  assert.equal(resolveContext({ now, search: "" }).preview, false);
});

test("phases follow December 2026", () => {
  assert.equal(getPhase(at(2026, 11, 30)), "before");
  assert.equal(getPhase(at(2025, 12, 10)), "before"); // a December in another year does not count
  assert.equal(getPhase(at(2026, 12, 1, 0)), "december");
  assert.equal(getPhase(at(2026, 12, 31, 23)), "december");
  assert.equal(getPhase(at(2027, 1, 1, 0)), "after");
  assert.equal(getPhase(at(2027, 6, 1)), "after");
});

test("before launch (30 Nov): everything locked, no today", () => {
  const c = ctx(at(2026, 11, 30));
  assert.deepEqual(openDays(c), []);
  assert.equal(todayDay(c), null);
  assert.equal(initialHintDay(c), 1);
});

test("launch day (1 Dec, just after midnight): only day 1 open and marked today", () => {
  const c = ctx(at(2026, 12, 1, 0));
  assert.deepEqual(openDays(c), [1]);
  assert.equal(todayDay(c), 1);
});

test("mid-December (14 Dec): days 1–14 open, 14 is today, 15+ locked", () => {
  const c = ctx(at(2026, 12, 14));
  assert.deepEqual(openDays(c), Array.from({ length: 14 }, (_, i) => i + 1));
  assert.equal(todayDay(c), 14);
  assert.equal(initialHintDay(c), 14);
  assert.deepEqual(tileState(15, { done: new Set(), ctx: c }), { status: "locked", isToday: false, isDoor: false });
});

test("25 Dec: all open, the door is today", () => {
  const c = ctx(at(2026, 12, 25));
  assert.equal(openDays(c).length, 25);
  assert.deepEqual(tileState(25, { done: new Set(), ctx: c }), { status: "open", isToday: true, isDoor: true });
});

test("26–31 Dec: all open, nothing marked today", () => {
  const c = ctx(at(2026, 12, 28));
  assert.equal(openDays(c).length, 25);
  assert.equal(todayDay(c), null);
  assert.equal(initialHintDay(c), 1);
});

test("January: all open, no today", () => {
  const c = ctx(at(2027, 1, 10));
  assert.equal(openDays(c).length, 25);
  assert.equal(todayDay(c), null);
});

test("?preview opens every day before launch but marks no today", () => {
  const c = ctx(at(2026, 11, 25), true);
  assert.equal(openDays(c).length, 25);
  assert.equal(todayDay(c), null);
});

test("tile states: lit wins over availability; today combines with lit; door flag on 25", () => {
  const c = ctx(at(2026, 12, 10));
  const done = new Set([1, 10, 20]);
  assert.deepEqual(tileState(1, { done, ctx: c }), { status: "lit", isToday: false, isDoor: false });
  assert.deepEqual(tileState(10, { done, ctx: c }), { status: "lit", isToday: true, isDoor: false });
  assert.deepEqual(tileState(9, { done, ctx: c }), { status: "open", isToday: false, isDoor: false });
  // Completed earlier (e.g. in preview) but not yet available by date: still shows as lit.
  assert.deepEqual(tileState(20, { done, ctx: c }), { status: "lit", isToday: false, isDoor: false });
  assert.deepEqual(tileState(25, { done: new Set([25]), ctx: c }), { status: "lit", isToday: false, isDoor: true });
  assert.deepEqual(tileState(25, { done: new Set(), ctx: c }), { status: "locked", isToday: false, isDoor: true });
});
