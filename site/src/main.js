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

const store = createProgressStore();
const state = {
  ctx: resolveContext({ search: location.search }),
  done: store.loadDone(),
  card: store.loadCard(),
};

const toast = createToast(byId("toast-root"));
const house = createHouseIllustration(byId("house-slot"));
const progress = createProgressMeter(byId("progress-slot"));
const modal = createPracticeModal(byId("modal-root"), {
  isDone: (day) => state.done.has(day),
  onComplete(day) {
    state.done.add(day);
    store.saveDone(state.done);
  },
  onClose({ day, completed }) {
    grid.focusDay(day, { preventScroll: completed });
    if (!completed) return;
    // The light switches on now, while the house is in view, followed by snow.
    render();
    house.burst();
    const box = house.element.getBoundingClientRect();
    if (box.bottom < 0 || box.top > innerHeight) {
      house.element.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    }
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
  const beforeLaunch = getPhase(state.ctx.today) === "before" && !state.ctx.preview;
  progress.render({ count: state.done.size, beforeLaunch });
  grid.render({ done: state.done, ctx: state.ctx });
  house.setLit(state.done);
}

render();
house.paintIn();

// Offline support: cache the page so it opens again without a connection.
// Service workers need https or localhost; elsewhere this is skipped silently.
if ("serviceWorker" in navigator && window.isSecureContext) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
