"use client";

/**
 * WhatThisIs — Museum of Tiny Wins — "The Curator's Introduction"
 *
 * Asymmetric editorial spread strictly matching the layout composition of the reference:
 *
 * Desktop (1024px+):
 * ┌───────────────────────────────────────────────┬──────────────────────┐
 * │  ┌───────────────┐   ┌─────────────────────┐  │                      │
 * │  │  LEFT CARD    │   │  WHAT THIS IS       │  │                      │
 * │  │  (Compact     │   │  Heading            │  │      TALL RIGHT      │
 * │  │   3:4 ratio)  │   │  Body copy          │  │      WIN CARD        │
 * │  └───────────────┘   └─────────────────────┘  │      (Dominant 1:2   │
 * │                                               │       aspect ratio   │
 * │  Why This Exists                              │       spanning full  │
 * │  ───────────────────────────────────────────  │       height of      │
 * │  ┌───────────────────┐ ┌───────────────────┐  │       section)       │
 * │  │ Feature Block 1   │ │ Feature Block 2   │  │                      │
 * │  └───────────────────┘ └───────────────────┘  │                      │
 * └───────────────────────────────────────────────┴──────────────────────┘
 *
 * Mobile (<768px) — Intentional editorial composition, NOT a stacked desktop:
 *   ★ WHAT THIS IS (centered heading + body)
 *   ↓
 *   Win Card 1 (3:4, comfortable margins)
 *   ↓
 *   Win Card 2 (3:4 on mobile, not 1:2)
 *   ↓
 *   Why This Exists (left-aligned, stacked blocks with dividers)
 */

import { motion } from "framer-motion";
import WinCard from "@/components/WinCard";
import { MUSEUM_EASE, VIEWPORT_ONCE } from "@/lib/motion";

/* ── Motion animation specs (using shared museum motion language) ── */

/* ── Curated exhibit data (approved sample wins — copy.md §2.6) ──── */
const LEFT_CARD = {
  backgroundId: 6 as const,
  category: "Quiet Victory",
  date: "2026-08-30",
  headline: "drank water before coffee",
  body: "Newly catalogued for the permanent collection. Filed under: small, but not nothing.",
  
};

const RIGHT_CARD = {
  backgroundId: 3 as const,
  category: "Digital Preservation",
  date: "2026-08-30",
  headline: "replied to that scary email",
  body: "Recovered from the archives after a period of careful deliberation. The subject composed a response. Curators confirm the email was, in fact, replied to. Visitors are encouraged to sit with this one for a moment.",
  
};

/* ── Secondary info blocks ("Why This Exists") ───────────────────── */
const SECONDARY_BLOCKS = [
  {
    heading: "Small moments, preserved.",
    body: "Most victories disappear the moment they happen. We give them somewhere permanent to live.",
  },
  {
    heading: "Curation without judgment.",
    body: "No achievement too small. No win too ordinary. If you felt it, it belongs in the collection.",
  },
];

export default function WhatThisIs() {
  return (
    <section
      id="what-this-is"
      className="relative w-full overflow-hidden pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-6 md:pb-8 lg:pb-10"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* ══════════════════════════════════════════════════════════════
            MAIN 2-COLUMN EDITORIAL SPREAD (desktop)
            Left 7 columns: Compact card + Copy + Why This Exists
            Right 5 columns: Tall dominant WinCard

            MOBILE: single column, intentional editorial order —
            Copy → Card 1 → Card 2 → Why This Exists
            ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ── LEFT & CENTER MAIN CONTENT (7 Cols on desktop) ────── */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-0 lg:space-y-16">
            
            {/* TOP ROW: On desktop — Compact Card (left) + Editorial Copy (right/center)
                On mobile — Editorial Copy only (cards are rendered separately below) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-start">
              
              {/* Left Compact Card — HIDDEN on mobile, visible on desktop only */}
              <motion.div
                className="hidden lg:block lg:col-span-5 w-full"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.65, delay: 0.15, ease: MUSEUM_EASE }}
              >
                <WinCard
                  variant="public"
                  backgroundId={LEFT_CARD.backgroundId}
                  category={LEFT_CARD.category}
                  date="2026-08-30"
                  headline={LEFT_CARD.headline}
                  body={LEFT_CARD.body}
                  
                  aspectRatio="3 / 4"
                />
              </motion.div>

              {/* Center Editorial Content — centered on mobile, left-aligned on desktop */}
              <motion.div
                className="lg:col-span-7 flex flex-col justify-start pt-0 lg:pt-1"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.65, delay: 0.05, ease: MUSEUM_EASE }}
              >
                {/* Overline Label */}
                <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                  <span className="text-gilt text-xs select-none">★</span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "color-mix(in srgb, var(--color-ink) 50%, transparent)",
                    }}
                  >
                    WHAT THIS IS
                  </span>
                </div>

                {/* Headline — copy.md §2.8 verbatim */}
                <h2
                  className="text-center lg:text-left"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.85rem, 3.2vw, 2.75rem)",
                    lineHeight: 1.12,
                    fontWeight: 400,
                    color: "var(--color-ink)",
                    margin: "0 0 1.25rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Your small wins{" "}
                  <span style={{ fontStyle: "italic", fontWeight: 500 }}>
                    deserve a frame.
                  </span>
                </h2>

                {/* Body — copy.md §2.8 verbatim */}
                <p
                  className="text-center lg:text-left"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "clamp(0.925rem, 1.1vw, 1.025rem)",
                    lineHeight: 1.7,
                    color: "color-mix(in srgb, var(--color-ink) 72%, transparent)",
                    margin: "0 0 1.25rem",
                  }}
                >
                  Most apps track your goals. This one celebrates what you already
                  did — even the tiny, forgettable things. You write it down, we
                  make it look important.
                </p>

                {/* Italic statement — copy.md §2.8 */}
                <p
                  className="text-center lg:text-left"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(0.95rem, 1.2vw, 1.075rem)",
                    lineHeight: 1.5,
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "color-mix(in srgb, var(--color-ink) 50%, transparent)",
                    margin: 0,
                  }}
                >
                  Because sometimes &ldquo;drank water before coffee&rdquo; is enough.
                </p>
              </motion.div>
            </div>

            {/* ── MOBILE WIN CARDS — visible only below lg ──────────── */}
            {/* These render the same WinCard data as the desktop layout,
                but in the mobile editorial order (copy → card → card → why)
                and with balanced 3:4 aspect ratios for both cards. */}

            {/* Card 1 — LEFT_CARD on mobile */}
            <motion.div
              className="lg:hidden w-full mt-10"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.65, delay: 0.0, ease: MUSEUM_EASE }}
            >
              <WinCard
                variant="public"
                backgroundId={LEFT_CARD.backgroundId}
                category={LEFT_CARD.category}
                date="2026-08-30"
                headline={LEFT_CARD.headline}
                body={LEFT_CARD.body}
                
                aspectRatio="3 / 4"
              />
            </motion.div>

            {/* Card 2 — RIGHT_CARD on mobile (CSS override forces 3:4) */}
            <motion.div
              className="lg:hidden w-full wti-mobile-card mt-8"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.65, delay: 0.1, ease: MUSEUM_EASE }}
            >
              <WinCard
                variant="public"
                backgroundId={RIGHT_CARD.backgroundId}
                category={RIGHT_CARD.category}
                date="2026-08-30"
                headline={RIGHT_CARD.headline}
                body={RIGHT_CARD.body}
                
                aspectRatio="1 / 2"
              />
            </motion.div>

            {/* SECONDARY ROW — "Why This Exists" */}
            <motion.div
              className="pt-8 border-t mt-16 lg:mt-0"
              style={{ borderColor: "color-mix(in srgb, var(--color-ink) 12%, transparent)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.65, delay: 0.2, ease: MUSEUM_EASE }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: "var(--color-ink)",
                  margin: "0 0 1.75rem",
                  letterSpacing: "-0.01em",
                }}
              >
                Why This Exists
              </h3>

              {/* Desktop: side-by-side | Mobile: stacked with subtle dividers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
                {SECONDARY_BLOCKS.map((block, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    {/* Divider between blocks on mobile only */}
                    {i > 0 && (
                      <div
                        className="lg:hidden"
                        style={{
                          borderTop: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)",
                          marginBottom: "1.25rem",
                          marginTop: "1.25rem",
                        }}
                        aria-hidden="true"
                      />
                    )}
                    <h4
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1rem, 1.3vw, 1.125rem)",
                        fontWeight: 500,
                        color: "var(--color-ink)",
                        margin: 0,
                      }}
                    >
                      {block.heading}
                    </h4>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.9rem",
                        lineHeight: 1.65,
                        color: "color-mix(in srgb, var(--color-ink) 65%, transparent)",
                        margin: 0,
                      }}
                    >
                      {block.body}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* ── RIGHT COLUMN: Dominant Tall WinCard (5 Cols on desktop) ── */}
          {/* Hidden on mobile — the mobile card instances above handle that viewport */}
          <motion.div
            className="hidden lg:flex lg:col-span-5 w-full flex-col justify-start"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.65, delay: 0.25, ease: MUSEUM_EASE }}
          >
            <WinCard
              variant="public"
              backgroundId={RIGHT_CARD.backgroundId}
              category={RIGHT_CARD.category}
              date="2026-08-30"
              headline={RIGHT_CARD.headline}
              body={RIGHT_CARD.body}
              
              aspectRatio="1 / 2"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
