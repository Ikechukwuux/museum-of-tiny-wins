"use client";

/**
 * Hero — Museum of Tiny Wins — Editorial Composition
 *
 * Isolated containers:
 *   1. Text & CTAs Container (completely independent from image sizing)
 *   2. Standalone Museum Photograph Container (height rules applied only here)
 *
 * Animation: Staggered entrance on page load.
 *   Headline → Description → Buttons → Image (with subtle scale)
 */

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { MUSEUM_EASE } from "@/lib/motion";

export default function Hero({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <section>
      {/* ══════════════════════════════════════════════════════════════
          CONTAINER 1 — Editorial Typography + CTAs (TOP)
          Completely independent container — unaffected by image styles.
          ══════════════════════════════════════════════════════════════ */}
      <div
        className="w-full max-w-[1320px] mx-auto pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 px-4 sm:px-6 md:px-8 box-border"
      >
        <div className="hero-editorial-grid">
          {/* ── Left: Headline ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: MUSEUM_EASE }}
            className="text-center md:text-left w-full md:w-auto"
          >
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3rem, 6vw, 5.5rem)",
                lineHeight: 0.95,
                fontWeight: 400,
                color: "var(--color-ink)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Museum of
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 500 }}>
                Tiny Wins
              </span>
            </h1>
          </motion.div>

          {/* ── Right: Body copy + CTAs ─────────────────────────────── */}
          <div className="flex flex-col items-center md:items-start w-full md:w-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: MUSEUM_EASE }}
              className="text-center md:text-left mx-auto md:mx-0"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.95rem, 1.15vw, 1.08rem)",
                color:
                  "color-mix(in srgb, var(--color-ink) 70%, transparent)",
                maxWidth: "380px",
                lineHeight: 1.7,
                margin: "0 0 2.5rem 0",
              }}
            >
              A place where the small stuff gets the glory it deserves.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.34, ease: MUSEUM_EASE }}
              className="flex justify-center md:justify-start w-full md:w-auto"
              style={{
                flexWrap: "nowrap",
                alignItems: "center",
                gap: "clamp(0.5rem, 2vw, 1.5rem)",
              }}
            >
              <Link
                href="/exhibition"
                className="btn-primary px-3 sm:px-6 whitespace-nowrap text-[0.9rem] sm:text-base"
                style={{ gap: "0.35rem" }}
              >
                Enter the Museum
                <span aria-hidden="true" style={{ fontSize: "1.05em" }}>
                  →
                </span>
              </Link>
              <button 
                onClick={onOpenModal} 
                className="btn-ghost px-3 sm:px-6 whitespace-nowrap text-[0.9rem] sm:text-base"
              >
                Add Your Win
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CONTAINER 2 — Editorial Photograph (BOTTOM)
          Independent container — height adjustments only apply to this element.
          ══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 1.015 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.38, ease: MUSEUM_EASE }}
        className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8 lg:pb-10 max-w-[1320px] mx-auto box-border"
      >
        <div
          className="hero-image-container"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            minHeight: "280px",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          <Image
            src="/hero-background.jpeg"
            alt="Museum gallery with a framed Win Card exhibit on a stone pedestal, illuminated by a warm spotlight against architectural panelling"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1320px) 95vw, 1280px"
            quality={90}
            priority
            style={{ objectFit: "cover", objectPosition: "center center" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
