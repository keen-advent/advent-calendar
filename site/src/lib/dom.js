// Tiny DOM helpers.

/** Escapes text for use inside HTML markup and attributes. */
export const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** @param {string} id */
export const byId = (id) => /** @type {HTMLElement} */ (document.getElementById(id));
