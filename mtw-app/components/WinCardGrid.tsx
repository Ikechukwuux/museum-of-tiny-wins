/**
 * WinCardGrid — Museum of Tiny Wins
 *
 * A salon-hung masonry wall built with CSS Grid row spans. No JS
 * measurement, no layout shift (CLS ≈ 0), correct DOM order.
 *
 * Layout mechanism (02-random-size-and-grid.md §2.2, extended):
 *   grid-auto-rows: 1px; row-gap: 0;
 *   Each item: span = round(W * h/w) + G + O
 *
 *   H    = round(W * h/w)      — card height, from the tier's aspect ratio
 *   G    — vertical gutter (looser than the horizontal gap, so the wall
 *          breathes vertically like a gallery hang)
 *   O    — "salon" offset, applied only to the first card in a column so
 *          the wall does not begin on one rigid baseline
 *
 *   The card sits at the top of its grid area (after the O offset), and the
 *   remaining G pixels at the bottom ARE the vertical gutter. Every item
 *   carries exactly one gutter, so spacing is uniform by construction and
 *   no item can ever overlap.
 *
 *   margin-bottom: -G on the container absorbs the trailing gutter on the
 *   last row.
 *
 * Salon hang: the second column sits highest (offset 0), the first hangs a
 * little lower, the third deepest, the fourth its own subtle offset — a
 * deliberate, tidy silhouette, not a random Pinterest layout.
 *
 * Breakpoint column specs (columns are a fixed width per breakpoint):
 *   < 640px   full width, 1 column — cards clamp to md (3:4)
 *   ≥ 640px   2 columns × 280px — gap-x 20px, gutter 28px
 *   ≥ 1024px  3 columns × 280px — gap-x 24px, gutter 36px
 *   ≥ 1280px  4 columns × 280px — gap-x 24px, gutter 40px
 *
 * DOM semantics:
 *   role="list" on the <ol> container.
 *   role="listitem" on each <li> wrapper.
 *   DOM order = visual left→right, top→bottom reading order.
 *
 * skills.md ref: B.1 (single base component, variant props)
 * agents.md ref: §2.4 (no client-side measurement, no new JS libraries)
 */

import WinCard, { type WinCardVariant } from "@/components/WinCard";
import { type WinCardSize } from "@/lib/winCardSize";
import { type BackgroundId } from "@/components/WinCard";

/* ─── Types ──────────────────────────────────────────────────────── */

export interface WinCardGridItem {
  id: string | number;
  variant: WinCardVariant;
  backgroundId: BackgroundId;
  category: string;
  date: string;
  headline: string;
  body: string;

  size: WinCardSize;
  isExhibited?: boolean;
  onOpenDetail?: () => void;
}

export interface WinCardGridProps {
  items: WinCardGridItem[];
  className?: string;
}

/* ─── Exact span + height constants ──────────────────────────────── */

type Breakpoint = "bp640" | "bp1024" | "bp1280";

/**
 * Column width W (card width) per breakpoint.
 * Columns are fixed width so the row-span math is exact and the text
 * budgets are provable.
 */
const COL_WIDTH: Record<Breakpoint, number> = {
  bp640: 280,
  bp1024: 280,
  bp1280: 280,
};

/**
 * Vertical gutter G per breakpoint — intentionally looser than the
 * horizontal gap (see .win-card-masonry-grid column-gap in globals.css).
 */
const GUTTER: Record<Breakpoint, number> = {
  bp640: 28,
  bp1024: 36,
  bp1280: 40,
};

/** Number of columns per breakpoint (mirrors globals.css grid-template-columns). */
const COLUMNS: Record<Breakpoint, number> = {
  bp640: 2,
  bp1024: 3,
  bp1280: 4,
};

/**
 * Salon-hang top offset (px) per column index, per breakpoint.
 * Column 0 hangs a little low, column 1 is highest, column 2 is deepest,
 * column 3 (large desktop only) gets its own subtle offset.
 */
const SALON_OFFSET: Record<Breakpoint, number[]> = {
  bp640: [16, 0],
  bp1024: [24, 0, 48],
  bp1280: [24, 0, 48, 12],
};

/* Height multiplier (h/w) per tier, from the aspect ratio. */
const RATIO_H_W: Record<WinCardSize, number> = {
  sm: 1, // 1 / 1
  md: 4 / 3, // 3 / 4
  lg: 3 / 2, // 2 / 3
  xl: 16 / 9, // 9 / 16
};

function computeHeight(W: number, size: WinCardSize): number {
  return Math.round(W * RATIO_H_W[size]);
}

function buildSpanTable(): Record<Breakpoint, Record<WinCardSize, number>> {
  const table = {} as Record<Breakpoint, Record<WinCardSize, number>>;
  (Object.keys(COL_WIDTH) as Breakpoint[]).forEach((bp) => {
    table[bp] = {} as Record<WinCardSize, number>;
    (["sm", "md", "lg", "xl"] as WinCardSize[]).forEach((size) => {
      table[bp][size] = computeHeight(COL_WIDTH[bp], size) + GUTTER[bp];
    });
  });
  return table;
}

function buildHeightTable(): Record<Breakpoint, Record<WinCardSize, number>> {
  const table = {} as Record<Breakpoint, Record<WinCardSize, number>>;
  (Object.keys(COL_WIDTH) as Breakpoint[]).forEach((bp) => {
    table[bp] = {} as Record<WinCardSize, number>;
    (["sm", "md", "lg", "xl"] as WinCardSize[]).forEach((size) => {
      table[bp][size] = computeHeight(COL_WIDTH[bp], size);
    });
  });
  return table;
}

/**
 * Pre-computed spans and card heights (see the derivation in the header).
 *
 * Verified by hand:
 *   ≥640px  (W=280, G=28):  sm 308 / 280 · md 401 / 373 · lg 448 / 420 · xl 526 / 498
 *   ≥1024px (W=280, G=36):  sm 316 / 280 · md 409 / 373 · lg 456 / 420 · xl 534 / 498
 *   ≥1280px (W=280, G=40):  sm 320 / 280 · md 413 / 373 · lg 460 / 420 · xl 538 / 498
 */
const SPAN = buildSpanTable();
const HEIGHT = buildHeightTable();

/* ─── Span + height + salon-offset style helper ──────────────────── */

/**
 * Returns an inline style object that sets, per breakpoint:
 *   - grid-row-end span (card height + gutter + salon offset)
 *   - element height (card height + salon offset, border-box)
 *   - padding-top (the salon offset — zero for non-first-in-column items)
 *   - stagger delay for the entrance animation
 */
function getItemStyle(size: WinCardSize, index: number): React.CSSProperties {
  const style: Record<string, string | number> = {
    // Stagger entrance animation delay: 50ms per card, max 600ms
    "--_delay": `${Math.min(index * 50, 600)}ms`,
  };

  (Object.keys(COLUMNS) as Breakpoint[]).forEach((bp) => {
    const cols = COLUMNS[bp];
    const isFirst = index < cols;
    const offset = isFirst ? (SALON_OFFSET[bp][index] ?? 0) : 0;
    style[`--_span-${bp}`] = SPAN[bp][size] + offset;
    style[`--_h-${bp}`] = `${HEIGHT[bp][size] + offset}px`;
    style[`--_pad-${bp}`] = `${offset}px`;
  });

  return style as React.CSSProperties;
}

/* ─── Skeleton ─────────────────────────────────────────────────── */

/**
 * WinCardGridSkeleton — loading state that mirrors the real grid.
 * Uses the same span table and salon offsets so skeletons occupy the exact
 * final footprint.
 */
export function WinCardGridSkeleton({
  sizes = ["md", "lg", "sm", "xl", "md", "lg", "sm", "md"] as WinCardSize[],
  className = "",
}: {
  sizes?: WinCardSize[];
  className?: string;
}) {
  return (
    <ol
      role="list"
      className={`win-card-masonry-grid ${className}`}
      aria-busy="true"
      aria-label="Loading exhibits…"
    >
      {sizes.map((size, i) => (
        <li
          key={i}
          role="listitem"
          className={`win-card-masonry-item win-card-masonry-item--${size}`}
          style={{
            ...getItemStyle(size, i),
            borderRadius: "var(--radius)",
            overflow: "hidden",
            background:
              "color-mix(in srgb, var(--color-parchment) 80%, var(--color-gilt) 8%)",
            border: "1px solid color-mix(in srgb, var(--color-gilt) 25%, transparent)",
          }}
        />
      ))}
    </ol>
  );
}

/* ─── Component ──────────────────────────────────────────────────── */

export default function WinCardGrid({ items, className = "" }: WinCardGridProps) {
  if (items.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "6rem 2rem",
          color: "color-mix(in srgb, var(--color-ink) 45%, transparent)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            marginBottom: "0.75rem",
          }}
        >
          The collection is currently between acquisitions.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>
          No exhibits have been catalogued yet. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <ol
      role="list"
      className={`win-card-masonry-grid ${className}`}
      aria-label="Exhibition of tiny wins"
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          role="listitem"
          className={`win-card-masonry-item win-card-masonry-item--${item.size}`}
          style={getItemStyle(item.size, index)}
        >
          <WinCard
            variant={item.variant}
            backgroundId={item.backgroundId}
            category={item.category}
            date={item.date}
            headline={item.headline}
            body={item.body}

            size={item.size}
            isExhibited={item.isExhibited}
            onOpenDetail={item.onOpenDetail}
          />
        </li>
      ))}
    </ol>
  );
}
