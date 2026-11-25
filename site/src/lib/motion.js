// Reduced-motion preference, read live so a change in system settings applies
// without a reload.
const query = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");

export const prefersReducedMotion = () => Boolean(query?.matches);
