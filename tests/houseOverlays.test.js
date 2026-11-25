// Run: npm test
// Checks that the overlay builder produces exactly the prototype's SVG, and that every
// light in the day sequence has a matching window crop or SVG group.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";
import { buildOverlaySvg } from "../site/src/components/houseOverlays.js";
import { LIGHT_SEQUENCE, WINDOW_BOXES } from "../site/src/data/lights.js";

const PROTOTYPE = new URL("../Gentle December — сайт/index.html", import.meta.url);

test("overlay SVG is identical to the prototype's", { skip: !existsSync(PROTOTYPE) && "prototype not found" }, () => {
  const lines = readFileSync(PROTOTYPE, "utf8").split("\n");
  const start = lines.findIndex((l) => l.startsWith("let sd=5;"));
  const end = lines.findIndex((l) => l === '$("deco").innerHTML=s;');
  assert.ok(start > 0 && end > start, "overlay block not found in prototype");
  // Run the prototype's own code with a stub $ that captures what it writes.
  const captured = {};
  const $ = (id) => (captured[id] ??= {});
  vm.runInNewContext(lines.slice(start, end + 1).join("\n"), { $, Math });
  assert.equal(buildOverlaySvg(), captured.deco.innerHTML);
});

test("every day's light exists as a window crop or an SVG group", () => {
  const svg = buildOverlaySvg();
  for (const id of LIGHT_SEQUENCE) {
    const found = id in WINDOW_BOXES || svg.includes(`id="w-${id}"`);
    assert.ok(found, `light ${id} has no overlay`);
  }
});
