# Design: Identity MD tweets

Documents what `src/styles.css`, `src/App.tsx` and `src/components/*` implement
as of the final build. Values are taken from the source; rendered behaviour was
confirmed in Chromium at 320, 390 and 1440 wide (see `artifacts/validation.md`).

## Overview

A single page for people who want the most liked and reposted posts about
Identity MD without scrolling a timeline. The visual character is the brief's:
near-black green surfaces, one bright Pepe-green accent, and Pepe mascots with
AI armaments (visor, antenna, headset, circuit implant, hand-held core) drawn as
inline SVG. The page is a ranked list; everything else (a two-line hero, one
row of sort and search, one row of topic chips) exists to get the reader to the
first post on the first screen.

System-wide rules: one column capped at 46rem, one family, three weights, six
type sizes, spacing in 4px steps, borders for structure and no shadows on
cards. The compact hero with the mascot beside the headline is this page's
arrangement, not a rule for every future page.

## Colors

Defined once in `:root` of `src/styles.css`. Primitives are named by hue step
and never used in a component; components use the semantic tokens.

| Semantic token | Primitive | Value | Job |
| --- | --- | --- | --- |
| `--color-bg-page` | `--green-950` | `#07140d` | page background |
| `--color-bg-surface` | `--green-900` | `#0d2117` | cards, buttons, input, segmented control |
| `--color-bg-raised` | `--green-800` | `#143225` | hover fill, topic tags, avatar disc, toast |
| `--color-border` | `--green-700` | `#1f4a35` | card, button and input borders |
| `--color-text` | `--mint-50` | `#eef7f0` | primary text |
| `--color-text-secondary` | `--sage-300` | `#a6c9b3` | meta, labels, notes, footer |
| `--color-accent-solid` | `--green-400` | `#5ccb7c` | the one filled action per view, pressed chips, selection |
| `--color-accent-text` | `--green-300` | `#8fe3a8` | links, rank numbers, inline code |
| `--color-on-accent` | `--green-950` | `#07140d` | text on the accent fill |
| `--color-focus` | `--green-200` | `#c9f2d4` | 2px focus ring |

No status ramp exists; the only status message (the copy toast) uses the
neutral raised surface. The Pepe artwork uses fixed art colours inside
`src/components/Pepe.tsx` (`#3c9a5b` skin, `#1b4a2b` ink, `#2f7a47` lips,
`#8fe3a8` glow, `#0d2117` dark), so the mascot's glow matches the accent text.

Contrast, computed from the declared pairs and confirmed by the probe on the
rendered page (all measured text passed 4.5:1):

| Pair | Ratio |
| --- | --- |
| `#eef7f0` on `#0d2117` (body on card) | 15.39:1 |
| `#a6c9b3` on `#0d2117` (secondary on card) | 9.32:1 |
| `#a6c9b3` on `#143225` (secondary on raised) | 7.69:1 |
| `#8fe3a8` on `#0d2117` (accent text on card) | 11.00:1 |
| `#07140d` on `#5ccb7c` (text on accent fill) | 9.23:1 |

## Typography

One family: `--font-sans: system-ui, -apple-system, "Segoe UI", Roboto,
"Helvetica Neue", Arial, sans-serif`. No web font is bundled, so the rendered
face is the platform's. `--font-mono` (`ui-monospace` stack) is used only for
the one `<code>` element in the footer. Weights: 400 body, 600 labels, buttons,
author names and metric values, 700 headings, rank numbers and the wordmark.
Font smoothing is set once on `html`.

| Token | Size | Used for | Line height |
| --- | --- | --- | --- |
| `--text-xs` | 13px | handle and date, topic tags | 1.3 |
| `--text-sm` | 14px | search label, metrics, notes, footer, toast | 1.55 |
| `--text-md` | 16px | body, post text, buttons, chips, input, wordmark | 1.55 (buttons 1) |
| `--text-lg` | 20px | section heading (post count), rank number | 1.3 |
| `--text-xl` | 28px | `h1` under 40rem | 1.1, tracking -0.02em |
| `--text-2xl` | 40px | `h1` from 40rem | 1.1, tracking -0.02em |

Headings use `text-wrap: balance`; the hero line, post text and notes use
`text-wrap: pretty`. Post text and the hero line are capped at `--measure`
(42rem). Counts use `font-variant-numeric: tabular-nums`. The search input is
16px so iOS does not zoom. No uppercase transforms, no tracked labels.

## Layout

Header, `main` and footer share one column: `width: min(100% - 2 * var(--gutter),
var(--page-max))` with `--page-max: 46rem` and `--gutter` 16px, growing to 32px
from 40rem. Spacing tokens `--space-1` to `--space-8` are 4, 8, 12, 16, 24, 32,
48 and 64px. Within a group the gap is 8 or 12px; between groups 24px or more.

Breakpoints come from the content, all in `src/styles.css`:

- `max-width: 22.4rem` (under about 360px): the header wordmark hides; the
  mark and the "Search on X" link remain and the link to home keeps its
  `aria-label`.
- `min-width: 40rem` (640px): gutter grows, the `h1` steps to 40px, the hero
  mascot grows from 5.5rem to 9rem, the sort control and the search field share
  one row, and card padding grows from 16px to 24px.

Observed: no horizontal scroll at 320, 390 or 1440. At 390 by 844 the first
card and its "Open post" button are on the first screen. At 320 by 700 the
first card starts on screen and its button is below. Logical properties are
used throughout (`inset-inline`, `padding-inline`, `margin-inline-start`).

## Elevation and depth

Flat by design. Cards, buttons, chips and the input use a 1px `--color-border`
on a `--color-bg-surface` fill; none has a shadow. The one shadow in the system
is on the fixed toast (`0 8px 24px rgb(0 0 0 / 0.45)`), which has no border, so
it reads as the only floating layer. Avatars get a 1px white outline at 10%
opacity. Stacking: the skip link at `z-index: 2`, the toast at `3`.

## Shapes

`--radius-sm` 8px on buttons, segmented buttons, the input and the skip link;
`--radius-md` 14px on cards, the empty state and the toast; `--radius-pill` on
topic chips and tags; avatars are circles. The empty state uses a dashed border
to read as a placeholder rather than content.

## Components

All styles live in `src/styles.css`; markup in the files named.

- **Button** (`.btn`, `src/App.tsx`, `src/components/TweetCard.tsx`): 44px
  tall, 16px semibold. `.btn-solid` is the accent fill and is used once per
  card ("Open post") and once in the empty state ("Clear search");
  `.btn-quiet` is the bordered surface. Hover (pointer devices only) raises the
  fill; `:active` scales to 0.96; transitions name only `background-color,
  border-color, color, scale` at 150ms with `cubic-bezier(0.2, 0, 0, 1)`.
- **Segmented sort** (`.segment > .seg-btn`, `src/App.tsx`): two native
  buttons in a `role="group"` with `aria-pressed`; the pressed one takes the
  accent fill.
- **Topic chip** (`.chip`): 40px pill button with `aria-pressed`; "All topics"
  plus one chip per entry in `tweets.json`'s `topics`. Pressing an active chip
  clears it.
- **Search field** (`.search`): visible `<label>`, `type="search"`,
  placeholder as an example only.
- **Post card** (`src/components/TweetCard.tsx`, `.card`): `article` labelled
  by the author name; rank number, `Pepe` avatar, name, handle and `<time>`;
  post text; a `<dl>` of likes, reposts and replies with full numbers in
  `title`; topic tags; "Copy link" and "Open post" (external link with
  `rel="noopener noreferrer"`).
- **Pepe** (`src/components/Pepe.tsx`): `variant` of `visor | antenna |
  headset | chip | core`, `size` in px, optional `title` for an accessible
  name (decorative when omitted). `HeroPepe` combines visor, chip and core;
  its core pulses only under `prefers-reduced-motion: no-preference`.
- **Toast** (`.toast`, `src/App.tsx`): a stable `role="status"` live region
  that is always in the DOM, fixed to the bottom while it has text, with a
  "Dismiss" button. It never moves the list.
- **Empty state** (`.empty`): names the query or topic, one line of guidance,
  then "Clear search" and/or "Show all topics".
- **Skip link** (`.skip`): first focusable element, jumps to `#posts`.

Focus: every control relies on the global `:focus-visible` ring (2px solid
`--color-focus`, 2px offset). Forced-colors mode maps borders to `CanvasText`
and pressed states to `Highlight`.

## Do's and don'ts

- Start a new page from the same column (`.site-head`, `main`, `.site-foot`
  width rule) and the same header: mark and name at the leading edge, one
  utility link at the trailing edge.
- Use `.btn-solid` for exactly one action per view or per card; everything
  else is `.btn-quiet` or a plain link.
- Add colours as semantic tokens pointing at the existing ramp. Do not use a
  primitive in a component and do not add a second accent hue.
- Keep to the six `--text-*` sizes and the three weights. New headings step
  down the scale; no tracked caps labels above them.
- Keep borders and shadows apart: a bordered surface gets no shadow.
- Keep motion opt-in under `prefers-reduced-motion: no-preference` and name
  the transitioned properties.
- To add a page: copy the header and footer from `src/App.tsx`, put content in
  `<main>` inside the column, reuse `.card` for any list of items and `Pepe`
  for any avatar, and keep the product on the first screen at 390 wide.
