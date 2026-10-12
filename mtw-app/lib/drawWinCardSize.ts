/**
 * drawWinCardSize.ts — Museum of Tiny Wins
 *
 * Random, creation-time size assignment for Win Cards.
 * Called once when a win is created, in the same operation that draws
 * the card image and the category tag. The result is persisted as
 * `card_size` and never recomputed.
 *
 * Algorithm (§ 02-random-size-and-grid.md §1.3):
 *   1. Compute weight = quote.length + commentary.length
 *   2. Build the eligible pool: tiers whose capacity ≥ weight
 *   3. If pool is empty, use 'xl' (let the line clamp handle overflow)
 *   4. Weighted draw from pool: sm=20, md=40, lg=30, xl=10
 *   5. Anti-run reroll: if drawn tier matches both of the user's two
 *      most recent sizes, reroll once (once only)
 *
 * The function is pure: randomness is injectable via an optional `rng`
 * parameter, defaulting to Math.random. This makes it unit-testable
 * and lets the Style Guide demo produce a stable showcase via a seeded RNG.
 *
 * Usage (at creation time):
 *   import { drawWinCardSize } from "@/lib/drawWinCardSize";
 *   const cardSize = drawWinCardSize({
 *     quote: userInput.trim(),
 *     commentary: `${opener} ${closer}`,
 *     recentSizes: [lastWin?.card_size, secondLastWin?.card_size],
 *   });
 *
 * Usage (style guide, deterministic):
 *   const seeded = seedRng(42);
 *   const size = drawWinCardSize({ quote, commentary, rng: seeded });
 */

import { type WinCardSize } from "@/lib/winCardSize";

/* ─── Capacity per tier ──────────────────────────────────────────── */

/**
 * Maximum combined character count (quote + commentary) that each
 * tier can display before the line clamp truncates to nonsense.
 * From 02-random-size-and-grid.md §1.3 table.
 */
export const TIER_CAPACITY: Record<WinCardSize, number> = {
  sm: 60,
  md: 130,
  lg: 220,
  xl: 320,
};

/* ─── Draw weights ───────────────────────────────────────────────── */

/**
 * Probability weights for the weighted random draw.
 * md is the spine of the grid (40); xl is rare punctuation (10).
 * These are relative weights, not percentages — they are renormalised
 * over whichever tiers remain in the eligible pool.
 */
export const TIER_WEIGHTS: Record<WinCardSize, number> = {
  sm: 20,
  md: 40,
  lg: 30,
  xl: 10,
};

const ALL_TIERS: WinCardSize[] = ["sm", "md", "lg", "xl"];

/* ─── Seeded RNG helper ──────────────────────────────────────────── */

/**
 * Simple mulberry32 seeded PRNG. Returns a function that produces
 * deterministic values in [0, 1) — same sequence for same seed.
 * Use this for the Style Guide demo and for backfilling mock data
 * so sizes are stable across builds.
 */
export function seedRng(seed: number): () => number {
  let t = seed | 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Core draw function ─────────────────────────────────────────── */

export interface DrawWinCardSizeOptions {
  /** The user's raw input text (the headline / quote). */
  quote: string;
  /** The generated curator commentary (opener + closer). */
  commentary: string;
  /**
   * The user's two most recently created win sizes, newest first.
   * Used for anti-run reroll. Pass [] or omit if unavailable.
   */
  recentSizes?: (WinCardSize | undefined)[];
  /**
   * Injectable RNG function returning [0, 1).
   * Defaults to Math.random. Pass a seedRng() for deterministic output.
   */
  rng?: () => number;
}

/**
 * Draw a card size at creation time.
 *
 * @returns A WinCardSize token ('sm' | 'md' | 'lg' | 'xl')
 */
export function drawWinCardSize({
  quote,
  commentary,
  recentSizes = [],
  rng = Math.random,
}: DrawWinCardSizeOptions): WinCardSize {
  const weight = quote.length + commentary.length;

  // 1. Build the eligible pool: tiers whose capacity ≥ weight
  const eligible = ALL_TIERS.filter((tier) => TIER_CAPACITY[tier] >= weight);

  // 2. If pool is empty (text longer than xl capacity), force xl
  if (eligible.length === 0) {
    return "xl";
  }

  // 3. Weighted draw from the eligible pool
  const drawn = weightedDraw(eligible, rng);

  // 4. Anti-run reroll: if drawn matches both of the two most recent sizes
  const [prev1, prev2] = recentSizes;
  if (prev1 !== undefined && prev2 !== undefined && drawn === prev1 && drawn === prev2) {
    // Reroll once — could land on the same tier again, that's fine
    return weightedDraw(eligible, rng);
  }

  return drawn;
}

/* ─── Weighted draw helper ───────────────────────────────────────── */

/**
 * Picks a tier from the eligible pool using the TIER_WEIGHTS,
 * renormalised over whichever tiers are present.
 */
function weightedDraw(pool: WinCardSize[], rng: () => number): WinCardSize {
  // Sum the weights of eligible tiers
  let totalWeight = 0;
  for (const tier of pool) {
    totalWeight += TIER_WEIGHTS[tier];
  }

  // Roll
  let roll = rng() * totalWeight;
  for (const tier of pool) {
    roll -= TIER_WEIGHTS[tier];
    if (roll <= 0) {
      return tier;
    }
  }

  // Fallback (shouldn't reach here due to floating point, but safe)
  return pool[pool.length - 1];
}
