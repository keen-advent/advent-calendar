// Service worker: lets the calendar open and reload without a connection once it
// has been visited. Strategy: network first (so a new deploy shows up immediately),
// falling back to the cache when offline. Every file is cached on install, so the
// whole page works offline even if some parts were never requested.
//
// When files are added or removed, update PRECACHE (tests/serviceWorker.test.js
// checks it lists every file in site/) and bump VERSION to drop the old cache.

const VERSION = "v7";
const CACHE = `advent-calendar-${VERSION}`;

const PRECACHE = [
  "./",
  "index.html",
  "styles/tokens.css",
  "styles/fonts.css",
  "styles/base.css",
  "styles/layout.css",
  "styles/house.css",
  "styles/days-panel.css",
  "styles/button.css",
  "styles/modal.css",
  "styles/kit.css",
  "styles/toast.css",
  "src/main.js",
  "src/data/completionLines.js",
  "src/data/copy.js",
  "src/data/lights.js",
  "src/data/methods.js",
  "src/data/practices.js",
  "src/data/supportKit.js",
  "src/lib/calendar.js",
  "src/lib/dom.js",
  "src/lib/focusTrap.js",
  "src/lib/kitText.js",
  "src/lib/motion.js",
  "src/lib/storage.js",
  "src/components/DayHint.js",
  "src/components/DayTile.js",
  "src/components/DaysGrid.js",
  "src/components/HouseIllustration.js",
  "src/components/MethodsTable.js",
  "src/components/PaintIn.js",
  "src/components/PracticeModal.js",
  "src/components/ProgressMeter.js",
  "src/components/ResetLink.js",
  "src/components/SnowBurst.js",
  "src/components/SupportKitCard.js",
  "src/components/Timer.js",
  "src/components/Toast.js",
  "src/components/houseOverlays.js",
  "assets/img/building-dark.webp",
  "assets/img/building-glow.webp",
  "assets/img/mho-portrait.webp",
  "assets/fonts/manrope-cyrillic.woff2",
  "assets/fonts/manrope-latin.woff2",
  "assets/fonts/montserrat-800-italic-cyrillic.woff2",
  "assets/fonts/montserrat-800-italic-latin.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((p) => new Request(p, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("advent-calendar-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch {
        // Offline. Pages may carry ?date / ?preview, so match them without the query.
        const cached =
          (await cache.match(request, { ignoreSearch: request.mode === "navigate" })) ??
          (request.mode === "navigate" ? await cache.match("index.html") : undefined);
        return cached ?? Response.error();
      }
    })(),
  );
});
