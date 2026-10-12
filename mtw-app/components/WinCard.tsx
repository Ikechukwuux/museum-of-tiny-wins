/**
 * WinCard — Museum of Tiny Wins
 *
 * Full-bleed background image, text overlaid directly on it via gradient
 * scrims. Three variants share one base component (skills.md B.1).
 *
 * Visual structure:
 *   • Background image fills the entire card (12px radius) with a light
 *     CSS blur pass to unify the already-soft photography.
 *   • Gilt border traces the full card perimeter on top of everything.
 *   • Top scrim: short, light — floats the category/accession meta row.
 *   • Bottom scrim: deeper, ~60% of card height — carries headline,
 *     body, and footer stamp. Scrim tone adapts per image (light/dark).
 *   • All text overlaid directly on the scrims, no separate panel.
 *
 * Variant differences (behavioral only — same visual structure):
 *   "hero"     — non-interactive, decorative; used on Landing page.
 *   "public"   — hover lift + shadow; onClick stubs onOpenDetail.
 *   "personal" — same interactivity as public, warmer/deeper gilt.
 *
 * copy.md refs: §7.1 (headline), §7.8 (universal copy elements)
 */

"use client";

import Image from "next/image";
import { type WinCardSize, TEXT_BUDGET, CARD_RATIOS } from "@/lib/winCardSize";

/* ─── Types ──────────────────────────────────────────────────────── */

export type WinCardVariant = "hero" | "public" | "personal";
export type ScrimTone = "light" | "dark";
export type BackgroundId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27;
export type { WinCardSize };

export interface WinCardProps {
  variant: WinCardVariant;

  /** 1–27 — maps to /card-background-images/card-bg-{id}.jpg */
  backgroundId: BackgroundId;

  /** Category tag label (e.g. "Quiet Victory") — copy.md §7.4 */
  category: string;

  /**
   * Creation date string, "YYYY-MM-DD", rendered in the footer stamp as
   * "PERMANENT COLLECTION . YYYY . MM . DD". copy.md §7.8
   */
  date: string;

  /**
   * The user's raw input, displayed in quotation marks as the headline.
   * copy.md §7.1
   */
  headline: string;

  /** Generated placard body (opener + closer) — copy.md §7.2–7.3 */
  body: string;

  /**
   * Called when a "public" or "personal" card is clicked.
   * WinDetailModal stub — no-op if not provided.
   */
  onOpenDetail?: () => void;

  /** Optional class for sizing/layout at the usage site. */
  className?: string;

  /**
   * Size tier — controls aspect ratio and text budget.
   * Four closed tiers (size-scale spec §1–2):
   *   'sm'  Vitrine  1:1   — short wins
   *   'md'  Portrait 3:4   — default, most common
   *   'lg'  Panel    2:3   — longer wins
   *   'xl'  Pillar   9:16  — rare feature card
   *
   * Default: 'md'. Do not add intermediate sizes.
   * This prop is orthogonal to `variant` — context vs. height.
   */
  size?: WinCardSize;

  /**
   * Override the card's CSS aspect-ratio string directly.
   * Use "1 / 2" for the tall editorial layout variant (WhatThisIs right column),
   * or "auto" to fill a parent of fixed height.
   *
   * When both `size` and `aspectRatio` are provided, `aspectRatio` wins.
   * This ensures backward compat with existing hero / WTI usages.
   */
  aspectRatio?: string;

  /** Used for Personal variant to show an exhibited state overlay/style if needed */
  isExhibited?: boolean;
}

/* ─── Background image metadata ─────────────────────────────────── */

/**
 * Per-image metadata. scrimTone is assigned by visual inspection:
 *   "light" → image is pale/bright → scrim fades to parchment, ink text
 *   "dark"  → image is moody/saturated dark → scrim fades to ink, cream text
 */
const BG_METADATA: Record<
  number,
  { src: string; scrimTone: ScrimTone }
> = {
  1:  { src: "/card-background-images/card-bg-1.jpg",  scrimTone: "light" },
  2:  { src: "/card-background-images/card-bg-2.jpg",  scrimTone: "light" },
  3:  { src: "/card-background-images/card-bg-3.jpg",  scrimTone: "dark"  },
  4:  { src: "/card-background-images/card-bg-4.jpg",  scrimTone: "light" },
  5:  { src: "/card-background-images/card-bg-5.jpg",  scrimTone: "light" },
  6:  { src: "/card-background-images/card-bg-6.jpg",  scrimTone: "light" },
  7:  { src: "/card-background-images/card-bg-7.jpg",  scrimTone: "light" },
  8:  { src: "/card-background-images/card-bg-8.jpg",  scrimTone: "light" },
  9:  { src: "/card-background-images/card-bg-9.jpg",  scrimTone: "light" },
  10: { src: "/card-background-images/card-bg-10.jpg", scrimTone: "light" },
  11: { src: "/card-background-images/card-bg-11.jpg", scrimTone: "dark"  },
  12: { src: "/card-background-images/card-bg-12.jpg", scrimTone: "dark"  },
  13: { src: "/card-background-images/card-bg-13.jpg", scrimTone: "light" },
  14: { src: "/card-background-images/card-bg-14.jpg", scrimTone: "light" },
  15: { src: "/card-background-images/card-bg-15.jpg", scrimTone: "dark"  },
  16: { src: "/card-background-images/card-bg-16.jpg", scrimTone: "light" },
  17: { src: "/card-background-images/card-bg-17.jpg", scrimTone: "light" },
  18: { src: "/card-background-images/card-bg-18.jpg", scrimTone: "dark"  },
  19: { src: "/card-background-images/card-bg-19.jpg", scrimTone: "dark"  },
  20: { src: "/card-background-images/card-bg-20.jpg", scrimTone: "light" },
  21: { src: "/card-background-images/card-bg-21.jpg", scrimTone: "dark"  },
  22: { src: "/card-background-images/card-bg-22.jpg", scrimTone: "light" },
  23: { src: "/card-background-images/card-bg-23.jpg", scrimTone: "light" },
  24: { src: "/card-background-images/card-bg-24.jpg", scrimTone: "dark"  },
  25: { src: "/card-background-images/card-bg-25.jpg", scrimTone: "dark"  },
  26: { src: "/card-background-images/card-bg-26.jpg", scrimTone: "light" },
  27: { src: "/card-background-images/card-bg-27.jpg", scrimTone: "dark"  },
};

/* ─── Scrim colours ─────────────────────────────────────────────── */

const SCRIM = {
  light: {
    /* Bottom scrim: fades from transparent → parchment */
    bottomGradient:
      "linear-gradient(to top, rgba(241,235,220,0.97) 0%, rgba(241,235,220,0.88) 30%, rgba(241,235,220,0.45) 55%, transparent 100%)",
    /* Top scrim: a whisper of parchment for the meta row */
    topGradient:
      "linear-gradient(to bottom, rgba(241,235,220,0.72) 0%, rgba(241,235,220,0.35) 60%, transparent 100%)",
    text: "var(--color-ink)",           /* #2B2823 */
    textMuted: "rgba(43,40,35,0.65)",
    textFaint: "rgba(43,40,35,0.45)",
    tagColor: "var(--color-gilt)",
    metaColor: "rgba(43,40,35,0.55)",
  },
  dark: {
    /* Bottom scrim: fades from transparent → ink */
    bottomGradient:
      "linear-gradient(to top, rgba(43,40,35,0.96) 0%, rgba(43,40,35,0.82) 30%, rgba(43,40,35,0.40) 55%, transparent 100%)",
    /* Top scrim: a faint ink wash for the meta row */
    topGradient:
      "linear-gradient(to bottom, rgba(43,40,35,0.60) 0%, rgba(43,40,35,0.28) 60%, transparent 100%)",
    text: "var(--color-cream)",          /* #FAF6EF */
    textMuted: "rgba(250,246,239,0.78)",
    textFaint: "rgba(250,246,239,0.50)",
    tagColor: "var(--color-gilt)",
    metaColor: "rgba(250,246,239,0.55)",
  },
} as const;

/* ─── Variant gilt colours ──────────────────────────────────────── */

const GILT_COLOR: Record<WinCardVariant, string> = {
  hero:     "var(--color-gilt)",   /* standard #B8934A */
  public:   "var(--color-gilt)",
  personal: "#A67C3A",             /* deeper, warmer — reinforces ownership */
};

/* ─── Component ──────────────────────────────────────────────────── */

export default function WinCard({
  variant,
  backgroundId,
  category,
  date,
  headline,
  body,
  
  onOpenDetail,
  className = "",
  size = "md",
  aspectRatio,
}: WinCardProps) {
  const isInteractive = variant === "public" || variant === "personal";
  const bg = BG_METADATA[backgroundId] ?? BG_METADATA[1];
  const scrim = SCRIM[bg.scrimTone];
  const giltColor = GILT_COLOR[variant];

  /* ── Size-derived values ────────────────────────────────────────── */
  // aspectRatio prop wins for backward compat (hero carousel, WTI tall card).
  // Otherwise derive from the size token.
  const resolvedAspectRatio = aspectRatio ?? CARD_RATIOS[size];
  const budget = TEXT_BUDGET[size];

  /* ── Inline hover handlers (no className dance needed) ─────────── */
  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    if (!isInteractive) return;
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${giltColor}, 0 18px 48px color-mix(in srgb, ${giltColor} 15%, rgba(0,0,0,0.18)), 0 4px 12px rgba(0,0,0,0.06)`;
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    if (!isInteractive) return;
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${giltColor}`;
  }

  return (
    <div
      className={className}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `View details for: ${headline}` : undefined}
      onClick={isInteractive ? onOpenDetail : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpenDetail?.();
        }
      }}
      style={{
        boxSizing: "border-box",
        position: "relative",
        containerType: "inline-size",
        borderRadius: "var(--radius)",
        /* Gilt border drawn inside the box to guarantee exact dimensions (Fix A) */
        boxShadow: `inset 0 0 0 2px ${giltColor}`,
        aspectRatio: resolvedAspectRatio,
        width: "100%",
        height: "100%",
        cursor: isInteractive ? "pointer" : "default",
        transition: isInteractive
          ? "transform 300ms ease-out, box-shadow 300ms ease-out"
          : "none",
      }}
    >
      {/* ── Image Mask (prevents image bleeding past border radius) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "var(--radius)",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* ── Background image — blurred for a unified painterly feel ── */}
      <div
        style={{
          position: "absolute",
          inset: /* extend slightly to hide blur edge halos */
            "-8px",
          filter: "blur(2px)",
          /* scale up slightly to fill the inset-extended container */
          transform: "scale(1.08)",
        }}
      >
        <Image
          src={bg.src}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          priority={variant === "hero"}
        />
      </div>

      {/* ── Top scrim — floats the meta row ──────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "28%",
          background: scrim.topGradient,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* ── Gilt inner ring — visible over the image ─────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "calc(var(--radius) - 1px)",
          border: `2px solid color-mix(in srgb, ${giltColor} 70%, transparent)`,
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* ── Top meta row ─────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "clamp(0.75rem, 5cqw, 1.125rem)",
        }}
      >
        <span
          className="text-scale-label"
          style={{ 
            color: scrim.tagColor,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: "clamp(0.55rem, 3cqw, 0.65rem)"
          }}
        >
          {category.toUpperCase()}
        </span>
      </div>

      {/* ── Bottom scrim + text block (combined) ─────────────────── */}
      {/*
       * The scrim is now a background gradient on the text container
       * itself, so it grows upward as the text wraps to more lines.
       * maxHeight caps the text area at 75% of the card to always
       * leave some image visible at the top.
       */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "80%",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "clamp(0.875rem, 6cqw, 1.25rem)",
          paddingTop: "clamp(2.5rem, 14cqw, 4rem)",
          gap: "clamp(0.35rem, 2cqw, 0.5rem)",
          background: scrim.bottomGradient,
          borderRadius: "0 0 var(--radius) var(--radius)",
          pointerEvents: "none",
        }}
      >
        {/* 1. Headline — raw win in quotation marks, bold Fraunces.
             No line clamp — text wraps naturally within the card.
             The scrim expands upward to accommodate. */}
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: `${budget.quoteFontSize}px`,
            fontWeight: 700,
            lineHeight: budget.quoteLineHeight,
            color: scrim.text,
            margin: 0,
            overflow: "hidden",
          }}
        >
          &ldquo;{headline}&rdquo;
        </p>

        {/* 2. Body — curator commentary (Public Sans), wraps naturally. */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: `${budget.bodyFontSize}px`,
            lineHeight: budget.bodyLineHeight,
            color: scrim.textMuted,
            margin: 0,
            overflow: "hidden",
          }}
        >
          {body}
        </p>

        {/* 3. Footer stamp — low-hierarchy, ~50% opacity */}
        <p
          className="text-scale-label"
          style={{
            color: scrim.textFaint,
            margin: 0,
            marginTop: "0.2rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: "clamp(0.5rem, 2.7cqw, 0.6rem)",
          }}
        >
          PERMANENT COLLECTION . {date.replace(/-/g, ' . ')}
        </p>
      </div>
      </div>
    </div>
  );
}
