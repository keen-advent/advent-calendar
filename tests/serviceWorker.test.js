// Run: npm test
// The service worker must precache every file the site needs, or offline reloads break.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const site = fileURLToPath(new URL("../site/", import.meta.url));

function filesIn(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? filesIn(p) : [relative(site, p).split(sep).join("/")];
  });
}

function precacheList() {
  const src = readFileSync(join(site, "sw.js"), "utf8");
  const literal = src.match(/const PRECACHE = (\[[\s\S]*?\]);/)?.[1];
  assert.ok(literal, "PRECACHE list not found in sw.js");
  // Copy out of the vm realm so assertions compare plain arrays.
  return Array.from(vm.runInNewContext(literal));
}

test("service worker precaches every site file", () => {
  const listed = new Set(precacheList());
  const missing = filesIn(site).filter((f) => f !== "sw.js" && !listed.has(f));
  assert.deepEqual(missing, []);
});

test("service worker precache has no stale entries", () => {
  const present = new Set(filesIn(site));
  const stale = precacheList().filter((f) => f !== "./" && !present.has(f));
  assert.deepEqual(stale, []);
});
