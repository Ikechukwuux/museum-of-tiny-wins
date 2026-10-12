# Architecture
## Project: Museum of Tiny Wins

> **Status: partially deferred.** See `CURRENT_STATE.md`. The routing/API/auth/placard-module sections describe **deferred** backend work — none of it is implemented yet (the app currently runs on mock data with a client-side Supabase auth scaffold). The GSAP/Lenis reference in §1 is **retired**; Framer Motion is the sole active animation tool.

This document defines the technical architecture, stack, project structure, and data flow for the application. It should be read alongside `PRD.md`, `agents.md`, `skills.md`, and `database.md`.

---

## 1. Stack Overview

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js** (App Router) | React-based, supports both static/SSR pages (good for the public Exhibition Hall) and client-side interactivity (modal flows, animations) |
| Styling | **Tailwind CSS** | Matches `skills.md` A.1 recommendation; pairs design tokens from `design.md` into a `tailwind.config` theme |
| Animation | **Framer Motion** (app-wide) | Framer Motion handles fade-ins, floats, hover lifts, the modal reveal sequence, and the Landing page's section-to-section reveals (`whileInView`) — the same technique used everywhere else in the app. No scroll-hijacking library, no canvas, no GSAP/Lenis — those were tried and retired (see `skills.md` B.6) in favor of a structurally simpler design. |
| Backend / Database | **Supabase** | Provides Postgres database, authentication, and row-level security in one managed service |
| Auth | **Supabase Auth** (email/password, magic link, or both) | Minimal — no profile data beyond what's needed for session identification |
| CAPTCHA | **Cloudflare Turnstile** | Per PRD — invisible/minimal verification on Submit Win Modal |
| Hosting | **Vercel** | Pairs naturally with Next.js; Supabase integrates cleanly via environment variables |

---

## 2. High-Level Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────┐
│                        Next.js App                       │
│  (Vercel)                                                │
│                                                           │
│  /            → Landing Page (SSR shell + client-mounted   │
  /              scroll-narrative layer — see note below)   │
│  /exhibition  → Public Exhibition Hall (SSR + pagination)│
│  /museum      → Personal Museum (client, protected)      │
│  Submit Win Modal → client component, overlays any page  │
│                                                           │
└───────────────┬───────────────────────────────────────--┘
                │
                │ Supabase JS Client (auth + data)
                ▼
┌─────────────────────────────────────────────────────────┐
│                        Supabase                          │
│  - Auth (email/password or magic link)                   │
│  - Postgres DB (wins, exhibition state)                   │
│  - Row-Level Security (RLS) policies                       │
└─────────────────────────────────────────────────────────┘
                │
                │ Server-side verification call
                ▼
┌─────────────────────────────────────────────────────────┐
│                  Cloudflare Turnstile                    │
│  - Token verification on win submission                  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Routing Structure (Next.js App Router)

```
/app
  /page.tsx                  → View 1: Landing / Hero Page
  /exhibition
    /page.tsx                → View 2: Public Exhibition Hall (SSR, paginated)
  /museum
    /page.tsx                → View 3: Personal Museum (protected, client-rendered)
  /api
    /wins
      /route.ts              → POST: create a new win (handles Turnstile verification + placard generation)
      /[id]/route.ts         → PATCH: update exhibit/withdraw state, DELETE: remove win
    /exhibition
      /route.ts              → GET: paginated public exhibition entries
    /report
      /route.ts              → POST: submit a report for a public win
```

**Submit Win Modal** is implemented as a client-side component (e.g. `/components/SubmitWinModal.tsx`), rendered conditionally over any page — not a route of its own, per PRD.

**Landing page client/server split:** `/app/page.tsx` can be server-rendered for content and SEO — the hero, "What This Is," and collection preview copy (`content/copy.md` §2) exists as real text in the initial HTML regardless of JS. The `whileInView` reveal behavior is a normal Framer Motion client component, no different from any other animated component in the app — there's no special no-JS/reduced-motion branch to maintain here, since the underlying mechanism (Framer Motion fades) already degrades gracefully.

---

## 4. Authentication Flow

- **Provider:** Supabase Auth — recommend email/password as the primary method (magic link optional, can be added later without architectural change).
- **No profile data collected** beyond email and the auto-generated user ID. First name (used in "[First Name]'s Museum") should be:
  - Collected as a single optional field at sign-up (e.g. "What should we call you?"), stored minimally, OR
  - Derived from email (e.g. portion before `@`) if no name is collected — to be decided during implementation; either approach keeps the "no profiles" constraint intact since this value is never shown publicly.
- **Protected routes:** `/museum` requires an active Supabase session. Unauthenticated access redirects to landing page with the sign-in prompt copy from `content/copy.md` section 6.
- **"Add Your Win" button & "My Museum" nav link triggers (Landing/Header):**
  - If authenticated → opens Submit Win Modal directly (for "Add Win") or navigates to `/museum` (for "My Museum").
  - If not authenticated → navigates to a dedicated `/login` (or `/sign-up`) page, a full route, not an overlay. On successful auth, the user is returned to their original intent (using a `?next=/museum` redirect param or a session-stored flag).

---

## 5. Data Flow: Submitting a Win

1. User opens Submit Win Modal (Step 1 — Input).
2. User enters text (≤300 chars), optionally toggles "Add this to the Public Exhibition 🖼️", completes Turnstile challenge.
3. On "Frame It":
   - Client sends `{ text, exhibit: boolean, turnstileToken }` to `POST /api/wins`.
   - API route enforces the daily submission limit (maximum 5 wins per rolling 24-hour period). It counts all rows inserted into `wins` by this user where `created_at >= now() - interval '24 hours'`, regardless of the `exhibit` boolean value (a single submission consumes exactly 1 from the quota, even if added to the public exhibition). If the count is ≥ 5, it rejects the request with a `429 Too Many Requests` status and does not run placard generation. Note: this limit applies only to new win creation (`POST /api/wins`) — toggling exhibition status on existing wins via `PATCH /api/wins/[id]` is unlimited.
   - API route verifies the Turnstile token server-side with Cloudflare's verification endpoint.
   - If valid: API route runs the **placard generation module** (see Section 7) to produce the templated description.
   - API route inserts a new row into the `wins` table (linked to `user_id`), and if `exhibit: true`, also creates a corresponding anonymized row in `public_exhibits` (see `database.md`).
   - Response returns the generated win object (including placard body, category, and background_id) to the client.
4. Client transitions to Step 2 (loading state) during this request, then Step 3 (reveal) once the response arrives.
5. On "Add to My Museum": the win is already persisted (per step 3 above), so this primarily transitions the UI back to the Personal Museum view (or closes the modal if opened from elsewhere).
6. On "Frame Another": modal resets to Step 1 (no data loss — already-submitted win remains saved).

> **Note:** Because the win is saved immediately upon generation (Step 2→3), "Add to My Museum" functions as a confirmation/navigation action rather than a separate save step. If a "draft, don't save yet" pattern is preferred instead, flag this for revision — current approach favors simplicity and avoids losing a generated placard if the user closes the modal.

---

## 6. Data Flow: Exhibit / Withdraw / Remove (Personal Museum)

- **Exhibit Publicly (🌍):**
  - Client sends `PATCH /api/wins/[id]` with `{ exhibit: true }`.
  - API route creates the corresponding anonymized `public_exhibits` row and updates the win's `is_exhibited` flag.
- **Withdraw from Exhibition:**
  - Client sends `PATCH /api/wins/[id]` with `{ exhibit: false }`.
  - API route removes/deactivates the corresponding `public_exhibits` row; the personal `wins` row remains untouched aside from the flag.
- **Remove from Collection (🗑️):**
  - Client sends `DELETE /api/wins/[id]`.
  - API route deletes the `wins` row. If the win was exhibited, the corresponding `public_exhibits` row is also deleted (cascading — see `database.md`).

All such actions are protected by Supabase Row-Level Security: a user may only modify/delete rows in `wins` where `user_id` matches their session.

---

## 7. Placard Generation Module

- Implemented as a standalone server-side utility (e.g. `/lib/placard.ts`), per `agents.md` (Architecture Agent responsibility) and `skills.md` (B.3).
- Exposes a single function, e.g. `generatePlacard(): { body: string, category: string, background_id: number }` (the headline is just `raw_input`, so there is no need to regenerate it).
- Internally pulls from the slot-based phrase pools defined in `content/copy.md` Section 7 (Opener, Closer, Category) to populate the returned object.
- Also assigns the win's `background_id` here at creation time, by randomly selecting 1 of 27 available background images (the canonical count — see `CURRENT_STATE.md`).
- Pure function with no external dependencies — easy to unit test, and easy for the Content Agent to extend by editing phrase pool data (likely a co-located JSON/TS data file, e.g. `/lib/placard-phrases.ts`) without touching combination logic.

---

## 8. Public Exhibition Hall Data Fetching

- `/exhibition` page uses **server-side rendering** for the initial 12 items (good for SEO/performance and matches the "no login needed" requirement cleanly).
- "Load More" triggers a client-side fetch to `GET /api/exhibition?page=N`, appending the next 12 items.
- Sorting: `ORDER BY created_at DESC` (most recent first, per PRD default — no alternate sort options in v1).

---

## 9. Reporting Flow

- Clicking 🚩 on a public exhibit sends `POST /api/report` with `{ exhibit_id }` (no user identification required/sent, even if the reporter is logged in — keeps reporting frictionless and anonymous).
- API route inserts a row into a `reports` table (see `database.md`) for later manual review. No automated moderation in v1 — out of scope per PRD.

---

## 10. Environment & Configuration

Expected environment variables (Vercel project settings):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only — used in API routes for privileged operations (e.g. writing anonymized public exhibits without exposing user identity in the client) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (client-side widget) |
| `TURNSTILE_SECRET_KEY` | Server-side only — used to verify Turnstile tokens |

---

## 11. Deployment

- **Vercel** project connected to the repository; standard Next.js build/deploy — no special configuration expected beyond the environment variables above.
- Supabase project provisioned separately; migrations (see `database.md`) applied via Supabase CLI or dashboard SQL editor.
- No separate backend server required — all backend logic lives in Next.js API routes (serverless functions on Vercel).

---

## 12. Open Items for `database.md`
- Final schema for `wins`, `public_exhibits`, and `reports` tables, including the relationship/sync approach flagged in `skills.md` B.5.
- Row-Level Security policy definitions for each table.
- Indexing strategy for `public_exhibits` (likely an index on `created_at` for efficient pagination/sorting).
