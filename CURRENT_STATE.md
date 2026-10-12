# Current State

**The single source of truth for what this project is right now** — what is active, what is retired, what is deferred, and what future agents must not rebuild. When this doc conflicts with any other doc in the repo, this doc wins. Read it first, before `PRD.md`, `architecture.md`, `skills.md`, `content/copy.md`, or `database.md`.

---

## 1. What the app is

**Museum of Tiny Wins** turns small, everyday personal achievements ("Drank water before coffee", "Replied to that scary email") into framed museum exhibits — full-bleed photographic cards with gilt borders and reverent, slightly theatrical curator commentary. It is a quiet, editorial, museum-like product, not a productivity tool, habit tracker, or dashboard.

## 2. Current phase: design-first / demo-first

The project is in a **visual/design-first phase**. Everything currently renders from local mock data and is aimed at locking down the look, feel, motion, and copy. There is no persistence.

- **Win Cards are the core product surface.** The single most important component (`mtw-app/components/WinCard.tsx`) — three variants (`hero` / `public` / `personal`) sharing one base component, plus the four size tiers (`sm`/`md`/`lg`/`xl`).
- **The landing page is being actively rebuilt.** The active implementation is `EditorialHero` + `WhatThisIsSection` (mounted in `mtw-app/app/(site)/page.tsx`).
- **The style guide (`/styleguide`) and reveal demo (`/reveal-demo`) are dev-only references**, kept to verify the design system and the Submit-Win reveal animation in isolation.
- **Auth is scaffolded but not enforced.** Supabase email/password + Google OAuth is wired (client + server clients, `AuthModal`, `/auth/callback`), but no route is actually protected yet.

## 3. Visual direction (current)

Quiet, editorial, museum-like, subtly theatrical. Muted sage/cream/parchment/ink with a single gilt accent. Fraunces (display serif) + Public Sans (body sans). Generous white space. 12px radius everywhere (load-bearing). Slow, restrained motion via Framer Motion only.

**Words over icons** is the standing UI rule (`design.md` §6): `MENU` / `CLOSE` / `BACK` / `NEXT` instead of icon glyphs. Allowed exceptions: password show/hide, functional spinners, third-party branding (Google).

## 4. What is active

- `mtw-app/` — the canonical app root (see §8).
- **WinCard** + **WinCardGrid** (salon-hung masonry wall — CSS grid row-spans plus column-level hang offsets) + the size-scale and `drawWinCardSize` utility.
- **Landing page** — `EditorialHero` + `WhatThisIsSection` (`components/landing/`).
- **Public Exhibition Hall** (`/exhibition`) and **Personal Museum** (`/museum`) — client-rendered against `MOCK_WINS`, sharing one collection-page layout family: `CollectionIntro` (two-part wall-label intro), `CategoryRail` (text-led category filter), and the `WinCardGrid` salon wall (`components/collection/`).
- **Submit Win Modal** (`components/SubmitWinModal.tsx`) — 3-step flow (Input → Generation → Reveal), placard generated client-side from the phrase pools in `content/copy.md` §7.
- **Auth scaffold** — `AuthModal`, `components/forms/*`, `lib/supabase/{client,server}.ts`, `/auth/callback`.
- **Design tokens** — `mtw-app/app/globals.css` `@theme` block (colors, fonts, radius, spacing, card-ratio tokens).

## 5. What is retired

- **The 5-act GSAP ScrollTrigger + Lenis cinematic landing narrative** (described in `PRD.md` View 1 and `content/copy.md` §2). Retired in favor of a static editorial hero; see `skills.md` B.6 for the history. **Do not rebuild it.**
- **Retired landing components** — `Hero`, `WhatThisIs`, `CollectionPreview`, `FinalCTA`, `ExhibitionPanel`, `SectionDivider`, `TravelingCard`, `Illustrations`. Moved to `archived/landing-components/`.
- **Magic-link / passwordless auth.** Removed; the direction is email/password + Google OAuth (`AuthModal.tsx` header note). **Do not reintroduce it.**
- **Accession number / `year` field** on the card footer. Replaced by a single `date` string rendering "PERMANENT COLLECTION . YYYY . MM . DD".

## 6. What is deferred (intentionally, not by omission)

These are **not** current-phase failures and **must not be built during visual work**. They are queued for a later backend phase:

- **No API routes** (`/api/wins`, `/api/exhibition`, `/api/report`, etc.) — by choice.
- **No database / Supabase schema / RLS** — by choice. `database.md` is a design artifact only.
- **No Turnstile CAPTCHA** — the modal shows a placeholder stub.
- **No protected museum flow** — `/museum` is not auth-guarded.
- **No SSR exhibition** — `/exhibition` is client-rendered mock data.
- **No placard generation service** (`lib/placard.ts`) — placards are generated client-side for now.
- **No rate limiting** (5 wins / 24h) — by choice.
- **No report flow**, **no test suites for unbuilt backend logic**.

Deferred backend checklist (for a later pass, in rough order): Supabase schema + migrations → RLS → server placard module (`lib/placard.ts`) → `/api/wins` (create + rate limit + Turnstile) → `/api/exhibition` (cursor-paginated, allowlisted columns) → `/api/wins/[id]` (exhibit/withdraw/delete) → `/api/report` → protect `/museum` → SSR exhibition → swap `MOCK_WINS` for real data.

## 7. What future agents must not rebuild

- The GSAP/Lenis cinematic narrative (retired, §5).
- Parallel/near-duplicate card components — use the single `WinCard` base component with variant props.
- A second set of card sizes or ratios outside `sm`/`md`/`lg`/`xl`.
- Magic-link auth.
- A second source of truth for copy — `content/copy.md` is canonical.
- A second "public/" assets location — `mtw-app/public/` is canonical.
- Icons where words are the established UI rule.

## 8. Canonical structure

| Concern | Canonical location |
|---|---|
| App root | `mtw-app/` (everything else at repo root is docs or archive) |
| Served assets | `mtw-app/public/` |
| Card background images | `mtw-app/public/card-background-images/card-bg-{1..27}.jpg` — **27 images** |
| Copy source of truth | `content/copy.md` (single canonical copy doc) |
| Background metadata / count | `mtw-app/lib/imageTaxonomy.ts` + `WinCard.tsx` `BG_METADATA` (27) |
| Size + grid logic | `mtw-app/lib/winCardSize.ts`, `drawWinCardSize.ts`, `pairBackground.ts` |
| Motion constants | `mtw-app/lib/motion.ts` |

Retired/duplicate material lives under `archived/` (see `archived/README.md`). Nothing in `archived/` is served, compiled, or type-checked.

## 9. Known ambiguities (documented, not resolved here)

- **Two size-assignment systems coexist**: `getWinCardSize` (deterministic, content-weight + id hash, from spec 01) and `drawWinCardSize` (random-at-creation from an eligible pool, from spec 02). The mock data and `SubmitWinModal` use `drawWinCardSize`; `getWinCardSize` is currently unused by runtime code. **Do not delete either** — resolve which is canonical in the backend phase.
- **Masonry gutters are intentionally asymmetric**: the vertical gutter (`G=28/36/40`) is looser than the horizontal `column-gap` (`20/24/28`), and the wall is left-aligned to the shared content rail. This is a deliberate salon-hang choice — vertical rhythm breathes more than horizontal — not a bug (see §4).
- **`getWinCardSize` / `XlBudget`** were only referenced by the style guide; the unused imports were removed but the utilities remain in `lib/winCardSize.ts`.

## 10. Left intentionally untouched (UI-affecting)

These were found but **not fixed** because a fix would alter the visible site or runtime behavior:

- WinCard text **line-clamp is not actually applied** (`TEXT_BUDGET` clamps are unused; text uses `overflow: hidden` only). Fixing changes card truncation rendering.
- `react-hooks/set-state-in-effect` lint errors in `AuthModal.tsx` and `WinDetailModal.tsx` (state sync refactors would touch behavior).
- WinCard headline quotation-mark handling (`&ldquo;…&rdquo;`) vs `content/copy.md` §7.1 (which says "no longer wrapped in quotes") — a copy-doc inconsistency, not resolved here.
- `mtw-app/README.md` is still the generic create-next-app boilerplate.
