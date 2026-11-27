// Timed steps that can be cut short. Used for the lighting moment after a day is
// completed: each step runs at its offset, and finish() runs every step that has not
// run yet, immediately and in order, so the screen jumps to its final state.

/** Lighting moment timings, in ms. */
export const LIGHTING = {
  modalFade: 150,  // practice modal fades out
  scroll: 600,     // smooth scroll to the house, only when it is out of view
  tile: 0,         // tile turns gold (350 ms CSS transition)
  light: 150,      // the house light fades in (1.2 s) with the snow burst
  meter: 450,      // meter grows (0.8 s) and the label updates, after the light has begun
};

/**
 * Offsets of the three steps after the modal starts closing.
 * @param {{ scroll: boolean }} options  whether the page scrolls to the house first
 */
export function lightingSchedule({ scroll }) {
  const start = LIGHTING.modalFade + (scroll ? LIGHTING.scroll : 0);
  return { tile: start + LIGHTING.tile, light: start + LIGHTING.light, meter: start + LIGHTING.meter };
}

/**
 * @param {{ setTimer?: (fn: () => void, ms: number) => unknown, clearTimer?: (id: any) => void }} [timers]
 */
export function createSequence({ setTimer = (fn, ms) => setTimeout(fn, ms), clearTimer = (id) => clearTimeout(id) } = {}) {
  /** @type {{ fn: () => void, at: number, id: unknown, done: boolean }[]} */
  let steps = [];

  const sequence = {
    /**
     * Starts a new sequence; one still running is finished first.
     * @param {{ at: number, fn: () => void }[]} list
     */
    run(list) {
      sequence.finish();
      steps = list
        .map((s) => ({ fn: s.fn, at: s.at, id: undefined, done: false }))
        .sort((a, b) => a.at - b.at);
      for (const step of steps) {
        step.id = setTimer(() => {
          if (step.done) return;
          step.done = true;
          step.fn();
        }, step.at);
      }
    },

    /** Runs every remaining step now, in order. */
    finish() {
      const remaining = steps.filter((s) => !s.done);
      steps = [];
      for (const step of remaining) {
        clearTimer(step.id);
        step.done = true;
        step.fn();
      }
    },

    get running() {
      return steps.some((s) => !s.done);
    },
  };
  return sequence;
}
