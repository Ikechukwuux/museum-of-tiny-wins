# Content & Copy Reference
## Project: Museum of Tiny Wins

This document contains all user-facing text for the application — page copy, microcopy, empty/loading states, and the full templated placard generation system. All copy follows the **museum curator voice**: formal, reverent, gently theatrical, never mocking, never corporate.

---

## 1. Voice & Tone Principles

- Speak as if every entry is a genuine historical artifact worthy of preservation.
- Use formal, slightly old-fashioned phrasing ("preserved for posterity," "the subject," "the collection," "on display").
- Never wink too hard at the joke — the humor comes from *sincerity*, not from acknowledging it's silly.
- Avoid exclamation points except where they're part of a designed flourish (rare).
- Never use: "Get Started," "Sign Up Now," "Unlock," "Dashboard," "Welcome back!", "Oops!", or any startup/app-store phrasing.

---

## 2. Landing / Hero Page (`/`)

The Landing page is one continuous 5-act scroll narrative (see `PRD.md` View 1 and `skills.md` B.6): a single tiny win, elevated through the museum's own curation process. All five acts follow one example win end-to-end, so the copy below is written as one continuous piece, not five disconnected blurbs.

**The through-line win, used across Acts 0–3:** "Drank water before coffee." (this is the same example previously listed as Win Card #3 in §2.6 below — reusing it here means the visitor later recognizes it sitting on the gallery wall in Act 4, rather than meeting an unrelated example).

### 2.1 Act 0 — Intake of the Ordinary
- **Raw input, shown plain:** "Drank water before coffee."
- **App name (fades in around it):** Museum of Tiny Wins
- **Tagline:** "A place where the small stuff gets the glory it deserves."
- No CTA in this act.

### 2.2 Act 1 — Accessioning
- **Accession label:** "ACCESSION NO. 000001"
- **Caption:** "Received into the permanent collection for further study."

### 2.3 Act 2 — Curation
- **Primary line (reused verbatim from §5.2, staged here as spectacle rather than a loading state):** "Our curators are writing your plaque..."
- **Optional secondary line, if the act needs a longer beat:** "Every word is chosen with great care."
- The placard body writes itself in around the raw input, live — this is where the visitor learns what the app actually does, without being told.

### 2.4 Act 3 — Framing
- **Caption:** "Conservators have completed the framing. The piece is now ready for exhibition." (reuses the "Conservators" language already established in Win Card #1, §2.6 — same curatorial voice, not a new character.)
- This is the emotional peak of the sequence — no additional copy needed beyond the caption; the frame-draw-in animation itself should carry the moment (see `skills.md` B.2 and B.6).

### 2.5 Act 4 — Exhibition
- **Section heading (optional, minimal):** "A Small Sample of the Permanent Collection"
- **Copy below heading (one line, optional):** "Every visitor leaves something behind."
- The now-framed card settles onto the gallery wall alongside the other example cards from §2.6.
- **Primary CTA:** Enter the Museum
- **Secondary CTA:** Add Your Win

> Note: the cards should carry most of the weight here. If the heading feels unnecessary once cards are in place, it can be omitted — minimal copy is the goal.

### 2.6 Example Win Cards (for hero/gallery display)
These are pre-written examples used as static display pieces — not user-generated, but written in the same voice as generated placards. Card #3 is the through-line win used in Acts 0–3 above; #1, #2, #4, and #5 appear alongside it once it lands in Act 4.

1. **Original win:** "Made the bed before noon."
   **Plaque:** "A domestic landmark. Conservators note the tucked corners with particular reverence."

2. **Original win:** "Replied to that scary email."
   **Plaque:** "Catalogued with due care. Visitors tend to understand."

3. **Original win:** "Drank water before coffee."
   **Plaque:** "Received into the permanent collection. Even modest works endure."

4. **Original win:** "Went outside for 8 minutes."
   **Plaque:** "Kept here against forgetting. Its place here is secure."

5. **Original win:** "Said no and meant it."
   **Plaque:** "A rare specimen. Acquired after considerable deliberation — the deliberation itself is now part of the exhibit."

### 2.7 Navbar
- **Persistent CTA (all breakpoints, visible throughout the scroll, not just after Act 4):** Add Your Win
- **Sign In (unauthenticated):** Sign In
- **Authenticated state:** display first name only (e.g. "Maya") — no avatar required, but if a small icon is used, keep it abstract/non-photographic.

### 2.8 Accessibility & Fallback Content
This copy (formerly the standalone "What This Is" section) now serves a specific structural role: it's the plain-language, always-in-the-DOM fallback shown when `prefers-reduced-motion` is set, when JS fails to load, or to crawlers — not just a nice-to-have explainer. See `skills.md` B.6 and `architecture.md`'s Landing page client/server split note. It must exist as real semantic text regardless of which animation branch a given visitor gets; only its visual presentation (static block vs. animated acts) changes.
- **Overline:** "What is this?"
- **Headline:** "Your small wins deserve a frame."
- **Body:** "Most apps track your goals. This one celebrates what you already did — even the tiny, forgettable things. You write it down, we make it look important."
- **Second line (optional):** "Because sometimes 'drank water before coffee' is enough."

### 2.9 Footer
- **Monogram:** MTW
- **App name (under monogram):** Museum of Tiny Wins
- **Tagline:** "Established for the appreciation of small things."
- **Column heading 1:** Explore
  - Exhibition → /exhibition
  - My Museum → /museum (auth-redirect)
  - Add a Win → auth-redirect + Submit Win Modal
- **Column heading 2:** Info
  - About → /#what-this-is
  - Report an Issue → mailto or /report stub
- **Copyright:** "© 2026 Museum of Tiny Wins. All rights reserved."
- **Right side of bottom bar:** "Made with care." (italic, muted)

---

## 3. Public Exhibition Hall (`/exhibition`)

### 3.1 Header
- **Wing label:** "The Grand Exhibition — Wing I"
- **Optional subheading:** "Donated by visitors, displayed without names."

### 3.2 Sorting Label
- **Default sort label:** "Most Recently Acquired"

### 3.3 Load More Button
- **Label:** "Reveal More of the Collection"
- **Loading state (while fetching):** "Unsealing the next gallery..."

### 3.4 Report Action (in `WinDetailModal`)
- **Action label/tooltip:** "Report this piece 🚩"
- **Confirmation (after reporting, small toast/inline message):** "Noted. A curator will review this piece."

### 3.5 Empty State
- **Heading:** "This Wing Is Still Being Built"
- **Body:** "No pieces have been donated to the public collection yet. Be the first to leave something behind."
- **CTA:** Add Your Win

---

## 4. Personal Museum (`/museum`)

### 4.1 Header
- **Format:** "[First Name]'s Museum"
  - Example: "Maya's Museum"

### 4.2 Add Win Button
- **Label:** "+ Add a Tiny Win"

### 4.3 Artifact Count
- **Format:** "Your collection holds {count} artifact{s}."
  - 0 → handled by empty state (see below)
  - 1 → "Your collection holds 1 artifact."
  - 2+ → "Your collection holds {count} artifacts."

### 4.4 Card Detail Modal Actions
These actions are available when a user clicks a card to open its `WinDetailModal`:
- **Exhibit toggle (not yet exhibited):** "Exhibit Publicly 🌍"
- **Exhibit toggle (already exhibited — shown as withdraw):** "Withdraw from Exhibition"
- **Remove action:** "Remove from Collection"
- **Remove confirmation (if a confirm step is used):**
  - Heading: "Remove This Piece?"
  - Body: "Once removed, it cannot be recovered."
  - Confirm button: "Remove It"
  - Cancel button: "Keep It"

### 4.5 Empty State (New Users)
- **Heading:** "The Museum Is Empty — For Now"
- **Body:** "Every collection starts somewhere. Yours can start with something very small."
- **CTA:** "Add Your First Tiny Win"

---

## 5. Submit Win Modal

### 5.1 Step 1 — Input
- **Modal title (optional, small):** "New Acquisition"
- **Textarea placeholder:** "What tiny thing did you do today?"
- **Character counter format:** "{count} / 300"
- **Public exhibition toggle label:** "Add this to the Public Exhibition 🖼️"
- **Submit button:** "Frame It"

### 5.2 Step 2 — Generation (Loading State)
- **Primary loading copy:** "Our curators are writing your plaque..."
- **Optional secondary line (if a longer wait):** "Every word is chosen with great care."

### 5.3 Step 3 — Reveal
- **Reveal heading (optional, small, above the card):** "Newly Acquired"
- **Primary action:** "Add to My Museum"
- **Secondary action:** "Frame Another"
- **Confirmation after "Add to My Museum" (brief inline message before modal closes):** "Added to the collection."
- **If public toggle was enabled, additional confirmation line:** "...and placed on public display."

### 5.4 Error / Edge States
- **Empty submission attempt:** "Even the smallest win needs a few words to be framed."
- **Character limit reached (300):** No error needed — counter simply shows "300 / 300" and prevents further input.
- **Daily submission limit reached (5 per 24 hours):** "The curators can only process so many acquisitions in a day. Please return tomorrow to add another piece." (Shown proactively in Step 1, disabling the "Frame It" button).
- **CAPTCHA failure:** "Something interrupted the framing process. Please try again."
- **Generic submission error:** "The plaque could not be completed. Please try again in a moment."

---

## 6. Authentication Touchpoints

### 6.1 Sign In Page (triggered by "Add Your Win" if unauthenticated)
- **Heading:** "Before You Begin"
- **Body:** "A small account is needed to keep your collection safe — nothing more."
- **CTA:** Sign In / Create Account (combined or separate per `architecture.md` decision)

### 6.2 Sign In / Sign Up Form Labels
- Keep standard and minimal: "Email," "Password," "Sign In," "Create Account."
- Avoid embellishing these — functional forms can stay plain; the voice is reserved for the museum experience itself, not account plumbing.

---

## 7. Templated Placard Generation System

This is the core content-generation engine referenced in `skills.md` (Part B.3). It generates three independent fields for the Win Card: Headline, Body, and Category Tag.

### 7.1 Structure

The placard consists of three independently populated parts:

1. **Headline:** The user's raw input, unmodified, displayed as-is (still 300-char capped). No longer wrapped in quotes; the typography (`text-heading-2` bold serif) provides the visual separation.
2. **Body:** A flowing 1–2 sentence elaboration created by combining an independently selected Opener and Closer.
3. **Category Tag:** A short, curated museum-style label (e.g. "Endurance"), independently randomized.

### 7.2 Body Openers — Shorter Set

These are intentionally tighter to reduce truncation while keeping the same museum voice.

1. "Quietly entered into the collection."
2. "Catalogued with due care."
3. "Added to the record today."
4. "Filed among ordinary wonders."
5. "Set aside for preservation."
6. "Noted by the museum and retained."
7. "Placed in the archive without fuss."
8. "Received into the permanent collection."
9. "Recorded for future viewing."
10. "Kept here against forgetting."
11. "Accepted into the registry at once."
12. "Preserved under museum care."

### 7.3 Body Closers — Shorter Set

These are shorter second sentences for the same reason.

1. "It asks for no further defense."
2. "Little else need be said."
3. "The record is sufficient."
4. "Its place here is secure."
5. "Visitors tend to understand."
6. "It rewards a second look."
7. "Nothing essential has been omitted."
8. "The matter speaks for itself."
9. "Even modest works endure."
10. "Posterity may judge kindly."
11. "The museum stands by it."
12. "It merits brief attention."

### 7.4 Category Tags

An independently randomized short label displayed in the top meta row.

1. Endurance
2. Resilience
3. Discipline
4. Quiet Victory
5. Restraint
6. Triumph
7. Forward Motion
8. Preservation
9. Small Graces
10. Audacity

### 7.5 Example Combinations

- **User input:** "Replied to that scary email."
  **Generation:** Opener 5 + Closer 2 + Category 4
  **Headline:** Replied to that scary email.
  **Category Tag:** QUIET VICTORY
  **Body:** "Submitted by the subject themselves, entirely without prompting. Visitors are encouraged to sit with this one for a moment."

- **User input:** "Went outside for 8 minutes."
  **Generation:** Opener 3 + Closer 6 + Category 9
  **Headline:** Went outside for 8 minutes.
  **Category Tag:** SMALL GRACES
  **Body:** "Newly catalogued for the museum registry. Future generations will undoubtedly understand."

### 7.6 Generation Rules
- Opener, Closer, and Category Tag should be selected **independently and randomly** on each "Frame It" / "Frame Another" action, so the same input yields different placards across attempts.
- Maintain enough variants per slot (current set: 8 openers × 8 closers = 64 body combinations, plus 10 categories) to avoid obvious repetition during a single session.

### 7.7 Future Expansion Notes
- Additional slot types (e.g. a middle "curatorial note" sentence) could be introduced later for variety, but should remain optional.
- If certain Opener/Closer combinations are found to read awkwardly together, exclusion pairs can be defined rather than removing variants entirely.

### 7.8 Win Card Universal Copy Elements
These apply to the single shared Win Card component across all three variants (hero, public, personal — see `skills.md` B.1), not just the generated placard text above.
- **Category tag** (top of the card, alone, label typography — small-caps, wide tracking): from §7.4.
- **Headline:** the raw user input, unmodified (§7.1), presented in quotation marks in the card UI — this visually signals it's verbatim, the subject's own words, distinct from the unquoted museum commentary in the body below it (see `skills.md` B.1 for the full card anatomy).
- **Body:** the generated placard body (§7.2–7.3).
- **Footer stamp, one compact line:** "PERMANENT COLLECTION . {YYYY} . {MM} . {DD}" — parsed from `created_at` (e.g. "PERMANENT COLLECTION . 2026 . 08 . 30"). Grouped with the other quiet provenance detail rather than given equal billing with the category tag at top.

---

## 8. Miscellaneous Microcopy

| Context | Copy |
|---|---|
| Page loading (general) | "The gallery is opening its doors..." |
| 404 / not found page | "This room does not appear to exist. Perhaps it was never built — or perhaps it has simply been moved." |
| 404 CTA | "Return to the Entrance" |
| Generic network error | "The museum has lost its connection to the archive. Please try again shortly." |

---

## 9. Notes for Future Updates
- As real user submissions come in, review for any inputs that produce awkward Opener/Closer pairings and document exclusions here.
- If a "curatorial note" middle slot (per 7.6) is added, this document should be updated with its variants and combination rules.
- Any new pages, modals, or states added to the product must have corresponding copy added here before implementation, per `agents.md` (Content/Copy Agent responsibilities).
