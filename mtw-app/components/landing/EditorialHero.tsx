"use client";

/**
 * EditorialHero — Museum of Tiny Wins
 *
 * A manually composed, fixed-height hero with:
 *   A. Left — serif headline, tagline, single primary CTA
 *   B. Right — art-directed 4-card cluster (not a feed/masonry wall)
 *
 * The card cluster is a bounded editorial composition that begins
 * high under the header and resolves within one desktop viewport.
 * Card positions are manually placed, not auto-flowed.
 *
 * Composition intent (see HERO_CARDS below):
 *   • One anchor card (largest, light) — top-left, the dominant piece. Its
 *     left edge intrudes slightly into the center gap toward the copy block,
 *     so the two halves of the hero speak to each other without moving the
 *     whole cluster.
 *   • One dark counterweight — top-right, hung lower than the anchor.
 *   • Two supporting exhibits — tucked beneath on a diagonal: the bottom-left
 *     sits at the column edge while the bottom-right is hung lower still, so
 *     the cluster reads as a curated hang, not a tidy 2×2 grid.
 *
 * Responsive:
 *   Desktop (lg+): side-by-side split, card cluster on right
 *   Tablet/Mobile: stacked, text first, cards below
 */

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import WinCard from "@/components/WinCard";
import { MUSEUM_EASE } from "@/lib/motion";
import { useIsDesktop } from "@/lib/useIsDesktop";

/* ─── Hero Card Config ────────────────────────────────────────────
 * Single source of truth for hero card content, backgrounds, and their
 * role in the composition. Edit this array to change copy, backgrounds,
 * size, or aspect ratio without touching any layout code.
 *
 * Approved background set (do not deviate): 6, 11, 16, 19.
 *   • 6  — anchor (light, warm)
 *   • 11 — counterweight (dark)
 *   • 16 — supporting (light, floral)
 *   • 19 — supporting (dark, dramatic)
 * ──────────────────────────────────────────────────────────────── */

const HERO_CARDS = [
  {
    role: "anchor",
    headline: "Made the bed before noon.",
    plaque: "A domestic landmark. Conservators approve.",
    backgroundId: 6,
    size: "md",
    aspectRatio: "5 / 6",
  },
  {
    role: "counterweight",
    headline: "Replied to that scary email.",
    plaque: "A rare specimen. Acquired carefully.",
    backgroundId: 11,
    size: "sm",
    aspectRatio: "5 / 6",
  },
  {
    role: "support",
    headline: "Drank water before coffee.",
    plaque: "Received into the collection.",
    backgroundId: 16,
    size: "sm",
    aspectRatio: "7 / 5",
  },
  {
    role: "support",
    headline: "Said no and meant it.",
    plaque: "Catalogued with due care.",
    backgroundId: 19,
    size: "sm",
    aspectRatio: "6 / 5",
  },
] as const;

export default function EditorialHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion() ?? false;

  /* Scroll-out yield — as the hero leaves, it softly makes room for the
     next exhibit rather than disappearing abruptly (the "handoff"). */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const textOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, 16]);
  const cardsOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.75]);
  const cardsScale = useTransform(scrollYProgress, [0, 1], [1, 0.985]);

  const scrollActive = isDesktop && !reduced;

  const textScrollStyle = scrollActive
    ? { y: textY, opacity: textOpacity }
    : undefined;
  const cardsScrollStyle = scrollActive
    ? { y: cardsY, opacity: cardsOpacity, scale: cardsScale }
    : undefined;

  return (
    <section ref={heroRef} className="relative w-full overflow-hidden bg-transparent">
      <div
        className="w-full max-w-[1360px] mx-auto px-5 sm:px-6 md:px-8 lg:px-10 box-border"
        style={{
          paddingTop: "clamp(0.75rem, 1.5vh, 1.5rem)",
          paddingBottom: "clamp(2rem, 4vh, 3.5rem)",
        }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start relative gap-8 lg:gap-12 xl:gap-16">
          
          {/* ── ZONE A: Left Text Anchor ──────────────────────────────── */}
          <motion.div
            className="w-full lg:w-[40%] xl:w-[38%] flex flex-col items-center lg:items-start text-center lg:text-left"
            style={{
              paddingTop: "clamp(4rem, 10vh, 8rem)",
              ...textScrollStyle,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05, ease: MUSEUM_EASE }}
              className="flex items-center gap-3 mb-5"
            >
              <span
                aria-hidden="true"
                style={{
                  width: "1.75rem",
                  height: "1px",
                  backgroundColor:
                    "color-mix(in srgb, var(--color-gilt) 70%, transparent)",
                }}
              />
              <span
                className="text-scale-label"
                style={{
                  color: "color-mix(in srgb, var(--color-gilt) 80%, var(--color-ink))",
                  letterSpacing: "0.12em",
                }}
              >
                EST. 2026 · A DIGITAL MUSEUM
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: MUSEUM_EASE }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
                lineHeight: 0.95,
                fontWeight: 400,
                color: "var(--color-ink)",
                margin: "0 0 2.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              Museum of
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 500 }}>
                Tiny Wins
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24, ease: MUSEUM_EASE }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(1.05rem, 1.2vw, 1.15rem)",
                color: "color-mix(in srgb, var(--color-ink) 88%, transparent)",
                maxWidth: "22rem",
                lineHeight: 1.65,
                margin: "0 0 1.5rem",
              }}
            >
              A place where the small stuff gets the glory it deserves.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.34, ease: MUSEUM_EASE }}
              className="flex flex-wrap justify-center lg:justify-start items-center gap-4"
            >
              <Link
                href="/exhibition"
                className="btn-primary px-5 sm:px-6 whitespace-nowrap text-[0.9rem] sm:text-base"
                style={{ gap: "0.35rem" }}
              >
                Enter the Museum
                <span aria-hidden="true" style={{ fontSize: "1.05em" }}>
                  {" "}→
                </span>
              </Link>
            </motion.div>
          </motion.div>

          {/* ── ZONE B: Composed Card Cluster (Right) ─────────────────
           *  A bounded, hung 4-card arrangement. The anchor's left edge
           *  intrudes into the center gap; the right column starts lower and
           *  descends further, so the cluster reads as a curated hang, not a
           *  2×2 grid. Cards are static — no drag/move interaction.
           * ──────────────────────────────────────────────────────────── */}
          <motion.div
            className="w-full lg:w-[44%] xl:w-[42%] mt-4 lg:mt-0"
            style={{
              height: "auto",
              ...cardsScrollStyle,
            }}
          >
            <style>{`
              .hero-card {
                border-radius: var(--radius);
                transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1),
                            box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1);
              }
              .hero-card img {
                transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
              }
              @media (hover: hover) {
                .hero-card:hover {
                  transform: translateY(-4px);
                  box-shadow: 0 14px 36px color-mix(in srgb, var(--color-gilt) 22%, transparent);
                }
                .hero-card:hover img {
                  transform: scale(1.04);
                }
              }
              @media (prefers-reduced-motion: reduce) {
                .hero-card, .hero-card img { transition: none; }
                .hero-card:hover { transform: none; box-shadow: none; }
                .hero-card:hover img { transform: none; }
              }
            `}</style>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.08fr) minmax(0, 0.92fr)",
                columnGap: "clamp(0.75rem, 1.2vw, 1rem)",
                alignItems: "start",
              }}
            >
              {/* ── Left column: anchor + supporting exhibit ── */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(0.75rem, 1.2vw, 1rem)",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.18, ease: MUSEUM_EASE }}
                  style={{ marginLeft: "clamp(-3.5rem, -4vw, -2rem)" }}
                >
                  <div className="hero-card">
                    <WinCard
                      variant="hero"
                      backgroundId={HERO_CARDS[0].backgroundId}
                      category="Permanent Collection"
                      date="2026-08-30"
                      headline={HERO_CARDS[0].headline}
                      body={HERO_CARDS[0].plaque}
                      size={HERO_CARDS[0].size}
                      aspectRatio={HERO_CARDS[0].aspectRatio}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.34, ease: MUSEUM_EASE }}
                >
                  <div className="hero-card">
                    <WinCard
                      variant="hero"
                      backgroundId={HERO_CARDS[2].backgroundId}
                      category="Permanent Collection"
                      date="2026-08-30"
                      headline={HERO_CARDS[2].headline}
                      body={HERO_CARDS[2].plaque}
                      size={HERO_CARDS[2].size}
                      aspectRatio={HERO_CARDS[2].aspectRatio}
                    />
                  </div>
                </motion.div>
              </div>

              {/* ── Right column: dark counterweight + supporting exhibit,
                     hung lower to break the square and create a diagonal ── */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(0.75rem, 1.2vw, 1rem)",
                  marginTop: "clamp(2.25rem, 5vh, 4rem)",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.26, ease: MUSEUM_EASE }}
                >
                  <div className="hero-card">
                    <WinCard
                      variant="hero"
                      backgroundId={HERO_CARDS[1].backgroundId}
                      category="Permanent Collection"
                      date="2026-08-30"
                      headline={HERO_CARDS[1].headline}
                      body={HERO_CARDS[1].plaque}
                      size={HERO_CARDS[1].size}
                      aspectRatio={HERO_CARDS[1].aspectRatio}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.44, ease: MUSEUM_EASE }}
                  style={{ marginTop: "clamp(0.4rem, 1.2vw, 1.1rem)" }}
                >
                  <div className="hero-card">
                    <WinCard
                      variant="hero"
                      backgroundId={HERO_CARDS[3].backgroundId}
                      category="Permanent Collection"
                      date="2026-08-30"
                      headline={HERO_CARDS[3].headline}
                      body={HERO_CARDS[3].plaque}
                      size={HERO_CARDS[3].size}
                      aspectRatio={HERO_CARDS[3].aspectRatio}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
