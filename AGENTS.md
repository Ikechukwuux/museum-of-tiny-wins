# AGENTS.md
## Project: Museum of Tiny Wins — Agent Roles & Rules of Engagement

This document defines who owns what across the build, and the cross-cutting rules that apply regardless of which agent is doing the work. Read alongside `CURRENT_STATE.md` (what is active/retired/deferred), `PRD.md`, `architecture.md`, `skills.md`, `content/copy.md`, and `database.md` — this doc defines *responsibility*, those define *content*.

Other docs already reference specific sections of this file (e.g. `architecture.md` and `skills.md` reference the Architecture Agent generally; `database.md` cites `agents.md` §1.4 and §2.4 directly). This draft is written so those existing references resolve correctly — §1.4 and §2.4 below match what's already cited elsewhere.

---

## 1. General Principles

1.1 This is a portfolio project built solo through Antigravity IDE prompts — "agents" here means *areas of responsibility to keep straight while prompting*, not separate people. Treat each section below as a lens to switch into deliberately, rather than blurring all concerns into one undifferentiated build pass.

1.2 No page, modal, or state gets implemented before its copy, data shape, and visual spec exist in the relevant doc. If a prompt to Antigravity would require inventing copy or a data field on the fly, stop and add it to `content/copy.md` or `database.md` first.

1.3 When a new implementation detail reveals a gap in an existing doc (a missing edge case, an ambiguous interaction), update that doc in the same session — don't let the docs drift from what actually got built.

1.4 Any change that expands scope beyond what's specified — especially anything touching moderation, safety, or user-data exposure — must be documented with justification in the relevant doc before implementation, not decided silently inside a code prompt. (Referenced directly in `database.md` §7.)

1.5 Framework and library versions move fast enough that training data can be stale. Before writing code against Next.js (or any other fast-moving dependency), check the actually-installed version's own docs/changelog rather than assuming familiar APIs and conventions still apply — heed deprecation notices. This project may be running a Next.js version with breaking changes relative to older, more familiar patterns.

---

## 2. Architecture Agent

Owns: `architecture.md`, the schema in `database.md`, API routes, and any isolated backend module (e.g. the placard generation module).

2.1 Keep business logic (placard generation, exhibit/withdraw state transitions, rate limiting) in isolated, testable modules — never inline in a page component.

2.2 RLS policies are the source of truth for row-level access, but RLS does not enforce column-level access. Any new query path must be reviewed for what columns it actually returns.

2.3 New API routes must state their rate limits and auth requirements explicitly in `architecture.md` before being wired into the UI — no implicit "we'll add a limit later."

2.4 Any public-facing data query must explicitly allowlist the columns it selects — never `select *` — and this must be called out clearly in the implementation, not left implicit in the query. (Referenced directly in `database.md` §4.1, re: the `/api/exhibition` query never exposing `user_id`.)

---

## 3. Content/Copy Agent

Owns: `content/copy.md` as the single source of truth for all user-facing text, including the templated placard phrase pools.

3.1 Any new page, modal, or state added to the product must have corresponding copy drafted in `content/copy.md` *before* implementation begins. (Referenced directly in `content/copy.md` §9.)

3.2 All copy maintains the museum curator voice (`content/copy.md` §1) — formal, reverent, never mocking, never corporate/SaaS phrasing ("Get Started," "Dashboard," "Welcome back!," etc. are all excluded).

3.3 Owns the phrase-pool data file for placard generation (e.g. `/lib/placard-phrases.ts`) as a standalone data source — can expand or edit slot variants without touching the Architecture Agent's combination logic, since the two are intentionally decoupled (`skills.md` B.3).

---

## 4. Design & Motion Agent

Owns: `design.md` (design tokens — not yet drafted as of this doc), the Win Card component's visual language across its three variants (`skills.md` B.1), the Submit Win Modal reveal animation (`skills.md` B.2), and the Landing page's 5-act scroll narrative (`skills.md` B.6).

4.1 Prototype any new choreographed animation (the reveal, the scroll acts) in isolation before wiring it into the full page/flow, so timing can be tuned independently of state or scroll-position complexity.

4.2 Any new motion work must have a `prefers-reduced-motion` fallback that is a genuinely different, static-or-simplified presentation — not just the same animation sped up or disabled with no replacement.

4.3 The Landing page's desktop (GSAP-pinned) and mobile (Framer Motion `whileInView`) implementations use different tooling but must land on the same story beats — review them side by side, not as two independent features that happen to share copy.

---

## 5. Cross-Agent Handoffs

5.1 When the Architecture Agent introduces a new module (e.g. placard generation), it must expose a clean seam for the Content Agent to extend data without touching logic (`skills.md` B.3).

5.2 When the Design & Motion Agent finalizes a component (e.g. the Win Card frame), the Architecture Agent implements it as a single base component with variant props — never as parallel near-duplicate components (`skills.md` B.1).

5.3 The Design & Motion Agent's scroll-narrative work (§4) depends on real copy from the Content Agent (`content/copy.md` §2.1–2.8) and real components from the Architecture Agent (the actual Win Card and frame-draw-in) — it should not be built against placeholder text or throwaway visuals that get swapped later.
