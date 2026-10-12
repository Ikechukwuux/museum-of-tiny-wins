# Archived

This folder holds retired or non-canonical material that is kept for reference but is **not part of the active build**. Nothing here is imported, served, compiled, or type-checked. See `CURRENT_STATE.md` at the repo root for the current source of truth.

## What lives here

### `landing-components/`
Eight landing-page components from the retired cinematic scroll-narrative experiments (the GSAP ScrollTrigger + Lenis direction, abandoned per `skills.md` B.6). The active landing page uses `EditorialHero` + `WhatThisIsSection` only.

- `Hero.tsx` — references `/hero-background.jpeg`, which does not exist in `mtw-app/public/`.
- `WhatThisIs.tsx` — earlier, more elaborate "What This Is" layout (replaced by `WhatThisIsSection.tsx`).
- `CollectionPreview.tsx` — old gallery-wall preview section.
- `FinalCTA.tsx` — old "Final Exhibit" CTA section.
- `ExhibitionPanel.tsx` — CSS sticky stacking panel (scroll-narrative experiment).
- `SectionDivider.tsx` — gallery room divider (unused).
- `TravelingCard.tsx` — scroll-linked traveling card (scroll-narrative experiment).
- `Illustrations.tsx` — inlined SVG illustration components (unused).

These import from `@/components/...` and `@/lib/...`; those imports are intentionally not maintained. They are preserved purely as reference and must not be rebuilt.

### `legacy-public/`
A stale duplicate of the app's `public/` assets, left over from the create-next-app scaffold that originally lived at the repo root.

- `card-background-images/` — 26 images, **missing `card-bg-27.jpg`**. The canonical set is `mtw-app/public/card-background-images/` (27 images).
- `illustrations/` — 11 source SVG illustration files. Not referenced by any active code.

### `win-card-background-sources/`
The original source JPGs (`win card background N.jpg`) from which the canonical `card-bg-N.jpg` files were derived. Kept for re-export/re-crop if ever needed; not served by the app.

### `favicon-previews/`
Three design directions (`dir1`/`dir2`/`dir3`) of favicon preview PNGs from a favicon-generation pass. The chosen favicons already live in `mtw-app/public/`.

### `copy (3).md`, `copy updated.md`
Duplicate/older drafts of the copy reference. The canonical copy source of truth is `content/copy.md`.

### `refactor.js`
One-off migration script (accession number → date refactor). Obsolete; kept only for provenance.
