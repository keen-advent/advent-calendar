# Advent Calendar

A calendar of 25 small pauses for December 2026. A static page with no backend and no analytics. Progress and notes stay in the visitor's browser (`localStorage`), and the page works offline once it has been opened.

- **Design source:** Figma file `ecYmoiJVcLStVzUFuWuuEJ` (main screen 7:2, Day 6:16, hint 10:30, practice modal 13:94). Style rules are in `SKILL.md`.
- **Behavior source:** the prototype in `Gentle December — сайт/` and its published artifact.

## Run locally

Requires Node 18+. There are no dependencies to install.

```bash
npm run dev     # serves site/ at http://localhost:5178
npm test        # unit and consistency tests
```

ES modules don't load from `file://`, so open the site through the dev server, not by double-clicking `index.html`.

### Test dates without waiting

These only work as URL parameters. They have no UI, and nothing they do is saved.

| URL | Effect |
|---|---|
| `?date=2026-12-14` | Pretend it is that date (any `YYYY-MM-DD`) |
| `?preview` | Open every day |

Date rules: before 1 Dec 2026 every day is locked. From 1 to 25 Dec, days open by date and today has a red border. From 26 Dec, and in January and after, every day is open.

## Deploy

1. Upload the contents of `site/` to any static host that serves **https**. The service worker, which handles offline reloads, needs https.
2. That's all: there's no build step.

When you add, remove or rename a file in `site/`:
- update `PRECACHE` in `site/sw.js` (`npm test` fails if it's out of date);
- bump `VERSION` there, so returning visitors get a fresh cache.

## Structure

```
site/                 deployable files
  index.html          page skeleton and static copy
  sw.js               offline cache (network first, cache fallback)
  styles/             tokens.css (Figma values), then one file per area
  src/data/           practices, lights, methods, support kit, UI copy
  src/lib/            date logic, storage, focus trap, helpers
  src/components/     DayTile, DaysGrid, DayHint, ProgressMeter, HouseIllustration,
                      PaintIn, SnowBurst, PracticeModal, Timer, SupportKitCard, …
  assets/             illustration images and self-hosted fonts
tests/                node --test suites
tools/serve.mjs       dev server (can also serve the prototype for comparison)
docs/                 review material (e.g. the "ти" conversion table)
```

## Things that must not drift

- **Illustration geometry.** The window crop boxes (`src/data/lights.js`) and the overlay drawing (`src/components/houseOverlays.js`) are copied from the prototype unchanged. A test checks the overlay output against the prototype.
- **Voice.** All copy uses informal "ти". A test fails if formal "ви" forms appear.
- **Motion.** The paint-in and snow burst are skipped under `prefers-reduced-motion`, and all transitions are disabled there.
