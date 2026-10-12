# Skills Reference
## Project: Museum of Tiny Wins

This document serves two purposes:

1. **Part A — Technical Capabilities Reference**: the tools, libraries, and techniques expected to be used (or considered) for this project, so agents know what's available and appropriate.
2. **Part B — Implementation Guidance for Tricky Parts**: project-specific "how to approach this" notes for the trickiest pieces of the build, where getting it right matters most for the overall feel.

This doc should be read alongside `agents.md` (rules of engagement) and `design.md` / `architecture.md` once those exist. Final stack choices belong in `architecture.md` — this doc focuses on *capabilities and techniques*, not final decisions.

---

## Part A — Technical Capabilities Reference

### A.1 Layout & Styling
- **Utility-first CSS (e.g. Tailwind CSS)** — recommended for rapidly implementing the spacing, color, and typography system defined in `design.md`, while keeping styles consistent across the three Win Card variants.
- **CSS Grid / Masonry layout** — required for the Public Exhibition Hall and Personal Museum grids. If a true masonry effect (variable card heights) is desired, consider a lightweight masonry utility or CSS-only masonry (`grid-template-rows: masonry` where supported, with a JS fallback) rather than a heavy layout library.
- **Custom fonts** — serif + sans-serif pairing should be loaded efficiently (e.g. via `next/font` or self-hosted font files) to avoid layout shift, which would undercut the "soft, breathing" feel.

### A.2 Animation & Motion
- **Framer Motion** — the app-wide default, for:
  - Floating animation on hero/example cards.
  - Hover lift + shadow deepening on gallery cards.
  - The multi-step modal transitions (Input → Generation → Reveal).
  - The Landing page's mobile scroll fallback (`whileInView` sequential reveals — see A.7 and skills.md B.6).
- **GSAP ScrollTrigger + Lenis + `@gsap/react`** — scoped specifically to the Landing page's pinned 5-act scroll narrative on desktop/tablet (see `architecture.md` §1 and `skills.md` B.6). Not used elsewhere in the app — keep this scope boundary explicit so GSAP doesn't creep into components Framer Motion already owns. All plugins (ScrollTrigger included) are free for commercial use — no Club GreenSock license required.
- **CSS transitions/keyframes** — sufficient for simpler effects (hover shadows, subtle scale). Reserve the animation libraries for sequenced/orchestrated moments like the reveal and the scroll narrative.

### A.3 Forms & Input Handling
- **Character-limited textarea with live counter** — straightforward controlled input; ensure the 300-character limit is enforced both visually (counter) and functionally (hard stop or prevent overflow).
- **Cloudflare Turnstile** — for invisible/minimal CAPTCHA on the Submit Win Modal. Requires:
  - A site key (frontend) and secret key (backend verification).
  - Server-side verification of the Turnstile token before processing a submission.

### A.4 Authentication
- **Minimal auth provider** (e.g. a managed auth service or lightweight email/password + session-based auth) — sufficient for:
  - Creating/accessing a Personal Museum.
  - Authorizing exhibit/withdraw/delete actions on a user's own wins.
- No need for OAuth/social logins, profile management, or username systems — keep this as lightweight as possible per the "no profiles" constraint.

### A.5 Data & Templating
- **Templated/randomized text generation** — a small content-templating system (likely plain JS/TS functions or a structured JSON of phrase fragments) that:
  - Selects from multiple "opener," "framing," and "closer" phrase variants.
  - Combines them with the user's submitted text to produce a unique placard description.
  - Should be deterministic enough to avoid awkward combinations (e.g. avoid grammar mismatches between fragment and user input).
- **Database/storage** — for persisting:
  - User accounts (minimal).
  - Personal win entries (linked to a user).
  - Public exhibition entries (anonymized, no user link exposed to the public read path).
  - Exhibit/withdraw state.
  - (Full schema to be defined in `database.md`.)

### A.6 Pagination
- **Manual pagination ("Load More")** — server-side or client-side fetching of additional batches of 12 items; avoid infinite scroll per PRD performance constraints.

### A.7 Responsive / Touch Considerations
- **Touch-friendly interactions** — hover-only patterns have been replaced with click-to-open detailed views (e.g. `WinDetailModal`), making actions natively touch-friendly without relying on hover hacks or tap-to-reveal mobile overrides.
- Detect touch vs. pointer capability via CSS media features (`@media (hover: hover)`) when needed for cosmetic enhancements (e.g., hiding/showing a subtle "click me" prompt).
- **Landing page scroll narrative — mobile is a different implementation, not a scaled-down one.** Pinned/scroll-jacked sections are unreliable on mobile browsers (address bar resize, momentum-scroll conflicts), so below the tablet breakpoint the same 5 acts render as sequential Framer Motion `whileInView` reveals instead of GSAP ScrollTrigger pins. Use `gsap.matchMedia()` (or an equivalent breakpoint check before mounting) to decide which implementation loads — never mount GSAP/Lenis at all on mobile, to keep that bundle light. See B.6 for full guidance.

---

## Part B — Implementation Guidance for Tricky Parts

### B.1 The Win Card Component (Three Variants)
The Win Card is the single most reused component in the app, appearing as:
- **Hero example card** (Landing page) — floating, decorative, completely non-interactive.
- **Public gallery card** (Exhibition Hall) — interactive (hover lift, click-to-open `WinDetailModal`), anonymous.
- **Personal museum card** (Personal Museum) — interactive (hover lift, click-to-open `WinDetailModal`), warmer frame styling.

**Guidance:**
- Build a **single base component** with variant props (`variant="hero" | "public" | "personal"`) rather than three separate components — this keeps the "framed artifact" visual language consistent while allowing styling/behavior differences.
- The Win Card is now fully presentational with zero interactive logic. All actions (report, exhibit, withdraw, remove) live in the `WinDetailModal`. The only interaction on the card itself is an `onClick` that triggers the modal. This enforces a clean separation of concerns.

**Card anatomy (revised — full-bleed image, not a separate panel):**
- Background image fills the entire card, rounded 12px, with a light overall blur pass (4–8px) — the source photography is already soft-focus botanical still life, so this unifies rather than muddies it.
- Gilt-gold rule traces the whole card border regardless of which image/family is behind it — the one constant signature element.
- A gradient scrim fades in at the bottom (and a lighter version at the top, just for the meta line) so text sits directly on the image rather than in a separate flat block underneath it. **The scrim's tone adapts per image** rather than being uniformly dark: lighter images fade to a soft parchment-cream at the bottom with dark ink text; moodier/darker images fade to ink-dark with cream text. Implement as a per-image `scrimTone: "light" | "dark"` flag alongside the background image lookup.
- **Top of card: category tag only**, full width, one line, left-aligned. Truncate with ellipsis in the rare case a category tag is too long for one line, rather than letting it wrap.
- **Headline (the raw user input) appears in quotation marks** — bold Fraunces, full opacity, the most prominent text on the card. This is the visual signal that it's verbatim, the subject's own words.
- **Body (generated commentary) stays unquoted**, smaller Public Sans, ~80% opacity relative to the headline — reads as the museum's voice commenting on the quoted piece, distinct from the quote itself.
- **Footer, one compact line:** "PERMANENT COLLECTION . {YYYY} . {MM} . {DD}" — the creation date lives here now, grouped with the other quiet provenance detail rather than competing with the category tag up top. Smallest text on the card, low opacity (~50–60%). If it doesn't fit on narrow cards, truncate rather than wrap.
- **Mobile responsive, non-negotiable:** all of the above uses fluid sizing (`clamp()` for type, relative units for padding/gaps), not fixed pixel values tuned only to a ~360px desktop grid cell. Verify the card holds up — no text overflow, no awkward wraps, gilt frame and scrim still read correctly — at mobile (~375px), tablet (~768px), and desktop (~1440px) widths.
- **Card height is fixed**, not content-driven — the min/max-height approach let the card grow too tall in practice. Revert to a fixed overall card height. Body text (§7.2–7.3) varies a lot in length across the 64 combinations, so apply a clean multi-line truncation (`-webkit-line-clamp` or equivalent) to the body specifically — it should end with a proper ellipsis at a word boundary on longer combos, never the raw mid-word cutoff from the original bug. Headline and footer stay fully visible regardless of body length. Test against both the shortest and longest real combinations in copy.md to confirm neither looks broken (shortest shouldn't leave awkward empty space; longest should truncate cleanly, not overflow).

---

### B.2 The Reveal Animation (Submit Win Modal, Step 3)
This is explicitly called out in the PRD as the **key emotional moment** of the product. Getting this right matters more than almost anything else visually.

**Guidance:**
- Treat this as a **choreographed sequence**, not a single transition:
  1. The "writing your plaque..." loading state should feel active (e.g. a subtle animated frame outline or pulsing element) — not a generic spinner.
  2. The transition from loading → revealed card should feel like an **unveiling** — consider a combination of fade + slight scale-up + the frame "completing" itself (e.g. drawing in along the border, or a soft flash of light). **Crucially:** the frame-draw-in effect must trace the rounded rectangle path (12px corner radius), not a sharp rectangle, so the animated frame matches the static card's geometry exactly once revealed. A sharp-corner draw transitioning into a rounded static card will read as a visual mismatch/pop at the end of the sequence.
  3. Avoid anything fast, bouncy, or "gamified" (no confetti, no elastic easing) — the motion should match the calm, reverent tone (slow-ish ease-out curves, soft opacity changes).
- **Implementation details for the frame draw-in:**
  - If implemented with an SVG stroke (e.g. stroke-dasharray/stroke-dashoffset technique), the SVG `<rect>` element needs matching `rx`/`ry` values (`12px`). Flag this explicitly since it's an easy detail to miss when prototyping the animation in isolation.
  - If implemented via CSS (e.g. animating `border-radius` alongside `clip-path` or a pseudo-element), the radius must be locked to `12px` throughout the sequence, not animated from sharp to round. The PRD calls for a "magical unveiling" feel, not a shape-shifting one.
- Prototype this animation in isolation first (e.g. as a standalone component/story) before wiring it into the full modal flow, so timing can be tuned without the complexity of the full form state.

---

### B.3 Templated Placard Generation
The placard text system needs to feel varied and "written," not obviously templated.

**Guidance:**
- Structure templates as **slots**, e.g.:
  - `[Opener]` — sets a formal/historic tone (e.g. "Placed in the archive without fuss:", "Kept here against forgetting:").
  - `[Core description]` — incorporates the user's input, possibly with light reframing language around it (e.g. "the subject was observed to have...").
  - `[Closer/flourish]` — adds a dramatic or wry closing remark (e.g. "...an act now enshrined in the permanent collection.").
- Maintain **multiple variants per slot** (aim for enough combinations that repeat submissions feel fresh — even a modest set like 5–8 options per slot yields dozens of combinations).
- Be careful with **grammar agreement** between slots and the raw user input — since the input is freeform text, templates should be designed to wrap around it gracefully rather than requiring grammatical integration (e.g. presenting the user's text as a quoted "exhibit label" rather than splicing it mid-sentence, where mismatches are more visible).
- This system should live in a clearly isolated module (per `agents.md` — Architecture Agent responsibility) so the Content Agent can expand/edit phrase variants without touching application logic.

---

### B.4 Masonry Grid with "Load More"
Combining masonry-style layout with paginated loading can introduce layout shift issues (new items reflowing existing ones).

**Guidance:**
- If using CSS-only masonry, test how newly loaded items affect the existing grid — items "jumping" to new positions when more are loaded can feel jarring and undercut the calm aesthetic.
- A column-based masonry approach (assigning new items to the shortest column) tends to minimize disruptive reflow compared to true CSS masonry.
- Consider a brief fade-in for newly loaded cards so their appearance feels intentional rather than abrupt.

---

### B.5 Exhibit / Withdraw State
The relationship between a "personal win" and its "public exhibition" counterpart needs careful handling so the same underlying win can exist in both places without exposing user identity.

**Guidance:**
- Treat exhibition as a **state/flag on the personal win**, plus a corresponding **anonymized public record** — rather than duplicating full win data into a separate, disconnected public table (to avoid sync issues between the two).
- Withdrawing should be a simple state change (toggle off / remove the public-facing record) — it should never delete the user's personal copy.
- Exact schema approach to be finalized in `database.md`, but this doc flags the conceptual relationship for the Architecture Agent to design around.

---

### B.6 The Landing Page Hero, What-This-Is, and Collection Preview
**History, briefly:** several approaches to a cinematic, scroll-scrubbed 5-act narrative were attempted — GSAP ScrollTrigger + Lenis, GSAP alone against native scroll, Framer Motion + CSS `position: sticky` with a single persistent transforming element, and finally a pre-rendered frame-sequence scrubbed via canvas. Each ran into some version of the same problem (elements not cleanly handing off to each other, or the added complexity not paying for itself) closely enough times that the design goal changed: something equally distinctive, structurally simple, reliably buildable. The current direction — hero, What This Is, collection preview, connected by ordinary scroll-triggered reveals — is that simpler design, not a fallback or a compromise.

**Guidance:**
- **Framer Motion `whileInView` only** for section-to-section motion — the same reliable technique already used for the mobile fallback and hover states elsewhere in this app. No pinning, no scroll-scrubbing, no canvas, no scroll-hijacking library of any kind.
- **The hero's card cluster** (`content/copy.md` §2.1) reuses the real WinCard component (hero variant) — scattered at slight rotation angles, overlapping, not a rigid grid. A one-time staggered entrance (fade + slight rotate-in) on page load is fine; it should not be scroll-linked.
- **The handwritten-style annotation callouts** need a second display font reserved only for this moment (a script/cursive face) — everywhere else in the app stays disciplined to Fraunces + Public Sans. Keep this font's use sparing and deliberate, not a new general-purpose accent.
- **The What This Is and Collection Preview sections** are ordinary content sections in normal document flow — they reveal via `whileInView` as they scroll into place, nothing more elaborate.
- **The plain-language "What This Is" copy no longer needs special fallback treatment** — it's a normal, always-visible section now (`content/copy.md` §2.2), not a hidden accessibility-only block. This actually simplifies the accessibility story: what a sighted, motion-enabled visitor sees is the same content a screen reader or `prefers-reduced-motion` visitor gets, just with (or without) a fade-in.
- **Line illustrations (user-provided, playful accents):** placement pending asset delivery — likely candidates are the hero's handwritten-annotation arrows (replacing a plain CSS-drawn line with the actual illustration) and small doodles near the "What This Is" copy. Update this note once assets are in hand and placement is confirmed.

## Part C — Notes for Future Updates
- As `architecture.md` and `database.md` are finalized, Part A of this document should be revisited to confirm the listed capabilities match actual stack decisions (e.g. replace "managed auth service" with the specific provider chosen).
- Part B should be expanded as new tricky implementation areas are identified during the build.

### B.7 The Button Component — Reuse, Don't Restyle (recurring bug, flagged twice)
The primary/ghost Button component (sage-fill primary, muted-ink ghost secondary, title case, established on `/styleguide`) has been restyled ad-hoc twice now — once for the old collection-preview CTAs, once for the hero CTAs — both times reintroducing a one-off gold-fill/white-outline/all-caps treatment instead of importing the real component. Any prompt touching a CTA anywhere in the app should explicitly say "reuse the existing Button component" rather than describing the desired button styling from scratch, since describing it apparently invites a new implementation instead of reuse.
