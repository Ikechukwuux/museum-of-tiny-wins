# Prompt: Win Card Size Scale (Masonry / Exhibition Grid)



## Context

We are adding a **size scale** to the existing Win Card component so that Win Cards can be laid out in a Pinterest-style masonry grid on the Exhibition Hall and Personal Museum pages. This is a design-system change first, and it must be documented on the Design System / Style Guide page.

This task does **not** touch the landing page.

## Non-negotiable guardrails

- Do **not** modify the Design System / Style Guide page's existing sections. You may only **append** one new section to it.
- Do **not** change the Win Card's visual identity: full-bleed vanitas botanical image, gilt frame, adaptive light/dark scrim, and the deliberate distinction between the user's quoted words and the curator commentary all stay exactly as they are.
- Do **not** change the existing `hero`, `public`, and `personal` context variants' behaviour. Size is a **new, orthogonal axis** — `context` controls chrome and actions, `size` controls height only.
- 12px border radius remains a hard system rule at every size. It does **not** scale.
- Do not delete assets, do not refactor unrelated code, do not introduce a new animation system.
- No new dependencies. No JS masonry library. No client-side measurement.

---

## The core principle

**Width never varies. Only height varies.**

Every card in the grid occupies exactly one column of a fixed-width column module. Variation comes from a small, closed set of aspect ratios. This is what makes a masonry grid read as *curated* rather than *random* — like a salon hang where frames differ in height but the hanging line and matting are constant.

Three things must stay **visually constant across every size** so no card looks out of place:

1. Gilt frame stroke weight and inset — identical at every size (do not scale the frame with the card).
2. Corner radius — 12px, always.
3. Content padding — identical at every size.

Only these change with size: **card height**, **quote type size**, and **how many lines of text are allowed**.

---

## 1. The size scale

Add a `size` prop to the Win Card: `'sm' | 'md' | 'lg' | 'xl'`.

| Token | Museum name | Aspect ratio | Decimal | Role |
|---|---|---|---|---|
| `sm` | Vitrine | 1 : 1 | 1.000 | Short wins. Rhythm breaker. |
| `md` | Portrait | 3 : 4 | 0.750 | The default. Most common in the grid. |
| `lg` | Panel | 2 : 3 | 0.667 | Longer wins, or a bit of gravity. |
| `xl` | Pillar | 9 : 16 | 0.563 | Rare feature. Max one per ~12 cards. |

Four tiers only. Do not add a fifth, and do not invent in-between ratios — the steps are deliberately far enough apart (1.00 → 0.75 → 0.67 → 0.56) to read as distinct, and few enough to read as a system.

Implement the height with CSS `aspect-ratio` on the card's outer frame. Expose the ratios as design tokens:

```
--mtw-card-ratio-sm: 1 / 1;
--mtw-card-ratio-md: 3 / 4;
--mtw-card-ratio-lg: 2 / 3;
--mtw-card-ratio-xl: 9 / 16;
```

**Mobile override:** at the single-column breakpoint, clamp `lg` and `xl` down to `md` (3:4). A 9:16 card at full mobile width consumes an entire viewport and kills scroll momentum. The clamp is a layout-level rule, not a prop change.

---

## 2. Text must always fit — the text budget

Text is never allowed to overflow, and the card is never allowed to grow to accommodate text. Each size tier gets a fixed **text budget**: a type size and a hard line clamp. Column width is fixed, so measured line counts are reliable.

| Token | Quote size / line-height | Quote clamp | Curator commentary | Commentary clamp | Approx. safe quote length |
|---|---|---|---|---|---|
| `sm` | 18px / 1.25 | 2 lines | 13px / 1.45 | 1 line | ≤ 45 chars |
| `md` | 20px / 1.25 | 3 lines | 13px / 1.45 | 2 lines | ≤ 90 chars |
| `lg` | 22px / 1.22 | 4 lines | 14px / 1.45 | 2 lines | ≤ 150 chars |
| `xl` | 24px / 1.20 | 5 lines | 14px / 1.45 | 3 lines | ≤ 210 chars |

Rules:

- Quote stays Fraunces. Commentary and meta stay Public Sans. Meta line (exhibit no. / date) stays 11px uppercase with existing tracking, **one line at every size, never clamped away**.
- Clamp with `-webkit-line-clamp` (`display: -webkit-box`). Truncation ends in an ellipsis at a word boundary where the browser allows.
- **Never** shrink type below the tier's specified size to force a fit, and never auto-fit / auto-scale text. Clamping is the only overflow strategy.
- The full untruncated text always remains available on the exhibit detail view. Truncation is presentational only — never truncate stored data.
- The text block stays bottom-anchored. The scrim gradient's height scales with the text block, not with the card: measure it from the content box, so a `sm` card and an `xl` card have proportionally similar breathing room under the last line.
- If the quote is empty or the commentary is missing, the card must not collapse or leave a hole — the frame holds its ratio regardless.

---

## 3. Size assignment: content-driven, not random

Do **not** assign sizes randomly. Random sizing is exactly what makes masonry grids feel arbitrary, and it will truncate long wins in short cards.

Assign the tier from content weight, where `weight = quote.length + commentary.length`:

```
weight <= 60          -> 'sm'
weight <= 130         -> 'md'
weight <= 220         -> 'lg'
weight >  220         -> 'xl'
```

Then apply **deterministic jitter** so the grid does not become a boring length-sorted ladder:

- Derive a stable pseudo-random value from the win's `id` (a simple string hash — same input always gives the same output, so SSR and client agree and there is no hydration mismatch).
- Use it to bump the tier **up** one step (taller) for roughly 1 in 4 cards.
- **Never bump down.** Downward bumps would truncate text that previously fit. Taller is always safe.
- Cap `xl` at one card per twelve rendered; if the cap is exceeded, the extras render as `lg`.

Expose this as a pure utility, e.g. `getWinCardSize(win): WinCardSize`, unit-testable and importable by the style guide page.

Also allow an explicit `size` prop to override the computed value, for the style guide and for any curated placement.

---

## 4. The grid itself

Build a `WinCardGrid` (or `ExhibitionGrid`) component. Requirements:

- **Fixed column module, not fluid columns.** Define a column width per breakpoint and let `repeat(auto-fill, var(--mtw-col))` decide how many fit, with the container centered. A fixed column width is what makes the text budgets above provably correct.

  | Breakpoint | Column width | Gutter |
  |---|---|---|
  | < 640px | full width, 1 column | 16px |
  | ≥ 640px | 280px | 20px |
  | ≥ 1024px | 300px | 24px |
  | ≥ 1280px | 312px | 24px |

- **Masonry via CSS Grid row spans, computed from the ratio — no measurement.** Set `grid-auto-rows: 4px` and give each item `grid-row-end: span N`, where `N = round((columnWidth / ratio + gutter) / 4)`. Because both column width and aspect ratio are known constants, N is computable at render time on the server. Result: perfect masonry, zero layout shift, zero JS, correct DOM order.
- **Do not use CSS multi-column (`columns`).** It reorders content down each column instead of across, which breaks chronological reading order and keyboard tab order.
- DOM order must equal visual reading order (left→right, top→bottom). Grid semantics: `role="list"` on the container, `role="listitem"` on each card wrapper.
- Reuse the existing card entrance animation if one exists; otherwise a simple staggered fade/rise on first viewport entry, respecting `prefers-reduced-motion`. Do not build a new scroll system.
- Empty state and loading skeletons must use the same ratio tokens, so skeletons occupy the exact final footprint.

---

## 5. Imagery

- Images remain `object-cover` with a per-asset focal point (`object-position`), so a 1:1 crop and a 9:16 crop of the same vanitas still-life both stay compositionally sound.
- Source assets must be authored at **9:16 or taller** so every tier crops down without upscaling. If any current asset is shorter than 9:16, flag it in your summary rather than stretching it.
- The adaptive light/dark scrim logic is unchanged — it must still sample/adapt exactly as it does today, at every size.

---

## 6. Style Guide page (append a new section)

Append a section titled **"Win Card — Size Scale"**, below the existing Win Card section, matching the page's existing section structure, spacing, and tone. It must contain:

1. **The scale.** All four sizes rendered side by side, in ratio order, each labelled with its token, museum name, ratio, and pixel height at the current column width.
2. **The text budget table**, rendered as real content on the page (not an image).
3. **A live masonry demo** — 12–16 sample wins of deliberately varied length, run through the real `getWinCardSize` utility and the real grid component, so the demo proves the system rather than mimicking it.
4. **A truncation proof** — one card per tier fed intentionally overlong text, demonstrating the clamp holds and the frame never grows.
5. **Do / Don't.** At minimum: *Do* let content length drive size; *Don't* assign sizes randomly. *Do* keep frame weight, radius, and padding constant; *Don't* scale the frame with the card. *Don't* introduce ratios outside the four tokens.
6. **Tokens** listed in the same format the page already uses for colour and type tokens.

---

## Acceptance criteria

- [ ] Win Card accepts `size` and renders exactly four ratios; radius, frame weight, and padding are pixel-identical across all four.
- [ ] No text overflows, at any tier, at any breakpoint, with any input length. Verified with a 500-character quote.
- [ ] `getWinCardSize` is pure and deterministic — same win id and text always yields the same tier, server and client.
- [ ] Masonry renders with no layout shift and no JS measurement; Lighthouse CLS ≈ 0.
- [ ] DOM order matches visual reading order; tab order is sane.
- [ ] `lg`/`xl` clamp to `md` in the single-column mobile layout.
- [ ] Existing `hero` / `public` / `personal` contexts are visually unchanged where `size` is not passed (default: `md`).
- [ ] Style Guide page gains exactly one new appended section; nothing else on that page is altered.
- [ ] `prefers-reduced-motion` respected.

## Deliverable

Report back with: files changed, the final `size` prop API, the tier-assignment thresholds you shipped, and any asset that failed the 9:16 minimum. Do not proceed to wire this into the Exhibition Hall or Personal Museum pages yet — that is the next step, and I will confirm the scale first.
