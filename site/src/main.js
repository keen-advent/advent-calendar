// Entry point: state, rendering and wiring between components.
import { COPY } from "./data/copy.js";
import { resolveContext, getPhase } from "./lib/calendar.js";
import { createProgressStore } from "./lib/storage.js";
import { byId } from "./lib/dom.js";
import { createHouseIllustration } from "./components/HouseIllustration.js";
import { createProgressMeter } from "./components/ProgressMeter.js";
import { createDaysGrid } from "./components/DaysGrid.js";
import { createResetLink } from "./components/ResetLink.js";
import { createMethodsTable } from "./components/MethodsTable.js";
import { createToast } from "./components/Toast.js";
import { createPracticeModal } from "./components/PracticeModal.js";
import { createSupportKitCard } from "./components/SupportKitCard.js";
import { prefersReducedMotion } from "./lib/motion.js";
import { createSequence, lightingSchedule } from "./lib/sequence.js";

const store = createProgressStore();
const state = {
  ctx: resolveContext({ search: location.search }),
  done: store.loadDone(),
  card: store.loadCard(),
};

const toast = createToast(byId("toast-root"));
const house = createHouseIllustration(byId("house-slot"));
const progress = createProgressMeter(byId("progress-slot"));
// Lighting moment after a completed day; any other action finishes it instantly.
const lighting = createSequence();
const modal = createPracticeModal(byId("modal-root"), {
  isDone: (day) => state.done.has(day),
  onComplete(day) {
    state.done.add(day);
    store.saveDone(state.done);
  },
  onClose({ day, completed }) {
    grid.focusDay(day, { preventScroll: completed });
    if (completed) playLighting(day);
  },
});
const kit = createSupportKitCard(modal.kitSlot, {
  getCard: () => state.card,
  onChange(key, value) {
    state.card[key] = value;
    store.saveCard(state.card);
  },
  notify: (message) => toast.show(message),
});
const grid = createDaysGrid(byId("days-slot"), {
  onSelect(day, available) {
    lighting.finish();
    if (!available) {
      toast.show(COPY.locked(day));
      return;
    }
    kit.fill(state.card);
    modal.open(day);
  },
});
createResetLink(byId("tools-slot"), {
  onReset() {
    lighting.finish();
    state.done = new Set();
    state.card = {};
    store.clearAll();
    kit.fill(state.card);
    render();
    toast.show(COPY.reset.done);
  },
});
createMethodsTable(byId("methods-slot"));

function render() {
  renderGrid();
  renderHouse();
  renderProgress();
}

function renderProgress() {
  const beforeLaunch = getPhase(state.ctx.today) === "before" && !state.ctx.preview;
  progress.render({ count: state.done.size, beforeLaunch });
}

function renderGrid() {
  grid.render({ done: state.done, ctx: state.ctx });
}

function renderHouse() {
  house.setLit(state.done);
}

/**
 * The reward after a day is completed (it is already saved): the modal has started
 * fading out; the house scrolls into view if needed, then the tile turns gold, the
 * light fades in with snow, and the meter grows with the new count announced once.
 * Under reduced motion everything appears at once.
 * @param {number} day
 */
function playLighting(day) {
  const steps = {
    tile: () => {
      renderGrid();
      grid.markJustLit(day);
    },
    light: () => {
      renderHouse();
      house.burst();
    },
    meter: () => {
      renderProgress();
      progress.announce();
    },
  };
  const box = house.element.getBoundingClientRect();
  // Scroll unless most of the house is on screen, so the new light is actually seen.
  const visible = Math.min(box.bottom, innerHeight) - Math.max(box.top, 0);
  const scroll = visible < box.height * 0.6;
  if (prefersReducedMotion()) {
    if (scroll) house.element.scrollIntoView({ behavior: "auto", block: "center" });
    Object.values(steps).forEach((fn) => fn());
    return;
  }
  const at = lightingSchedule({ scroll });
  lighting.run([
    ...(scroll ? [{ at: 0, fn: () => house.element.scrollIntoView({ behavior: "smooth", block: "center" }) }] : []),
    { at: at.tile, fn: steps.tile },
    { at: at.light, fn: steps.light },
    { at: at.meter, fn: steps.meter },
  ]);
}

render();
house.paintIn();

// Offline support: cache the page so it opens again without a connection.
// Service workers need https or localhost; elsewhere this is skipped silently.
if ("serviceWorker" in navigator && window.isSecureContext) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
