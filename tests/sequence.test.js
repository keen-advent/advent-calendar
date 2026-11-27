import test from "node:test";
import assert from "node:assert/strict";
import { createSequence, lightingSchedule, LIGHTING } from "../site/src/lib/sequence.js";

/** Manual clock: timers fire only when tick() moves time forward. */
function fakeTimers() {
  let now = 0;
  let next = 1;
  const queue = new Map();
  return {
    setTimer: (fn, ms) => (queue.set(next, { fn, at: now + ms }), next++),
    clearTimer: (id) => queue.delete(id),
    tick(ms) {
      now += ms;
      [...queue.entries()]
        .filter(([, t]) => t.at <= now)
        .sort((a, b) => a[1].at - b[1].at)
        .forEach(([id, t]) => (queue.delete(id), t.fn()));
    },
  };
}

test("steps run in order at their offsets", () => {
  const clock = fakeTimers();
  const seq = createSequence(clock);
  const log = [];
  seq.run([{ at: 300, fn: () => log.push("meter") }, { at: 0, fn: () => log.push("tile") }, { at: 100, fn: () => log.push("light") }]);
  clock.tick(0);
  assert.deepEqual(log, ["tile"]);
  clock.tick(100);
  assert.deepEqual(log, ["tile", "light"]);
  assert.equal(seq.running, true);
  clock.tick(200);
  assert.deepEqual(log, ["tile", "light", "meter"]);
  assert.equal(seq.running, false);
});

test("finish() runs the remaining steps immediately, once", () => {
  const clock = fakeTimers();
  const seq = createSequence(clock);
  const log = [];
  seq.run([{ at: 0, fn: () => log.push("a") }, { at: 500, fn: () => log.push("b") }, { at: 900, fn: () => log.push("c") }]);
  clock.tick(10);
  seq.finish();
  assert.deepEqual(log, ["a", "b", "c"]);
  clock.tick(2000); // cleared timers do not fire again
  assert.deepEqual(log, ["a", "b", "c"]);
  seq.finish(); // nothing left
  assert.deepEqual(log, ["a", "b", "c"]);
});

test("a new run finishes the previous sequence first", () => {
  const clock = fakeTimers();
  const seq = createSequence(clock);
  const log = [];
  seq.run([{ at: 400, fn: () => log.push("old") }]);
  seq.run([{ at: 0, fn: () => log.push("new") }]);
  assert.deepEqual(log, ["old"]);
  clock.tick(0);
  assert.deepEqual(log, ["old", "new"]);
});

test("lighting schedule: tile, then light, then meter; scroll delays all", () => {
  const near = lightingSchedule({ scroll: false });
  const far = lightingSchedule({ scroll: true });
  assert.ok(near.tile < near.light && near.light < near.meter);
  assert.equal(far.tile - near.tile, LIGHTING.scroll);
  assert.equal(far.meter - near.meter, LIGHTING.scroll);
  assert.ok(near.tile >= LIGHTING.modalFade); // starts after the modal has faded
});
