# Identity MD tweets

A one-page static site that ranks the top posts about Identity MD. Dark green,
with Pepes armed with AI as the mascots. Built with Vite, React and TypeScript
and exported to `dist/` for static hosting.

## What it does

- Lists posts about Identity MD as ranked cards: author, text, date, likes,
  reposts, replies and topics.
- **Top** orders by likes plus twice the reposts; **Newest** orders by date.
- Topic chips filter the list; the search field matches post text, author name
  and handle. The empty state names the query and offers "Clear search".
- Each card has **Open post** (the post on X, new tab) and **Copy link**, which
  writes the post URL to the clipboard and announces the result in a toast.
- Eight posts show at first; **Show 6 more posts** reveals the rest.

## Where the posts come from

The list is not a live feed. Posts, counts and topics live in
`src/data/tweets.json` and the ranking is computed from that file at run time
in the browser; nothing is fetched. The committed file is a starter set written
for this build so the site is usable before the real posts are added. Replace
or extend its entries with the real posts you want ranked (each needs `id`,
`url`, `author` with a `pepe` variant of `visor`, `antenna`, `headset`, `chip`
or `core`, `text`, ISO `date`, `likes`, `reposts`, `replies`, `topics`), then
rebuild. The site says so in the list header and the footer.

## Install, preview and rebuild

Node 20 or newer.

```sh
npm install          # installs from package-lock.json
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
src/components/TweetCard.tsx  one post card
src/format.ts           Post type, ranking, filtering, number and date formats
src/data/tweets.json    the posts
src/styles.css          tokens and all styles
scripts/check-export.mjs  static checks on dist/
DESIGN.md               implemented tokens, type, components, responsive rules
artifacts/validation.md build, probe and interaction results with limitations
```

## Validation summary

Run on 13 October 2026 against the committed export. Full detail, commands and
limitations are in `artifacts/validation.md`.

| Check | Result |
| --- | --- |
| `npm run typecheck` (tsc 7.0.2) | passed, no errors |
| `npm run build` (vite 8.3.4) | passed; index.html 1.6 kB, CSS 9.0 kB, JS 235.5 kB |
| `node scripts/check-export.mjs` | passed, 18 references, all relative and present |
| design-critic probe `taste.mjs` at 320, 390, 1440 | 16 of 16 checks passed |
| Interaction run in Chromium (sort, filter, search, empty state, show more, copy, keyboard, reduced motion) | 29 of 31 passed |

The two failures in the interaction run are not site defects at the required
width: at 320 by 700 the first card starts on screen but its "Open post" button
is below it (the brief's first-screen requirement is at 390 wide, where it
passes), and WebKit could not launch because this machine lacks `libgtk-4` and
`libpangocairo`, so Safari behaviour was not checked.
