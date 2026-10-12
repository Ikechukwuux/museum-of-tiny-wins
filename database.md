# Database Schema
## Project: Museum of Tiny Wins

> **Status: fully deferred.** See `CURRENT_STATE.md`. This schema and its RLS policies are **not implemented** — no database is wired up yet. Treat this document as a design artifact for the deferred backend phase, not a description of the current codebase.

This document defines the Postgres schema (via Supabase), Row Level Security (RLS) policies, and pagination strategy, resolving the open items flagged in `architecture.md` §13.

---

## 1. Overview

Two custom tables are needed beyond Supabase's built-in `auth.users`:

1. **`wins`** — stores each user's submitted wins, including their generated placard text and exhibition status.
2. **`reports`** — stores flags submitted against publicly exhibited wins.

No `profiles` table is created, per the no-profiles constraint — the only user-identifying reference is `auth.users.id`, used internally for ownership/RLS and never exposed via public read paths.

---

## 2. Table: `wins`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` | Unique identifier for the win |
| `user_id` | `uuid` | Foreign key → `auth.users.id`, `not null`, `on delete cascade` | Owner of the win |
| `raw_input` | `text` | `not null`, max 300 chars (enforced at app layer + optional check constraint) | The user's original submitted text. Acts as the headline for the placard. |
| `placard_body` | `text` | `not null` | The generated museum-style description body |
| `category` | `text` | `not null` | The generated category tag (e.g. "Endurance") |
| `background_id`| `smallint` | `not null` | Which of the 27 background images was assigned (canonical count — see `CURRENT_STATE.md`). Set once at insert, never updated. |
| `card_size` | `text` | `not null`, default `'md'`, `CHECK (card_size IN ('sm','md','lg','xl'))` | Which size tier was drawn at creation. One of the four closed tiers: sm (Vitrine 1:1), md (Portrait 3:4), lg (Panel 2:3), xl (Pillar 9:16). Set once at insert, never updated — not on edit, exhibit, or withdraw. |
| `exhibited` | `boolean` | `not null`, default `false` | Whether this win is currently shown in the Public Exhibition Hall |
| `exhibited_at` | `timestamptz` | nullable | Timestamp when the win was last exhibited (useful for sorting/auditing; set on exhibit, optionally cleared on withdraw) |
| `created_at` | `timestamptz` | `not null`, default `now()` | When the win was created |

### 2.1 Notes
- **`exhibited_at` vs. `created_at` for public sorting**: the Public Exhibition Hall sorts "Most Recently Acquired." Using `exhibited_at` (rather than `created_at`) for this sort means a win exhibited later (even if created earlier) appears as a "recent acquisition" — which fits the museum metaphor better than using the original creation date. **Decision: sort `/exhibition` by `exhibited_at DESC`.**
- **Withdrawal behavior**: when a user withdraws a win from exhibition (`exhibited = false`), `exhibited_at` can either be left as-is (historical record) or cleared to `null` — recommend **leaving it as-is** for simplicity, since it has no public-facing effect once `exhibited = false`.
- **Character limit**: enforce the 300-character limit primarily at the application layer (per `content/copy.md` §5.4 error copy), with an optional Postgres `check (char_length(raw_input) <= 300)` constraint as a safety net.
- **Computed fields**: We previously considered an "ACCESSION NO." but decided to remove it from the UI in favor of a simpler "PERMANENT COLLECTION . YYYY . MM . DD" date stamp derived directly from `created_at`.
- **Headline**: The headline does not need its own column; reuse `raw_input` for display purposes.

### 2.2 Indexes
- Index on `(exhibited, exhibited_at)` — to optimize the paginated public exhibition query (`WHERE exhibited = true ORDER BY exhibited_at DESC`).
- Index on `(user_id, created_at)` — to optimize fetching a user's personal museum collection and efficiently support the rolling 24-hour rate limit count query (`SELECT count(*) FROM wins WHERE user_id = ? AND created_at >= now() - interval '24 hours'` — no filter on `exhibited`, confirming both personal-only and personal+public submissions are counted identically).

```sql
create index idx_wins_exhibited_sort on wins (exhibited, exhibited_at desc);
create index idx_wins_user_created on wins (user_id, created_at);
```

---

## 3. Table: `reports`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` | Unique identifier for the report |
| `win_id` | `uuid` | Foreign key → `wins.id`, `not null`, `on delete cascade` | The win being reported |
| `reason` | `text` | nullable | Optional free-text or category reason (v1 can be a single generic reason or omitted entirely) |
| `created_at` | `timestamptz` | `not null`, default `now()` | When the report was submitted |

### 3.1 Notes
- No `reporter_id` — reports are anonymous, consistent with `/exhibition` requiring no auth.
- `on delete cascade` ensures reports are cleaned up automatically if a win is later removed by its owner (avoids orphaned report rows).
- For v1, no automated action is taken on reports (per PRD scope) — they exist purely for manual review. A future admin view could query this table directly via Supabase's dashboard.

---

## 4. Row Level Security (RLS) Policies

RLS must be **enabled** on both tables. Policies below assume Supabase's standard `auth.uid()` function for identifying the current authenticated user.

### 4.1 `wins` table

**Enable RLS:**
```sql
alter table wins enable row level security;
```

**Policy: Owners can do everything with their own wins**
```sql
create policy "Owners can manage their own wins"
on wins
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```
This covers SELECT, INSERT, UPDATE, DELETE for the owner — satisfies Personal Museum (view, exhibit/withdraw, remove) and the "Add to My Museum" insert.

**Policy: Anyone can read exhibited wins (for the public exhibition)**
```sql
create policy "Anyone can view exhibited wins"
on wins
for select
using (exhibited = true);
```
This allows anonymous/public SELECT access, but **only** to rows where `exhibited = true`. Combined with the API layer only selecting `id`, `raw_input`, `placard_body`, `category`, `background_id`, `created_at`/`exhibited_at` (per `architecture.md` §7), this ensures `user_id` is never exposed even though the row itself is technically readable at the database level.

> **Important:** RLS controls *row* access, not *column* access. To guarantee `user_id` is never leaked to anonymous clients, the public exhibition query (`/api/exhibition`) **must explicitly select only the safe columns** — never `select *`. This should be called out clearly in implementation (Architecture Agent responsibility per `agents.md` 2.4).

### 4.2 `reports` table

**Enable RLS:**
```sql
alter table reports enable row level security;
```

**Policy: Anyone can insert a report**
```sql
create policy "Anyone can report a win"
on reports
for insert
with check (true);
```

**Policy: No public read access**
- No SELECT policy is created for anonymous/authenticated users — reports are only viewable via Supabase's service role (e.g. dashboard access for manual review), which bypasses RLS by default.

**Optional safeguard**: to prevent a report being filed against a win that doesn't exist or isn't exhibited, add a check via a foreign key (already present) — no additional policy needed, since the FK constraint alone prevents invalid `win_id` values.

---

## 5. Pagination Strategy for `/exhibition`

**Decision: cursor-based pagination using `exhibited_at` + `id` as a composite cursor.**

Rationale:
- Offset-based pagination (`OFFSET 12`, `OFFSET 24`, ...) can produce duplicate or skipped items if new wins are exhibited between page loads (common on a live public gallery).
- Cursor-based pagination avoids this by always fetching "the next 12 items older than the last seen item."

**Query shape:**
```sql
select id, raw_input, placard_body, category, background_id, exhibited_at
from wins
where exhibited = true
  and (exhibited_at, id) < (last_seen_exhibited_at, last_seen_id)
order by exhibited_at desc, id desc
limit 12;
```

- The first page omits the `and (...)` clause.
- The client stores the `exhibited_at` and `id` of the last item from the previous page and passes them as query params to `/api/exhibition` for the next "Load More" request.
- The `(exhibited_at, id)` composite ensures a stable sort order even if multiple wins share the same `exhibited_at` timestamp (unlikely but possible).

---

## 6. Data Lifecycle Summary

| Action | Effect on `wins` row | Effect on `reports` |
|---|---|---|
| Submit + "Add to My Museum" (not exhibited) | New row, `exhibited = false` | — |
| Submit + "Add to My Museum" (exhibit toggle on) | New row, `exhibited = true`, `exhibited_at = now()` | — |
| "Exhibit Publicly" (from Personal Museum) | `exhibited = true`, `exhibited_at = now()` | — |
| "Withdraw from Exhibition" | `exhibited = false` (`exhibited_at` left as-is) | — |
| "Remove from Collection" | Row deleted | Associated reports deleted via cascade |
| "Report this piece" | — | New row referencing `win_id` |

---

## 7. Notes for Future Updates
- If moderation becomes more active later (e.g. auto-hiding wins after N reports), this would require a new policy/trigger and should be documented here with justification, per `agents.md` 1.4.
- If the project ever needs to support editing an existing win's text (not currently in scope), this schema supports it trivially (`UPDATE raw_input, placard_text` via the existing owner policy) — but regenerating the placard on edit would need a defined behavior (regenerate vs. keep original) to be decided if/when this feature is considered.
