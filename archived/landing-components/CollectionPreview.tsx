"use client";

/**
 * CollectionPreview — Museum of Tiny Wins — "The Main Gallery"
 *
 * Art-directed exhibition wall:
 *   • Asymmetric 2-column offset layout — cards hung at different heights.
 *   • Left-aligned heading offset on a grid for tension.
 *   • Atmospheric gallery lighting: subtle spotlights behind the artworks.
 *   • Each card feels like a physical exhibit on a wall.
 *
 * Same WinCard component, same data, same copy. Layout and atmosphere only.
 */

import { motion } from "framer-motion";
import WinCard from "@/components/WinCard";
import { EXAMPLE_CARDS } from "./data";

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function CollectionPreview() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-cream) 92%, var(--color-parchment))",
        paddingTop: "6rem",
        paddingBottom: "10rem",
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          ATMOSPHERE LAYERS — Gallery lighting
          ══════════════════════════════════════════════════════════════ */}
      
      {/* Ambient top light — suggesting track lighting above */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "25%",
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--color-cream) 80%, transparent) 0%, transparent 100%)",
        }}
      />

      {/* Subtle vignette on the sides */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, color-mix(in srgb, var(--color-ink) 3%, transparent) 100%)",
        }}
      />

      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 2rem" }}>
        {/* ── Section heading — museum wall-label style, offset on grid ── */}
        <div className="grid grid-cols-12 gap-8 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: smoothOut }}
            className="col-span-12 md:col-span-8 lg:col-span-6 md:col-start-2 lg:col-start-3"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                marginLeft: "-1.5rem",
              }}
            >
              {/* Gilt accent marker */}
              <div
                aria-hidden="true"
                style={{
                  width: "2px",
                  height: "28px",
                  backgroundColor:
                    "color-mix(in srgb, var(--color-gilt) 50%, transparent)",
                  flexShrink: 0,
                }}
              />
              <h2
                className="font-[family-name:var(--font-body)] text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[color-mix(in_srgb,var(--color-ink)_45%,transparent)]"
                style={{ margin: 0 }}
              >
                A Small Sample of the Permanent Collection
              </h2>
            </div>
          </motion.div>
        </div>

        {/* ── Desktop: Asymmetric gallery wall ────── */}
        <div className="hidden lg:block relative z-10">
          <div className="grid grid-cols-12 gap-x-8 gap-y-32">
            
            {/* Piece 1: Left column, higher */}
            <motion.div
              className="col-span-5 col-start-2 relative flex justify-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 1.2, delay: 0.1, ease: smoothOut }}
            >
              <Spotlight />
              <div style={{ width: "300px", position: "relative", zIndex: 2 }}>
                <ExhibitShadow />
                <WinCard variant="hero" {...EXAMPLE_CARDS[0]} />
              </div>
            </motion.div>

            {/* Piece 2: Right column, lower */}
            <motion.div
              className="col-span-5 col-start-7 relative flex justify-center pt-32"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 1.2, delay: 0.25, ease: smoothOut }}
            >
              <Spotlight />
              <div style={{ width: "300px", position: "relative", zIndex: 2 }}>
                <ExhibitShadow />
                <WinCard variant="hero" {...EXAMPLE_CARDS[1]} />
              </div>
            </motion.div>

            {/* Piece 3: Left column, lower */}
            <motion.div
              className="col-span-5 col-start-2 relative flex justify-center pt-24"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 1.2, delay: 0.15, ease: smoothOut }}
            >
              <Spotlight />
              <div style={{ width: "300px", position: "relative", zIndex: 2 }}>
                <ExhibitShadow />
                <WinCard variant="hero" {...EXAMPLE_CARDS[3]} />
              </div>
            </motion.div>

            {/* Piece 4: Right column, higher */}
            <motion.div
              className="col-span-5 col-start-7 relative flex justify-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 1.2, delay: 0, ease: smoothOut }}
            >
              <Spotlight />
              <div style={{ width: "300px", position: "relative", zIndex: 2 }}>
                <ExhibitShadow />
                <WinCard variant="hero" {...EXAMPLE_CARDS[4]} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Mobile/Tablet: Single column with varied padding ── */}
        <div className="lg:hidden flex flex-col items-center gap-24 relative z-10">
          {EXAMPLE_CARDS.slice(0, 4).map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{
                duration: 1.2,
                delay: 0.1,
                ease: smoothOut,
              }}
              className="w-full relative flex justify-center"
              style={{
                maxWidth: "320px",
                paddingLeft: i % 2 !== 0 ? "2rem" : "0",
                paddingRight: i % 2 === 0 ? "2rem" : "0",
              }}
            >
              <Spotlight />
              <div className="w-full relative z-2">
                <ExhibitShadow />
                <WinCard variant="hero" {...card} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Spotlight() {
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        width: "160%",
        height: "160%",
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--color-cream) 60%, transparent) 0%, transparent 60%)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 0,
      }}
    />
  );
}

function ExhibitShadow() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: "6px",
        borderRadius: "var(--radius)",
        boxShadow:
          "0 20px 50px color-mix(in srgb, var(--color-ink) 12%, transparent), 0 8px 24px color-mix(in srgb, var(--color-ink) 4%, transparent)",
        zIndex: -1,
      }}
    />
  );
}
