# Product Requirements Document (PRD)
## Project: Museum of Tiny Wins

> **Status: partially retired / partially deferred.** See `CURRENT_STATE.md` for the single source of truth on what is active, retired, and deferred. In particular: View 1's 5-act GSAP ScrollTrigger + Lenis cinematic narrative is **retired** (the active landing page is a static editorial hero), and the backend/DB/API/auth work described throughout is **deferred**.

---

## 1. Overview

**Museum of Tiny Wins** is a web application that transforms small, often-overlooked personal achievements into framed "museum exhibits" — complete with dramatic, formal placard-style descriptions. The app blends quiet self-celebration with gentle humor, presenting everyday wins ("Drank water before coffee," "Replied to that scary email") as if they were historic artifacts worthy of preservation.

The product serves two purposes:
1. **Personal archive** — a private space for users to log and revisit their own tiny wins.
2. **Shared gallery** — an anonymous, public exhibition where users can optionally "donate" a win to a community gallery for others to browse.

The project is being built as a **portfolio piece** using **Google Antigravity IDE**, and will be released as a **free web app**, with the final decision on personal-use-only vs. public-facing still open.

---

## 2. Core Concept & Tone

- The emotional core of the product is **contrast**: trivial, mundane actions described in the formal, reverent language of museum curation.
- Example transformation:
  - Input: "Replied to that scary email."
  - Output (placard): "The creator bravely opened LinkedIn despite emotional risk, and composed a response — an act of quiet courage now preserved for posterity."
- The experience should feel like **walking through a digital art gallery**, not using a productivity tool or habit tracker.
- Atmosphere comes first — the mood should land before the user reads any text.

---

## 3. Visual & Interaction Direction

- **Color palette**: muted sage greens, dreamy sky gradients, warm creamy whites. Nothing harsh, clinical, or high-contrast.
- **Typography**: editorial pairing — an elegant serif (for titles/plaques/headings) combined with a clean sans-serif (for body text/labels).
- **Layout philosophy**: generous white/airy space, minimal clutter, no unnecessary pages.
- **Display, not list**: wins are presented as individual framed artifacts/cards, not rows in a table or feed.
- **Motion**: soft fade-ins, gentle floating animations, smooth scroll-based reveals, subtle hover lifts — a "Framer-like" feel throughout.
- **Scroll narrative (Landing page only)**: a cinematic, pinned scroll sequence built with **GSAP ScrollTrigger + Lenis** (smooth inertial scroll), depicting a single tiny win's transformation through the museum's own curation process. **Framer Motion** remains the tool for every other micro-interaction app-wide (modals, hover states, the Submit Win reveal) — GSAP is scoped specifically to the Landing page's macro scroll narrative, not a wholesale replacement. See the expanded View 1 spec below.
- **Design references**: Lunora and Myna UI — atmospheric and emotional rather than informational or feature-driven.
- Explicitly **excluded** from the design: feature lists, bullet-point marketing copy, pricing sections, testimonials, dashboards, or anything that reads as "SaaS."

---

## 4. User Model

- **No social profiles.** This is not a social media product — users do not have public usernames, avatars, bios, or follower systems.
- **Authentication is minimal**, used only to:
  - Maintain a private personal collection ("Personal Museum").
  - Allow curation actions (submitting, exhibiting, withdrawing wins).
- **Public Exhibition Hall requires no login** — anyone can browse it anonymously.
- **Exhibited wins are fully anonymous** — no attribution to any user, logged in or not.

---

## 5. Functional Requirements by View

### View 1 — Landing / Hero Page (`/`)

**Purpose:** Instead of *stating* the app's value, the landing page *performs* it. Rather than a hero + explanatory blurb, the entire page is one continuous scroll narrative: a single tiny win, elevated through the museum's own curation process, across five acts. The scroll experience teaches the visitor what the product does without a word of marketing copy.

**Scroll Narrative — Desktop/Tablet (pinned, GSAP ScrollTrigger + Lenis):**

Each act pins the viewport while its own scroll progress drives a contained animation; pinning releases as one act hands off to the next.

- **Act 0 — Intake of the Ordinary**
  - A plain, unstyled line of text appears — e.g. *"Drank water before coffee."* No frame, no styling beyond plain type. This establishes the "before" state.
  - App name "Museum of Tiny Wins" and tagline (*"A place where the small stuff gets the glory it deserves."*) fade in around it.
  - No CTA in this act — its only job is contrast.

- **Act 1 — Accessioning**
  - The plain text is "received" into the museum's process: a catalog/date-stamp motif appears, and a faint border begins to form.
  - Signals that something ordinary is entering a formal, reverent system.

- **Act 2 — Curation**
  - The dramatic placard language writes itself in around the original text, live — reusing the existing "Our curators are writing your plaque..." voice, staged here as spectacle rather than a loading state.
  - This is the moment that actually teaches the visitor what the app does.

- **Act 3 — Framing**
  - A literal gilt/frame element materializes around the now-completed card — the emotional peak of the narrative, mirroring the Submit Win Modal's Step 3 reveal.
  - A soft "gallery lighting" glow/shadow completes the transformation.

- **Act 4 — Exhibition**
  - The finished, framed card settles onto a gallery wall alongside a few other floating framed cards (this absorbs the previous "3 example win cards" concept).
  - Pinning releases; the page returns to normal scroll.
  - Primary CTAs appear: **"Enter the Museum"** → Public Exhibition Hall (`/exhibition`); **"Add Your Win"** → opens the Submit Win modal (if unauthenticated, redirects to sign-in, returning to the modal after login).

**Scroll Narrative — Mobile:**
  - No pinning. Pinned scroll-jacking is unreliable across mobile browsers (address bar resize, momentum-scroll conflicts) and reads as broken rather than cinematic.
  - Same five acts, presented as sequential fade/slide-in reveals as each section enters the viewport.
  - Tone and pacing carry over unchanged — just without the scroll-scrub.

**Navbar (all breakpoints):** Logo (left); a persistent minimal CTA ("Add Your Win") plus "Sign In" or user avatar (right) — visible throughout the scroll, not only after Act 4, so visitors aren't forced to scroll the full narrative before they can act.

**Footer:** App name + one small line of copy. Nothing else.

**Technical note:** GSAP ScrollTrigger + Lenis drive this five-act pinned sequence specifically. Framer Motion continues to handle every other animation in the app (modals, hover states, card transitions) — no change to the existing stack elsewhere.

**Explicit exclusions:** No feature lists, bullet points, pricing, testimonials, or stat-counter chrome — the scroll narrative replaces all conventional landing-page persuasion sections.

---

### View 2 — Public Exhibition Hall (`/exhibition`)

**Purpose:** A browsable, anonymous gallery of community-submitted wins. No account required.

**Requirements:**
- Section header styled like a museum wing label, e.g. *"The Grand Exhibition — Wing I."*
- Masonry or uniform grid layout of Win Cards, **12 per load**.
- **"Load More" button** at the bottom (no infinite scroll, for performance reasons).
- **Report action (🚩)**: Clicking a card opens a detailed view (`WinDetailModal`) containing the Report button. The card itself has no hover-reveal actions.
- **Sorting:** Most recent first (default).
- **Empty state:** A beautifully illustrated message shown if no public wins exist yet.

**Design notes:**
- Cards feel like they're floating in gallery space — generous spacing between them.
- Background: warm off-white or very faint gradient (not pure white).
- Hover effect: subtle lift + deepening soft shadow.

---

### View 3 — Personal Museum (`/museum`) 🔒 Protected (requires login)

**Purpose:** A private, intimate space for a user's own collection of wins.

**Requirements:**
- Personalized header: *"[First Name]'s Museum."*
- Full grid/gallery of the user's own win cards.
- Prominent, always-visible **"+ Add a Tiny Win"** button.
- **Empty state** for new users:
  - Warm, encouraging message.
  - CTA to submit their first win.
- **Card Click Actions (opens `WinDetailModal`):**
  - 🌍 **"Exhibit Publicly"** toggle — only shown if the win is not already exhibited.
  - 🗑️ **"Remove from Collection"** — deletes the win entirely.
  - (Implied) A way to **withdraw** a win from the public exhibition if it has already been exhibited.
- Subtle artifact counter, e.g. *"Your collection holds 14 artifacts."*

**Design notes:**
- Visually warmer and more intimate than the public gallery.
- Personal cards use a slightly different frame styling/tone than public cards to reinforce the sense of personal ownership.
- The card itself has no hover-reveal actions; click-to-open is inherently mobile-friendly.

---

### View 4 — Submit Win Modal (not a standalone page)

**Purpose:** Capture a user's tiny win and transform it into a museum artifact.

**Requirements:**

**Step 1 — Input:**
- Full-screen modal overlay (not a page navigation).
- Large, minimal text area:
  - Placeholder: *"What tiny thing did you do today?"*
  - 300-character limit with a live counter.
- Cloudflare Turnstile CAPTCHA (invisible/minimal, low-friction).
- Opt-in toggle: *"Add this to the Public Exhibition 🖼️"* — **off by default**.
- Submit button labeled **"Frame It."**

**Step 2 — Generation:**
- Beautiful loading state:
  - Animated museum frame visually forming around the submitted text.
  - Copy: *"Our curators are writing your plaque..."*
- The dramatic placard description is generated via **templated/randomized phrasing** (not a live AI call) — combining structured opener/closer phrase variations with the user's input, so repeated submissions of similar wins can yield varied results.

**Step 3 — Reveal:**
- The completed Win Card appears with a **satisfying reveal animation** — described as the key emotional moment of the entire app.
- Two follow-up actions:
  - **"Add to My Museum"** → saves the win to the user's personal collection (and to the public exhibition too, if the opt-in toggle was enabled).
  - **"Frame Another"** → resets the form back to Step 1.

**Design notes:**
- Modal background: frosted glass blur over the page content behind it.
- The reveal animation should feel magical/delightful — this is a primary "wow" moment for the product.

---

## 6. Public Exhibition Flow

- When a user submits a win, they may opt in via toggle: *"Add this to the Public Exhibition 🖼️"* (off by default).
- Alternatively (or additionally — to be finalized in design phase), users can later choose **"Exhibit Publicly"** from an existing win card in their Personal Museum.
- All exhibited wins appear **anonymously** in the Public Exhibition Hall — no user identifiers of any kind.
- Users can **withdraw** an exhibited win from the public gallery at any time via their Personal Museum — this removes it from `/exhibition` but keeps it in their personal collection.
- The public gallery includes a **report (🚩)** mechanism for flagging inappropriate content, accessible by clicking the card to open its details.

---

## 7. Content & Tone Guidelines (summary — full detail in `content/copy.md`)

- All copy should maintain the "museum curator" voice: formal, reverent, slightly theatrical, but never mocking the user.
- Loading states, empty states, and microcopy should stay in voice (e.g., "Our curators are writing your plaque...").
- No corporate/SaaS language anywhere in the product (no "Get Started," "Pricing," "Features," "Sign up now and unlock...").

---

## 8. Out of Scope (for current version)

- User profiles, usernames, avatars, or any social/follow features.
- Comments, likes, or social interactions on public exhibits.
- Live AI-generated placard text (using templated/randomized phrasing instead).
- Infinite scroll on the Public Exhibition Hall (explicitly using "Load More" for performance).
- Any pages beyond the four defined views (Landing, Public Exhibition Hall, Personal Museum, Submit Win Modal).

---

## 9. Open Questions / Decisions Pending

- Final decision: is this a fully public free web app, or a personal-use project (or both)?
- [RESOLVED] Exact mechanism for triggering login when an unauthenticated user clicks "Add Your Win": Redirect to a dedicated sign-in page.
- [RESOLVED] Landing page scroll experience: expanded into a 5-act cinematic scroll narrative (GSAP ScrollTrigger + Lenis on desktop/tablet, sequential fade/slide reveals on mobile) depicting a single tiny win's transformation through the museum's curation process — see updated View 1 spec.
- Whether "Exhibit Publicly" can be toggled both at submission time (Step 1 toggle) and retroactively from the Personal Museum, or only one of these.

---

## 10. Related Documents

This PRD will be accompanied by the following supporting documents, prepared step by step:
- `agents.md` — agent/build configuration for Antigravity IDE.
- `skills.md` — relevant skills/capabilities reference.
- `design.md` — detailed design system (colors, type, spacing, components).
- `content/copy.md` — full copywriting reference, including placard templates.
- `architecture.md` — technical architecture and stack decisions.
- `database.md` — data model and schema design.
