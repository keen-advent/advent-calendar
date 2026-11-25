// Progress and the day-25 card, kept only in this browser's localStorage.
// If storage is unavailable (private mode, blocked site data) everything still works
// for the current visit; nothing is saved.

export const KEYS = {
  done: "advent-calendar:v1:done",
  card: "advent-calendar:v1:card",
};

/** @returns {Storage | null} */
function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function read(storage, key) {
  try {
    const raw = storage?.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function write(storage, key, value) {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null} [storage]
 */
export function createProgressStore(storage = defaultStorage()) {
  return {
    /** Completed days as a Set of integers 1–25; ignores anything malformed. */
    loadDone() {
      const value = read(storage, KEYS.done);
      if (!Array.isArray(value)) return new Set();
      return new Set(value.filter((d) => Number.isInteger(d) && d >= 1 && d <= 25));
    },

    /** @param {Set<number>} done */
    saveDone(done) {
      return write(storage, KEYS.done, [...done].sort((a, b) => a - b));
    },

    /** Card fields as { [fieldKey]: string }; ignores non-string values. */
    loadCard() {
      const value = read(storage, KEYS.card);
      if (!value || typeof value !== "object" || Array.isArray(value)) return {};
      return Object.fromEntries(Object.entries(value).filter(([, v]) => typeof v === "string"));
    },

    /** @param {Record<string, string>} card */
    saveCard(card) {
      return write(storage, KEYS.card, card);
    },

    /** Two-step reset, final step: forget all lights and card notes. */
    clearAll() {
      try {
        storage?.removeItem(KEYS.done);
        storage?.removeItem(KEYS.card);
      } catch {
        /* nothing saved, nothing to clear */
      }
    },
  };
}
