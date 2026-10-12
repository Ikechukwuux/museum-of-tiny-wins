# Prompt: Random Card Size at Creation + Uniform Masonry Grid



## Context

Win Cards already have a reveal animation that randomly picks a **card image** and a **tag** from pre-saved sets when a user creates a new win. We are adding a **third randomly-drawn attribute: card size**, chosen from the four existing tiers (`sm` / `md` / `lg` / `xl`).

The drawn size is **persisted with the win**, exactly like the image and the tag. It is decided once, at creation, and never recomputed.

Then we build the Exhibition Hall / Personal Museum masonry grid so that spacing is perfectly uniform and cards can never overlap.

## Non-negotiable guardrails

- Do **not** modify the Design System / Style Guide page's existing sections. Append only.
- Do **not** change the Win Card's visual identity: full-bleed vanitas image, gilt frame, adaptive scrim, and the separation of the user's quoted words from the curator commentary all stay as they are.
- Do **not** change the four ratios, the 12px radius, the frame stroke weight, or the content padding. Frame weight, radius and padding stay pixel-identical across all four sizes.
- Do **not** alter the reveal animation's choreography or timing. We are adding one value to what it draws, not redesigning it.
- No new dependencies. No JS masonry library. No client-side measurement. No new scroll/motion system.
- Do not delete assets or refactor unrelated code.

---

## Part 1 — Size is drawn at creation and persisted

### 1.1 Where it lives

Wherever the random **image** and **tag** are currently drawn for a new win, draw the **size** in the same place, in the same operation. One function, three values. Do not scatter this logic.

Persist it on the win record as `card_size`, alongside the existing image and tag fields:

- Type: string enum, one of `'sm' | 'md' | 'lg' | 'xl'`.
- Default `'md'`.
- Add a `CHECK` constraint restricting it to the four values.
- Add the column to the database schema doc so it is ready when Supabase is wired up. Since auth/Supabase is still deferred, add it to the current local/mock/seed data layer too, and backfill every existing seed win with a drawn size so the grid has realistic variety to render today.

### 1.2 It is immutable

Once drawn, `card_size` never changes — not on edit, not on donating a win to the public exhibition, not on withdrawing it. A win looks the same in the Personal Museum and the Exhibition Hall, on every visit, on every device. This is what makes the grid stable and hydration-safe.

### 1.3 The draw: random, but only from sizes the text actually fits

A purely uniform roll will eventually put a 200-character win into a 1:1 card and truncate it to nonsense. So the roll happens **inside an eligible pool**.

Each tier has a text capacity (from prompt 01's text budget):

| Tier | Ratio | Capacity (quote + commentary chars) |
|---|---|---|
| `sm` | 1 : 1 | ≤ 60 |
| `md` | 3 : 4 | ≤ 130 |
| `lg` | 2 : 3 | ≤ 220 |
| `xl` | 9 : 16 | ≤ 320 |

Algorithm:

1. Compute `weight = quote.length + commentary.length`.
2. Build the **eligible pool**: every tier whose capacity is `>= weight`. (A short win is eligible for all four. A long win is eligible only for `lg` and `xl`.)
3. If the pool is empty (text longer than `xl` capacity), use `xl` and let the clamp handle the tail.
4. Draw from the eligible pool using these **weights**, renormalised over whatever remains in the pool:

   | Tier | Weight |
   |---|---|
   | `sm` | 20 |
   | `md` | 40 |
   | `lg` | 30 |
   | `xl` | 10 |

   `md` is the spine of the grid; `xl` is a rare punctuation mark. An unweighted 25/25/25/25 roll produces a lumpy, top-heavy grid.

5. **Anti-run reroll:** if the drawn tier equals the size of the user's two most recently created wins, reroll once (once only). This quietly prevents visible streaks of identical cards without making the system deterministic.

Expose this as a pure function, e.g. `drawWinCardSize({ quote, commentary, recentSizes }): WinCardSize`, with the randomness injectable (accept an optional RNG parameter) so it can be unit-tested and so the Style Guide demo can produce a stable showcase.

### 1.4 The reveal animation

The size must be drawn **before the reveal animation begins**, in the same draw as image and tag.

- The modal reserves the final card footprint up front, so the gilt frame draws itself around the true final shape. The card must not resize, jump, or reflow mid-animation or when the animation completes.
- The frame-draw path length will differ per tier. Keep the **duration constant** across sizes — do not let a `xl` card take visibly longer to draw than a `sm` one. Adjust the path speed, not the timing.
- Timing, easing, and choreography otherwise unchanged.
- `prefers-reduced-motion` behaviour unchanged.

---

## Part 2 — The grid: uniform spacing, zero overlap

### 2.1 Fixed column module

Columns are a **fixed width per breakpoint**, not fluid. Fixed width is what makes the row-span math exact and the text budgets provable.

| Breakpoint | Column width `W` | Gutter `G` |
|---|---|---|
| < 640px | full width, 1 column | 16px |
| ≥ 640px | 280px | 20px |
| ≥ 1024px | 300px | 24px |
| ≥ 1280px | 312px | 24px |

Container: `display: grid; grid-template-columns: repeat(auto-fill, W); column-gap: G; justify-content: center;`

Gutters are identical horizontally and vertically at a given breakpoint. One value, both axes.

### 2.2 Exact row-span math — this is the anti-overlap guarantee

The common masonry approach (`grid-auto-rows: 4px; row-gap: G;` plus a rounded span) accumulates rounding error and eventually collides. Use exact integers instead:

```
grid-auto-rows: 1px;
row-gap: 0;
```

For each card:

```
H    = W * (h / w)          // card height, from the tier's aspect ratio
span = Math.round(H) + G    // the card's own height, plus exactly one gutter
```

Set `grid-row-end: span {span}`. The card element itself is `height: {H}px` (or `aspect-ratio` on the fixed width — same result) and sits at the top of its grid area; the leftover `G` pixels at the bottom **are** the vertical gutter.

Why this works: every item carries exactly one gutter, so vertical spacing is uniform by construction and no item can ever be short of the space it needs. There is no rounding drift because the span is an integer sum, not a division.

Apply `margin-bottom: -G` to the grid container to absorb the trailing gutter on the last row.

### 2.3 Precompute the spans

`W` and the four ratios are all constants, so `H` and `span` are constants too. Build a static lookup table — tier × breakpoint → span — and read from it. No runtime division, no measurement, no `useEffect`, no hydration mismatch, and the correct value is present in the server-rendered HTML.

```
// Illustrative shape — compute the real numbers and hard-code them.
// span = round(W * h/w) + G
SPANS = {
  sm: { sm640: ..., lg1024: ..., xl1280: ... },
  md: { ... },
  lg: { ... },
  xl: { ... },
}
```

Emit per-breakpoint spans via CSS custom properties inside media queries, or via generated utility classes — whichever fits the Tailwind v4 setup better. Do **not** switch spans with JS on resize.

### 2.4 Mobile

At the single-column breakpoint, clamp `lg` and `xl` to `md` (3:4) for rendering only. The stored `card_size` is unchanged — this is purely a layout-level clamp. A 9:16 card at full mobile width eats an entire viewport and kills scroll momentum.

### 2.5 Order, semantics, states

- DOM order must equal visual reading order, left→right then top→bottom. **Do not use CSS multi-column (`columns`)** — it flows content down each column and would scramble chronological order and tab order.
- `role="list"` on the container, `role="listitem"` on each card wrapper.
- Loading skeletons use the same span table, so a skeleton occupies the exact final footprint and the real card swaps in with zero shift.
- Empty state stays centered in the grid container and does not inherit a span.
- Reuse the existing card entrance animation; if none exists, a short staggered fade/rise on first viewport entry. Respect `prefers-reduced-motion`.
- Cards remain single-column-span always. No card ever spans two columns.

---

## Part 3 — Style Guide page (append only)

Append a subsection **"Win Card — Random Size Assignment"** under the existing size-scale section, matching the page's existing structure and tone:

1. **The distribution** — the four tiers with their weights (20 / 40 / 30 / 10), stated plainly.
2. **The eligible-pool rule** — the capacity table, and one worked example: a short win eligible for all four, a long win eligible only for `lg` / `xl`.
3. **A live grid demo** — 16–20 sample wins of varied length, run through the real `drawWinCardSize` and the real grid component. Include a "Reshuffle" button that redraws sizes client-side so the uniformity of spacing can be inspected across many random arrangements.
4. **A spacing proof** — a toggle that overlays the gutters (e.g. a translucent gilt tint on the grid gaps), demonstrating vertical and horizontal spacing are equal and that no card overlaps at any arrangement.
5. **The span table** — tier × breakpoint → computed height and span, as real on-page content.
6. **Do / Don't** — *Do* draw once at creation and persist; *Don't* recompute size on render (it would reshuffle the museum on every visit). *Do* keep gutters equal on both axes; *Don't* scale frame weight, radius, or padding with card size.

---

## Acceptance criteria

- [ ] `card_size` is drawn at creation in the same operation as image and tag, persisted, and never recomputed on read.
- [ ] Schema doc and seed/mock data updated; all existing seed wins backfilled with drawn sizes.
- [ ] `drawWinCardSize` is pure, accepts an injectable RNG, and is unit-tested — including that a 300-character win can never draw `sm` or `md`.
- [ ] Reshuffling the demo 50 times produces **no overlapping cards** and **visually identical gutters** at every breakpoint.
- [ ] Vertical gutter measures exactly equal to horizontal gutter at each breakpoint (verify in devtools).
- [ ] No layout shift: server HTML already contains the correct spans. Lighthouse CLS ≈ 0.
- [ ] No `useEffect`-based measurement or resize listener anywhere in the grid.
- [ ] DOM order matches reading order; tab order is sane.
- [ ] `lg`/`xl` render clamped to `md` on mobile while stored values stay untouched.
- [ ] Reveal animation reserves the final footprint; no resize or jump at completion; draw duration constant across tiers.
- [ ] Style Guide gains exactly one new appended subsection; nothing else on that page is altered.

## Deliverable

Report back with: files changed, the `card_size` field definition, the final computed span table, the `drawWinCardSize` signature, and a screenshot of the demo grid with the gutter overlay enabled. Do not wire this into the Exhibition Hall or Personal Museum yet — I will confirm the grid on the Style Guide first.
