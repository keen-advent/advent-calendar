// Short status message at the bottom of the screen (prototype state, restyled).
// An open modal <dialog> sits in the browser's top layer and would cover the toast,
// so while one is open the toast is moved inside it.
const VISIBLE_FOR = 3200;

/** @param {HTMLElement} root */
export function createToast(root) {
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.hidden = true;
  root.appendChild(el);
  let timer = 0;

  return {
    /** @param {string} message */
    show(message) {
      const host = document.querySelector("dialog[open]") ?? root;
      if (el.parentElement !== host) host.appendChild(el);
      el.textContent = message;
      el.hidden = false;
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        el.hidden = true;
        if (el.parentElement !== root) root.appendChild(el);
      }, VISIBLE_FOR);
    },
  };
}
