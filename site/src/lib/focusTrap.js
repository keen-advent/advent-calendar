// Keeps Tab / Shift+Tab focus inside a container (the practice modal).
const FOCUSABLE = [
  "a[href]", "button:not([disabled])", "input:not([disabled])", "select:not([disabled])",
  "textarea:not([disabled])", "summary", '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Focusable elements that are actually visible. */
export function focusableIn(container) {
  return /** @type {HTMLElement[]} */ ([...container.querySelectorAll(FOCUSABLE)]).filter(
    (el) => !el.closest("[hidden]") && el.getClientRects().length > 0,
  );
}

/**
 * @param {HTMLElement} container
 * @returns {() => void} release function
 */
export function trapFocus(container) {
  /** @param {KeyboardEvent} e */
  const onKeydown = (e) => {
    if (e.key !== "Tab") return;
    const items = focusableIn(container);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !container.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !container.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  };
  container.addEventListener("keydown", onKeydown);
  return () => container.removeEventListener("keydown", onKeydown);
}
