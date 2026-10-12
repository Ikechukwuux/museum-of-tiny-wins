/**
 * winCardSize.ts — Museum of Tiny Wins
 *
 * Pure, deterministic utility for assigning a Win Card size tier from
 * content weight. Zero side effects. No randomness — the jitter derives
 * from a stable hash of the win's id, so SSR and client always produce
 * the same result for the same input (no hydration mismatch).
 *
 * Size scale (§ 01-win-card-size-scale.md §1):
 *   sm  Vitrine  1:1   — short wins, rhythm breaker
 *   md  Portrait 3:4   — the default, most common
 *   lg  Panel    2:3   — longer wins, or a bit of gravity
 *   xl  Pillar   9:16  — rare feature; max 1 per ~12 cards
 *
 * Usage:
 *   import { getWinCardSize } from "@/lib/winCardSize";
 *   const size = getWinCardSize({ id: win.id, headline: win.headline, body: win.body });
 *
 * Usage with xl budget (recommended when rendering a list):
 *   const budget = { count: 0, cap: Math.max(1, Math.floor(total / 12)) };
 *   const wins = allWins.map(w => ({
 *     ...w,
 *     size: getWinCardSize({ id: w.id, headline: w.headline, body: w.body }, budget),
 *   }));
 */

export type WinCardSize = "sm" | "md" | "lg" | "xl";

/** The four aspect-ratio CSS values, keyed by size token. */
export const CARD_RATIOS: Record<WinCardSize, string> = {
  sm: "1 / 1",
  md: "3 / 4",
  lg: "2 / 3",
  xl: "9 / 16",
};

/**
 * The four CSS variable names for the card ratios.
 * Use these to reference the tokens in CSS / inline styles.
 */
export const CARD_RATIO_VARS: Record<WinCardSize, string> = {
  sm: "var(--mtw-card-ratio-sm)",
  md: "var(--mtw-card-ratio-md)",
  lg: "var(--mtw-card-ratio-lg)",
  xl: "var(--mtw-card-ratio-xl)",
};

/**
 * Museum names for each size token — for display in the style guide.
 */
export const CARD_SIZE_NAMES: Record<WinCardSize, string> = {
  sm: "Vitrine",
  md: "Portrait",
  lg: "Panel",
  xl: "Pillar",
};

/**
 * Text budget per tier (§ 01-win-card-size-scale.md §2).
 *
 * quoteFontSize    — in px, quote (Fraunces) font size
 * quoteLineHeight  — unitless line-height multiplier
 * quoteClamp       — max visible quote lines (-webkit-line-clamp)
 * bodyFontSize     — in px, curator commentary (Public Sans) font size
 * bodyLineHeight   — unitless line-height multiplier
 * bodyClamp        — max visible commentary lines
 */
export interface TextBudget {
  quoteFontSize: number;
  quoteLineHeight: number;
  quoteClamp: number;
  bodyFontSize: number;
  bodyLineHeight: number;
  bodyClamp: number;
}

export const TEXT_BUDGET: Record<WinCardSize, TextBudget> = {
  sm: { quoteFontSize: 18, quoteLineHeight: 1.25, quoteClamp: 2, bodyFontSize: 13, bodyLineHeight: 1.45, bodyClamp: 1 },
  md: { quoteFontSize: 20, quoteLineHeight: 1.25, quoteClamp: 3, bodyFontSize: 13, bodyLineHeight: 1.45, bodyClamp: 1 },
  lg: { quoteFontSize: 22, quoteLineHeight: 1.22, quoteClamp: 4, bodyFontSize: 14, bodyLineHeight: 1.45, bodyClamp: 1 },
  xl: { quoteFontSize: 24, quoteLineHeight: 1.20, quoteClamp: 5, bodyFontSize: 14, bodyLineHeight: 1.45, bodyClamp: 2 },
};

/**
 * Content-weight thresholds that drive base tier assignment
 * (§ 01-win-card-size-scale.md §3).
 *
 *   weight ≤  60  →  'sm'
 *   weight ≤ 130  →  'md'
 *   weight ≤ 220  →  'lg'
 *   weight >  220  →  'xl'
 */
const THRESHOLDS: [number, WinCardSize][] = [
  [60, "sm"],
  [130, "md"],
  [220, "lg"],
];

const SIZE_ORDER: WinCardSize[] = ["sm", "md", "lg", "xl"];

/**
 * Stable djb2-family hash of a win id.
 * Same input always → same output. Safe for SSR + client.
 *
 * @param id  numeric or string win id
 * @returns   a non-negative 31-bit integer
 */
export function hashId(id: string | number): number {
  const str = String(id);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  // Force positive, keep as 31-bit value
  return hash >>> 0;
}

/**
 * Xl budget tracker. Pass a mutable object to getWinCardSize when
 * rendering a list so the xl cap is enforced across the set.
 *
 * cap — maximum xl cards allowed (default: floor(total / 12), min 1)
 * count — running count of xl cards already assigned (start at 0)
 */
export interface XlBudget {
  count: number;
  cap: number;
}

/**
 * Assign a Win Card size tier from content + a stable id hash.
 *
 * Algorithm:
 *   1. Compute weight = headline.length + body.length
 *   2. Derive base tier from thresholds
 *   3. Use hashId(id) % 4 === 0 to bump the tier UP one step (~1 in 4)
 *      — never bump down; down-bumps would truncate text
 *   4. If resulting tier is 'xl' and xlBudget is provided and cap is
 *      exhausted, demote to 'lg'
 *
 * @param win        object with id, headline, and body
 * @param xlBudget   optional mutable tracker for the xl cap
 */
export function getWinCardSize(
  win: { id: string | number; headline: string; body: string },
  xlBudget?: XlBudget,
): WinCardSize {
  const weight = win.headline.length + win.body.length;

  // 1. Base tier from content weight
  let baseIndex = SIZE_ORDER.indexOf("xl"); // default if weight > 220
  for (const [threshold, tier] of THRESHOLDS) {
    if (weight <= threshold) {
      baseIndex = SIZE_ORDER.indexOf(tier);
      break;
    }
  }

  // 2. Deterministic jitter — bump UP ~1 in 4 cards
  const hash = hashId(win.id);
  const shouldBump = hash % 4 === 0;
  const bumpedIndex = shouldBump
    ? Math.min(baseIndex + 1, SIZE_ORDER.length - 1)
    : baseIndex;

  const size = SIZE_ORDER[bumpedIndex];

  // 3. xl cap enforcement
  if (size === "xl" && xlBudget !== undefined) {
    if (xlBudget.count >= xlBudget.cap) {
      return "lg";
    }
    xlBudget.count += 1;
  }

  return size;
}

/**
 * Compute the CSS grid-row-end span value for a given size and breakpoint.
 *
 * The grid uses grid-auto-rows: 4px.
 * N = round((colWidth + gutter) / ratio / 4)
 *
 * Where ratio is expressed as width/height decimal (e.g. 3/4 = 0.75).
 * Adding gutter ensures the bottom gap is absorbed into the span height.
 *
 * @param size      WinCardSize token
 * @param colWidth  column pixel width for the current breakpoint
 * @param gutter    gutter pixel value for the current breakpoint
 */
export function getMasonrySpan(
  size: WinCardSize,
  colWidth: number,
  gutter: number,
): number {
  const RATIO_DECIMAL: Record<WinCardSize, number> = {
    sm: 1 / 1,
    md: 3 / 4,
    lg: 2 / 3,
    xl: 9 / 16,
  };
  const ratio = RATIO_DECIMAL[size];
  // height of the card + gutter, rounded to 4px grid
  return Math.round((colWidth / ratio + gutter) / 4);
}
