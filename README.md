# Identity MD tweets

A one-page static site for ranking tweets about Identity MD. The current
14 entries are invented samples, clearly labelled above the list. Dark green,
with Pepes armed with AI as the mascots. Built with Vite, React and TypeScript
and exported to `dist/` for static hosting.

## What it does

- Lists sample tweets about Identity MD as ranked cards: author, text, date, likes,
  reposts, replies and topics.
- **Top** orders by likes plus twice the reposts; **Newest** orders by date.
- Topic chips filter the list; the search field matches tweet text, author name
  and handle. The empty state names the query and offers "Clear search".
- Each sample card has **Search on X** (the quoted phrase "Identity MD", new
  tab) and **Copy link**, which copies that search URL. A real `/status/` URL
  changes the link to **Open tweet** and the toast to describe the tweet. Copy
  failure also names the correct fallback action.
- Eight tweets show at first; **Show 6 more tweets** reveals the rest.

## Where the tweets come from

The list is not a live feed. Tweets, counts and topics live in
`src/data/tweets.json` and the ranking is computed from that file at run time
in the browser; nothing is fetched. The file contains invented tweets,
authors, dates and counts, not real tweets from X. No real tweet dataset or X
API access was supplied. The JSON `note` is rendered directly above the list.
Replace the sample entries with requester-supplied, verified tweets (each needs `id`,
`url`, `author` with a `pepe` variant of `visor`, `antenna`, `headset`, `chip`
or `core`, `text`, ISO `date`, `likes`, `reposts`, `replies`, `topics`), then
rebuild. Use each tweet's actual X `/status/` URL. Update the note, hero sample
label and share metadata only when the data genuinely changes; regenerate the
share image if its copy changes. Do not put API credentials into this static site.
Visitor-facing copy explains the sample data; these editing instructions stay here.

## Install, preview and rebuild

Node 22.12 or newer (validated with Node 24.21.0 and npm 11.19.0).

```sh
npm ci               # installs the exact package-lock.json
npm run dev          # Vite dev server with hot reload
npm run build        # production export to dist/ (relative asset URLs, base "./")
npm run preview      # serves dist/ locally
npm run typecheck    # tsc --noEmit
npm run check        # typecheck, build, then scripts/check-export.mjs
```

`scripts/check-export.mjs` reads `dist/index.html` and fails if any local asset
URL is absolute or missing, or if the title, favicon, description, og:title or
og:image tag is absent.

Commit `dist/` after every rebuild: the publisher serves the committed export
and does not rebuild. `node_modules/` stays out of Git.

## Project layout

```
index.html              entry, meta tags, favicon and share card links
public/                 favicon.svg, apple-touch-icon.png, og.png (copied as-is)
src/main.tsx            React root
src/App.tsx             page: header, hero, controls, list, toast, footer
src/components/Pepe.tsx Pepe avatar (five AI variants) and the hero mascot
src/components/TweetCard.tsx  one tweet card
src/format.ts           Post type, ranking, filtering, number and date formats
src/data/tweets.json    sample tweets and the visible provenance note
src/styles.css          tokens and all styles
scripts/check-export.mjs  static checks on dist/
scripts/check-interactions.mjs  browser checks against dist/ at a subpath
scripts/render-share.mjs re-exports public/og.png from the built hero
DESIGN.md               implemented tokens, type, components, responsive rules
artifacts/validation.md build, probe and interaction results with limitations
```

## Validation summary

Revision checks run on 13 October 2026 against the final export. Commands,
six-domain review coverage, source locations and limitations are recorded in
[artifacts/validation.md](artifacts/validation.md). Every reported finding has a
verdict in [.imd-responses.json](.imd-responses.json).

| Check | Result |
| --- | --- |
| `npm run typecheck` (TypeScript 7.0.2) | passed, no errors |
| `npm run build` (Vite 8.3.4) | passed; HTML 1.59 kB, CSS 8.88 kB, JS 235.45 kB |
| `node scripts/check-export.mjs` | passed, 18 references, relative assets present |
| Pinned `taste.mjs --out test/scratch/taste --offline` | 16/16 passed at 320, 390 and 1440 |
| `node scripts/check-interactions.mjs` in Chromium | 27/27 passed; 9 widths from 320 to 1440 |
| Axe WCAG 2.2 AA tagged scan | 30 rules passed; no violations or incomplete checks |

The first card's action fits fully on the initial 390×844 screen (bottom at
836.22px). There is no horizontal scroll at 360 or 375px. WebKit was attempted
but could not launch because the machine lacks system libraries including
`libgtk-4.so.1` and `libpangocairo-1.0.so.0`; Safari was not verified. X navigation
was intercepted to verify the destination without depending on X login or uptime.
Real X data is still required; the samples are not represented as real tweets.

For this restricted revision run, dependencies were installed in an isolated
copy under `/tmp/identity-md-revision-96ac05d0/build`, using the unchanged manifest
and lockfile. Source and public assets were copied there for `npm run check`,
then the resulting `dist/` was copied back. No repository `node_modules/` or
ignore-file change was needed.

### Re-run the browser checks

The production site has no Playwright runtime dependency. Install the optional
validation tools outside the repository:

```sh
npm install --prefix /tmp/identity-md-tools playwright @axe-core/playwright
PLAYWRIGHT_BROWSERS_PATH=/tmp/identity-md-browsers /tmp/identity-md-tools/node_modules/.bin/playwright install chromium webkit
IMD_PLAYWRIGHT=/tmp/identity-md-tools/node_modules/playwright/index.mjs IMD_AXE=/tmp/identity-md-tools/node_modules/@axe-core/playwright/dist/index.mjs PLAYWRIGHT_BROWSERS_PATH=/tmp/identity-md-browsers node scripts/check-interactions.mjs
```

The interaction script manages its own server and closes it afterwards. It saves
measurements and screenshots only under `test/scratch/`. WebKit needs its platform
libraries. Missing WebKit support is reported as a limitation, not as a passing test.

To re-export the share image, build and start `npm run preview`, then use the
same `IMD_PLAYWRIGHT` and `PLAYWRIGHT_BROWSERS_PATH` settings with
`node scripts/render-share.mjs http://localhost:4173/`. Build again to copy the
updated `public/og.png` into `dist/`. The script renders existing HTML/CSS/SVG;
it adds no runtime dependency.
