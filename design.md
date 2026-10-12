# Design System Reference
## Project: Museum of Tiny Wins

> **Status: current for tokens/components; motion tooling partially retired.** See `CURRENT_STATE.md`. The color/type/spacing/radius tokens and the gilt-frame + "words over icons" rules are active and load-bearing. §7's "GSAP ScrollTrigger + Lenis" landing macro-scroll is **retired** — Framer Motion is the sole active animation tool.

This document is the single source of truth for all visual design decisions — color, typography, spacing, radius, motion principles, and the signature gilt-border treatment. All components and pages must be built against the tokens defined here; per-component style decisions that deviate from this spec should be flagged and reconciled, not quietly made.

Read alongside `architecture.md` (stack, Tailwind integration), `content/copy.md` (voice, specimen text), `agents.md` (Design & Motion Agent responsibilities), and `skills.md` (animation approach).

---

## 1. Color Tokens

Six tokens. The palette is deliberately quiet — high atmosphere, low saturation — so the gilt accent reads clearly every time it appears.

| Token name      | CSS Variable         | Hex       | Tailwind class       | Role |
|---|---|---|---|---|
| `cream`         | `--color-cream`      | `#FDFBF0` | `bg-cream` / `text-cream`       | Page background. The outermost layer — everything sits on top of this. |
| `parchment`     | `--color-parchment`  | `#F1EBDC` | `bg-parchment` / `text-parchment` | Card / surface background. One step warmer than cream so cards read as objects *sitting on* the page, not flat blocks inlaid into it. |
| `sage`          | `--color-sage`       | `#7C9473` | `bg-sage` / `text-sage`         | Primary accent. Buttons, links, active states, hover fills. The palette's one mid-tone anchor. |
| `sky`           | `--color-sky`        | `#C9D9E8` | `bg-sky` / `text-sky`           | Atmospheric gradient accent. Used sparingly for page-section backgrounds and glows — **never** as a solid fill on text-bearing elements; it lacks sufficient contrast for body text at any size. |
| `ink`           | `--color-ink`        | `#2B2823` | `bg-ink` / `text-ink`           | All body text. Warm near-black — never pure `#000`, which reads as harsh against cream. Headings, labels, placards. |
| `gilt`          | `--color-gilt`       | `#B8934A` | `bg-gilt` / `text-gilt`         | Signature accent. Frame edges, CTA border detail, accession-stamp motif. **The one bold color in the system** — everything else stays quiet around it. Use sparingly so it retains visual weight. |

### Usage Rules

- **Never use `sky` as a text color or button fill** — insufficient contrast ratio at all standard text sizes.
- **`gilt` is reserved for borders/outlines and the occasional icon/stamp** — do not use it as a full fill on interactive elements; it doesn't have enough value contrast with `cream` to carry body text legibly.
- **Background layering order:** `cream` (page) → `sky` (atmospheric section wash, optional) → `parchment` (card surface). `ink` text lives on `parchment` or `cream` — never on `sky`.
- The whole system should feel like a sun-faded catalogue print. Avoid vivid saturation boosts.

---

## 2. Typography

### 2.1 Typefaces

| Role                  | Family       | Source           | Loading method |
|---|---|---|---|
| **Display serif**     | Fraunces     | Google Fonts     | `next/font/google` with `axes: ['opsz']` for optical sizing |
| **Body sans**         | Public Sans  | Google Fonts     | `next/font/google` |

**Fraunces** — a variable serif designed for display use. Loaded with optical-size axis (`opsz`) enabled so large display headings feel properly letterpress-heavy and small body uses of the face (if any) auto-lighten. Used for:
- App name / hero headline (Act 0)
- Win card placard headline (the user's raw input displayed as artifact title)
- Win card plaque body text (the generated museum description)

**Public Sans** — a neutral, slightly condensed sans-serif built for legibility. Used for:
- All body copy, UI labels, form inputs, button text
- Label/utility variant (see §2.3)

### 2.2 Loading (next/font)

Both fonts are loaded in `app/layout.tsx` via `next/font/google` and exposed as CSS custom properties on `<html>`:

```
--font-display: 'Fraunces Variable', serif;
--font-body:    'Public Sans', sans-serif;
```

Tailwind references these via `fontFamily` theme extension:
- `font-display` → `var(--font-display)`
- `font-body`    → `var(--font-body)`

Never import fonts via `<link>` tags or `@import` in CSS — `next/font` handles preloading and eliminates layout shift.

### 2.3 Type Scale

Four named steps. All sizes are in `rem`; leading and tracking values given as descriptive targets — set in Tailwind theme or inline as needed.

| Step | Tailwind class | Size | Weight | Family | Letter-spacing | Line-height | Usage |
|---|---|---|---|---|---|---|---|
| `display` | `text-display` | 4rem (64px) | 400–600 (variable) | Fraunces (opsz auto) | Default | 1.05 | Act 0 hero headline; app name lockup |
| `heading-2` | `text-heading-2` | 1.5rem (24px) | 600 | Fraunces | Default | 1.25 | Win card placard headline; modal title; section headings |
| `body` | `text-body` | 1rem (16px) | 400 | Public Sans | Default | 1.65 | All body copy, placard body, form copy |
| `label` | `text-label` | 0.6875rem (11px) | 500–600 | Public Sans | `0.08em` | 1.4 | **Small-caps, uppercase.** Category tags, accession numbers, wing labels — the "engraved plate" voice. Never used for general UI labels. |

### 2.4 Label / Utility Variant (Engraved Plate)

The `label` scale is not simply small text — it is a distinct presentational register:
- `font-variant: small-caps` OR explicitly uppercased (`text-transform: uppercase`) with `letter-spacing: 0.08em`
- Rendered in Public Sans at ~11px
- Used *only* for: category tags, accession numbers (`ACCESSION NO. 000001`), wing labels (`THE GRAND EXHIBITION — WING I`)
- Must read as "a physical stamp or engraved plate," distinct from any functional UI label (nav links, button text, form labels)

In practice: create a `<Label />` component (or Tailwind `label` variant) that encapsulates this treatment rather than re-applying it ad hoc.

---

## 3. Spacing Scale

The spacing philosophy is **generous by default** — white space is not wasted space, it is atmosphere. A tight, dense layout defeats the museum-gallery feel at the component level before any animation runs.

Named steps map to Tailwind spacing units. The scale below is wider than a typical SaaS scale:

| Step name | Tailwind unit | px equivalent | Use case |
|---|---|---|---|
| `xs`   | `2`  | 8px   | Tight inline gaps (icon-to-text, tag padding) |
| `sm`   | `4`  | 16px  | Component internal padding (button, tag) |
| `md`   | `8`  | 32px  | Card internal padding; form field gap |
| `lg`   | `12` | 48px  | Between card and sibling card (grid gap) |
| `xl`   | `16` | 64px  | Section padding (top/bottom within a page section) |
| `2xl`  | `24` | 96px  | Major section separation (between acts, between header and content) |
| `3xl`  | `32` | 128px | Full-page section vertical padding on desktop |

Default rule: when in doubt, go one step larger. Cards breathe; sections breathe more.

---

## 4. Border Radius

**12px. Everywhere. No exceptions.**

```css
--radius: 12px;
```

This is a **load-bearing constant**, not a stylistic preference. The Win Card reveal animation (`skills.md` B.2) uses this exact radius for the frame-draw-in motion — if individual components choose their own radii, the animation will mis-register against the actual component edges.

Applied to: Win Cards, the Submit Win Modal, all `<button>` elements, form `<input>` and `<textarea>`, image containers, and any overlay panel.

In Tailwind: set `rounded-xl` as the default, or define a custom `borderRadius.DEFAULT` of `12px` in config. Do **not** mix `rounded-lg` (8px) and `rounded-xl` (12px) — pick one canonical value and never deviate.

---

## 5. Signature Element — The Gilt Border

The single most important recurring visual signature in the system.

### 5.1 Definition

A thin gilt-gold rule (`--color-gilt`, `#B8934A`) that traces the rounded-rect border of every **framed object** — Win Cards (all variants), the Submit Win Modal, and the primary CTA button.

Canonical implementation:

```css
/* Gilt border utility — add this class to any framed element */
.gilt-frame {
  border: 1px solid var(--color-gilt);
  border-radius: var(--radius); /* must match the 12px constant */
}
```

Or as a Tailwind compound:
```
border border-gilt rounded-xl
```

### 5.2 Usage Rules

- **Win Cards (all three variants):** always gilt-framed. The frame is not optional on any variant.
- **Submit Win Modal:** gilt-framed container. The reveal animation draws this frame in — see `skills.md` B.2.
- **Primary CTA button ("Enter the Museum", "Frame It"):** gilt border, `sage` background fill.
- **Secondary/ghost buttons:** no gilt border — plain `ink` text, `sage` hover.
- **Form inputs:** no gilt border — use a muted `parchment`/`ink` `1px` border to keep the gilt visually reserved for framed artifacts.
- **Never use gilt as a background fill, text color, or box-shadow glow.** Its power comes from restraint — the moment it's used decoratively everywhere, it loses its signature function.

### 5.3 Hover Treatment

On interactive framed elements (gallery cards, personal museum cards), the gilt border may intensify slightly on hover:

```css
.gilt-frame:hover {
  border-color: color-mix(in srgb, var(--color-gilt) 100%, white 10%);
  /* or simply: increase opacity from 0.7 → 1 on non-default states */
}
```

Keep hover treatment subtle — a brightness/opacity shift on the border only, not a color change or shadow expansion.

---

## 6. UI Language: Words over Icons

The product should feel editorial, calm, and literate — not app-like or dashboard-like. 
Unless an icon is absolutely functionally necessary, the interface should use **words instead of icons**. 

**Core Principles:**
- Prefer clear text labels, word-based controls, written actions, and explicit navigation language.
- Avoid standalone icons, icon-only buttons, decorative utility icons, and generic SaaS-style iconography.
- The interface should feel like it is spoken in words, not reduced to symbols.

**Examples:**
- `MENU` instead of a hamburger icon.
- `CLOSE` instead of an X icon.
- `BACK` instead of a left-arrow.
- `NEXT / PREVIOUS` instead of chevrons.
- `OPEN EXHIBIT` instead of an eye icon.

**Allowed Exceptions:**
- Input field adornments (e.g., password show/hide eye icon).
- Third-party/provider branding (e.g., Google logo on an auth button, though the words "Continue with Google" must remain primary).

---

## 7. Motion Principles

Defined briefly here; full implementation guidance is in `skills.md` §A.2 and §B.1–B.6.

| Principle | Rule |
|---|---|
| **Default motion tool** | Framer Motion — all components, modals, hover states, page transitions |
| **Landing page macro scroll** | GSAP ScrollTrigger + Lenis (desktop/tablet only) — scoped to `ScrollNarrative.tsx`, never leaks into other components |
| **Mobile scroll fallback** | Framer Motion `whileInView` sequential reveals — no GSAP mounted on mobile |
| **`prefers-reduced-motion`** | Must produce a genuinely different, static presentation — not sped-up or no-op'd animation. Reduced motion fallback is a design requirement, not an afterthought. |
| **Durations** | Soft and unhurried. Default transitions 300–500ms; the reveal animation (`skills.md` B.2) is a deliberate 800–1200ms sequence. |
| **Easing** | `ease-out` for entrances, `ease-in` for exits, custom cubic-bezier for the gilt frame-draw-in. |

---

## 8. Component Notes

These are early-stage constraints to preserve before components are built. Full specs belong in a future `components.md` once component design is finalized.

### 7.1 Win Card

Three variants (`hero`, `public`, `personal`) sharing one base component. All three:
- `parchment` background
- Gilt border (`border border-gilt rounded-xl`)
- `ink` text throughout
- Generous internal padding (`md` step: 32px)

Variant differences:
- `hero`: non-interactive, floating animation, slightly larger display size
- `public`: hover lift (Framer Motion `whileHover`), click-to-modal, anonymous (no user metadata displayed)
- `personal`: same hover lift, additional action affordance in detail modal

See `skills.md` B.1 for the full single-component, variant-props approach.

### 7.2 Submit Win Modal

- `parchment` background, `cream` overlay/backdrop
- Gilt-framed container (the border animates in during Step 3 reveal — this is the emotional centerpiece)
- Three internal steps (Input → Generation → Reveal) transition with Framer Motion layout animations
- Border radius: 12px (hard constant)

See `skills.md` B.2 for the full reveal sequence.

### 7.3 Buttons

| Variant | Background | Border | Text | Use case |
|---|---|---|---|---|
| Primary | `sage` | `1px gilt` | `cream` | "Frame It", "Enter the Museum", "Add Your Win" |
| Ghost | Transparent | `1px ink` (muted) | `ink` | "Frame Another", "Keep It", secondary actions |
| Danger | Transparent | `1px` muted red | Muted red | "Remove It" — use sparingly, keep muted not alarming |

All buttons: `rounded-xl` (12px), Public Sans, `sm` padding (16px vertical, 24px horizontal).

---

## 9. Tailwind Configuration Notes

_(Version to be confirmed at scaffold time — see §8.1)_

### 8.1 Installed Tailwind Version

**Tailwind v4** (`tailwindcss@^4`, `@tailwindcss/postcss@^4`) — installed by `create-next-app` (Next.js 16.2.10). Uses CSS-first configuration: no `tailwind.config.js`. All tokens are declared in `app/globals.css` via the `@theme inline { }` block. There is no `tailwind.config.ts` in this project. If you ever install a library expecting Tailwind v3 config conventions, check compatibility first.

### 8.2 Custom Tokens in Tailwind

Regardless of version, the following named utilities must be available:

**Colors:** `cream`, `parchment`, `sage`, `sky`, `ink`, `gilt`  
**Font families:** `display` (Fraunces), `body` (Public Sans)  
**Border radius:** `xl` = 12px (the system constant)  
**Custom utility:** `.gilt-frame` = `border border-gilt rounded-xl`

---

## 10. Open Items

- [ ] Finalize the Win Card frame-draw-in animation curve (cubic-bezier value) — to be tuned in isolation per `agents.md §4.1` before wiring into the full modal sequence.
- [ ] Decide whether the primary CTA button gilt border pulses subtly on first render (a one-shot attention cue) or is completely static. One-shot pulse would require a `@keyframes` animation; document the decision here once made.
- [ ] Confirm hover treatment for the gilt border: opacity shift only, or also a very slight `box-shadow` in gilt to add depth? Must not read as a glow effect — stay restrained.
- [ ] `design.md` references a `--radius` CSS custom property; confirm this is also threaded into the GSAP reveal's clip-path or border animation so there is only one source of truth for the 12px constant.
