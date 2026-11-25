// Date logic: which days are open, which one is today, and how each tile looks.
// Pure functions only; the current date and URL are passed in so tests can fix them.
//
// Rules (December 2026, device local time):
//   before 1 Dec 2026  → every day locked
//   1–25 Dec           → days up to today are open; today is marked
//   26–31 Dec          → all open, nothing marked as today
//   from 1 Jan 2027    → all open
// Past days never lock again and are never "missed".
//
// Dev overrides (no UI, never saved):
//   ?date=YYYY-MM-DD   pretend it is that date
//   ?preview           open every day

export const CALENDAR_YEAR = 2026;
export const DAYS = 25;
const DECEMBER = 11; // JS months are 0-based

/**
 * Parses "YYYY-MM-DD" into a local-time Date at midnight. Returns null if invalid
 * (wrong format or an impossible date such as 2026-02-30).
 * @param {string | null | undefined} value
 * @returns {Date | null}
 */
export function parseDateParam(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  const date = new Date(y, mo, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo || date.getDate() !== d) return null;
  return date;
}

/**
 * @typedef {Object} CalendarContext
 * @property {Date} today
 * @property {boolean} preview  every day open (dev only)
 */

/**
 * Builds the context from the real clock and the page URL query.
 * @param {{ now?: Date, search?: string }} [input]
 * @returns {CalendarContext}
 */
export function resolveContext({ now = new Date(), search = "" } = {}) {
  const params = new URLSearchParams(search);
  return {
    today: parseDateParam(params.get("date")) ?? now,
    preview: params.has("preview"),
  };
}

/**
 * @param {Date} date
 * @returns {"before" | "december" | "after"}
 */
export function getPhase(date) {
  const y = date.getFullYear();
  if (y < CALENDAR_YEAR || (y === CALENDAR_YEAR && date.getMonth() < DECEMBER)) return "before";
  if (y === CALENDAR_YEAR && date.getMonth() === DECEMBER) return "december";
  return "after";
}

/**
 * The calendar day marked as "today" (1–25), or null outside 1–25 December 2026.
 * @param {CalendarContext} ctx
 * @returns {number | null}
 */
export function todayDay(ctx) {
  if (getPhase(ctx.today) !== "december") return null;
  const d = ctx.today.getDate();
  return d <= DAYS ? d : null;
}

/**
 * @param {number} day 1–25
 * @param {CalendarContext} ctx
 */
export function isAvailable(day, ctx) {
  if (ctx.preview) return true;
  const phase = getPhase(ctx.today);
  if (phase === "after") return true;
  if (phase === "before") return false;
  return day <= ctx.today.getDate();
}

/**
 * @typedef {Object} TileState
 * @property {"lit" | "open" | "locked"} status
 * @property {boolean} isToday  3px red border; combines with lit or open
 * @property {boolean} isDoor   day 25: adds the "двері" label
 */

/**
 * Visual state of one tile. A completed day stays lit even if the date logic would
 * lock it (e.g. a day completed in preview), so progress is never hidden.
 * @param {number} day 1–25
 * @param {{ done: Set<number>, ctx: CalendarContext }} input
 * @returns {TileState}
 */
export function tileState(day, { done, ctx }) {
  const status = done.has(day) ? "lit" : isAvailable(day, ctx) ? "open" : "locked";
  return { status, isToday: todayDay(ctx) === day, isDoor: day === DAYS };
}

/**
 * Day whose hint is shown first: today during 1–25 December, otherwise day 1.
 * @param {CalendarContext} ctx
 */
export function initialHintDay(ctx) {
  return todayDay(ctx) ?? 1;
}
