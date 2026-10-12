"use client";

/**
 * WhatThisIsSection — Museum of Tiny Wins
 *
 * One large framed exhibit panel derived from the Win Card system. A single
 * continuous image field (background 2, unflipped) with a parchment reading
 * plaque inset on the right — a deliberate museum label, a larger cousin of
 * the Win Card text treatment. Not a split banner, not a card grid: the panel
 * is one object, the plaque sits inside it as a reading surface, and the image
 * breathes around it.
 *
 * Copy source: content/copy.md §2.8 (eyebrow, headline, body, closing coda).
 *
 * Layout:
 *   Desktop (lg+): one object — unflipped image fills the panel, plaque sits
 *                  inset on the right, vertically centered (the calmest zone
 *                  of background 2).
 *   Mobile:        same object — image band above, plaque settled below
 *                  (still inset, so the image remains a frame around it).
 *
 * Motion (the "exhibit handoff" concept — skills.md B.6):
 *   Desktop: the panel arrives like the next museum piece coming into focus —
 *            a slight rise + settle, opacity progression, an extremely small
 *            scale, and a tiny image focus-blur resolving to sharp. Once in
 *            place it is still, save a very gentle background drift.
 *   Mobile:  a single calm whileInView fade-up (simplified, not shrunken).
 */

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { MUSEUM_EASE, VIEWPORT_ONCE } from "@/lib/motion";
import { useIsDesktop } from "@/lib/useIsDesktop";

/* Exhibit background — card background 2 (warm / moderate / calm per
   lib/imageTaxonomy.ts), unflipped. */
const PANEL_IMAGE = {
  src: "/card-background-images/card-bg-2.jpg",
  alt: "",
};

export default function WhatThisIsSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion() ?? false;

  /* Arrival — panel enters and settles into focus (desktop only).
     Completes when the panel top reaches ~60% of the viewport height, so
     the panel is already "on view" and still before the footer begins to
     enter (avoids the two reveals firing together). */
  const { scrollYProgress: arrival } = useScroll({
    target: ref,
    offset: ["start end", "start 0.6"],
  });

  /* Passage — full transit through the viewport, for the gentle drift. */
  const { scrollYProgress: passage } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const panelOpacity = useTransform(arrival, [0, 1], [0.55, 1]);
  const panelY = useTransform(arrival, [0, 1], [36, 0]);
  const panelScale = useTransform(arrival, [0, 1], [0.985, 1]);

  const imageFocus = useTransform(arrival, [0, 1], ["blur(6px)", "blur(0px)"]);
  const imageY = useTransform(passage, [0, 1], [-14, 14]);

  /* Scroll-linked transforms run only on desktop; mobile and reduced-motion
     fall back to a single calm whileInView fade-up. */
  const scrollActive = isDesktop && !reduced;

  const panelScrollStyle = scrollActive
    ? { opacity: panelOpacity, y: panelY, scale: panelScale }
    : undefined;

  const panelEntrance = scrollActive
    ? { initial: false as const }
    : {
        initial: reduced ? false : { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: VIEWPORT_ONCE,
        transition: { duration: 0.9, ease: MUSEUM_EASE },
      };

  const imageMotionStyle = scrollActive
    ? { y: imageY, filter: imageFocus }
    : undefined;

  return (
    <section
      id="what-this-is"
      className="relative w-full overflow-hidden"
      style={{
        paddingTop: "clamp(4rem, 8vw, 7rem)",
        paddingBottom: "clamp(4rem, 8vw, 7rem)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
        <motion.div
          ref={ref}
          className="wti-panel"
          style={panelScrollStyle}
          {...panelEntrance}
        >
          <style>{`
            /* One framed exhibit object — image field with an inset plaque */
            .wti-panel {
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
              align-items: stretch;
              min-height: clamp(560px, 92vw, 680px);
              padding: clamp(0.875rem, 3.5vw, 1.25rem);
              border-radius: var(--radius);
              overflow: hidden;
              background-color: var(--color-parchment);
              will-change: transform, opacity;
            }
            /* Signature gilt frame — the Win Card edge language */
            .wti-panel::after {
              content: "";
              position: absolute;
              inset: 0;
              border-radius: var(--radius);
              border: 2px solid var(--color-gilt);
              pointer-events: none;
              z-index: 4;
            }
            /* Reading plaque — a framed parchment note inset on the image.
               The double keyline echoes a real exhibit mat. */
            .wti-plaque {
              position: relative;
              border-radius: var(--radius);
              background-color: var(--color-parchment);
              box-shadow:
                inset 0 0 0 1px
                  color-mix(in srgb, var(--color-gilt) 50%, transparent),
                0 24px 56px rgba(43, 40, 35, 0.20);
              padding: clamp(1.75rem, 4vw, 3rem);
              z-index: 2;
            }
            @media (min-width: 1024px) {
              .wti-panel {
                flex-direction: row;
                justify-content: flex-end;
                align-items: center;
                min-height: clamp(500px, 58vh, 620px);
                padding: clamp(2.5rem, 4.5vw, 4.5rem);
              }
              .wti-plaque {
                width: clamp(340px, 40%, 460px);
              }
            }
          `}</style>

          {/* ── Continuous image field — background 2, unflipped ──────── */}
          <motion.div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "-10px",
              zIndex: 0,
              ...imageMotionStyle,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-8px",
                filter: "blur(2px)",
                transform: "scale(1.08)",
              }}
            >
              <Image
                src={PANEL_IMAGE.src}
                alt={PANEL_IMAGE.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 1150px"
                style={{ objectFit: "cover" }}
              />
            </div>
          </motion.div>

          {/* ── Quiet edge vignette — gives the image depth ────────────── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "radial-gradient(125% 105% at 50% 45%, transparent 58%, rgba(43, 40, 35, 0.12) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* ── Subtle scrim behind the plaque — softens the image so the
                 reading surface reads as the home of the text ─────────── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "radial-gradient(70% 85% at 82% 50%, rgba(43, 40, 35, 0.10) 0%, rgba(43, 40, 35, 0.02) 48%, transparent 72%)",
              pointerEvents: "none",
            }}
          />

          {/* ── Inner mat keyline — the double-mat framing of an exhibit ── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "8px",
              borderRadius: "calc(var(--radius) - 4px)",
              border:
                "1px solid color-mix(in srgb, var(--color-gilt) 28%, transparent)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* ── Parchment reading plaque ─────────────────────────────── */}
          <motion.div
            className="wti-plaque"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.9, delay: 0.15, ease: MUSEUM_EASE }}
          >
            {/* Eyebrow — copy.md §2.8 */}
            <div className="flex items-center gap-3 mb-5">
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
                  color:
                    "color-mix(in srgb, var(--color-gilt) 75%, var(--color-ink))",
                }}
              >
                WHAT IS THIS?
              </span>
            </div>

            {/* Headline — copy.md §2.8 */}
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.85rem, 3.4vw, 2.6rem)",
                lineHeight: 1.12,
                fontWeight: 400,
                color: "var(--color-ink)",
                margin: "0 0 1.5rem",
                letterSpacing: "-0.01em",
              }}
            >
              Your small wins
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 500 }}>
                deserve a frame.
              </span>
            </h2>

            {/* Body — copy.md §2.8 */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
                lineHeight: 1.7,
                color: "color-mix(in srgb, var(--color-ink) 88%, transparent)",
                margin: "0 0 1.75rem",
                maxWidth: "30rem",
              }}
            >
              Most apps track your goals. This one celebrates what you already
              did — even the tiny, forgettable things. You write it down, we
              make it look important.
            </p>

            {/* Quiet divider — separates the explanation from the coda */}
            <div
              aria-hidden="true"
              style={{
                height: "1px",
                width: "100%",
                background:
                  "linear-gradient(to right, color-mix(in srgb, var(--color-gilt) 35%, transparent), transparent)",
                margin: "0 0 1.25rem",
              }}
            />

            {/* Closing note — a quiet coda, not a third paragraph — copy.md §2.8 */}
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(0.9rem, 1.2vw, 1rem)",
                lineHeight: 1.5,
                fontWeight: 400,
                fontStyle: "italic",
                color: "color-mix(in srgb, var(--color-ink) 48%, transparent)",
                margin: 0,
              }}
            >
              Because sometimes &ldquo;drank water before coffee&rdquo; is
              enough.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
