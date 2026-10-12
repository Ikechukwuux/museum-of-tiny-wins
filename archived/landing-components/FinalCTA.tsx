"use client";

/**
 * FinalCTA — Museum of Tiny Wins
 *
 * The last "room" in the landing page gallery — an editorial conclusion
 * designed as a literal "Final Exhibit".
 *
 * Desktop (1024px+): Asymmetrical editorial spread
 * Mobile (<768px): Centered vertical stack
 *
 * Copy source: copy.md (curator voice, no SaaS tropes)
 */

import { motion } from "framer-motion";
import WinCard from "@/components/WinCard";
import { MUSEUM_EASE, VIEWPORT_ONCE } from "@/lib/motion";

const FINAL_CARD = {
  backgroundId: 4 as const, // Moody teal-green tulip
  category: "Preservation",
  date: "2026-08-30",
  headline: "went outside for 8 minutes",
  body: "Kept here against forgetting. Its place here is secure.",
  
};

export default function FinalCTA({
  onOpenModal,
}: {
  onOpenModal: () => void;
}) {
  return (
    <section
      className="relative overflow-hidden w-full pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-24 sm:pb-32 lg:pb-40 px-5 sm:px-6 md:px-8"
    >
      {/* ══════════════════════════════════════════════════════════════
          ATMOSPHERE LAYERS
          ══════════════════════════════════════════════════════════════ */}
      
      {/* Subtle top rule threshold to separate from previous section */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px]"
        style={{
          height: "1px",
          backgroundColor:
            "color-mix(in srgb, var(--color-gilt) 35%, transparent)",
        }}
      />

      {/* Gentle center spotlight falling behind the content */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-70"
      >
        <div
          style={{
            width: "800px",
            height: "800px",
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-parchment) 50%, transparent) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CONTENT - Asymmetric Grid
          ══════════════════════════════════════════════════════════════ */}
      
      <div className="relative z-10 w-full max-w-[1100px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between lg:items-center gap-12 lg:gap-20">
          
          {/* ── LEFT: The Win Card Exhibit ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.65, delay: 0.2, ease: MUSEUM_EASE }}
            className="w-full max-w-[340px] md:max-w-[380px] lg:w-1/2 lg:max-w-[420px] order-2 lg:order-1"
          >
            {/* Soft decorative shadow to ground the exhibit */}
            <div className="relative">
              <div
                className="absolute -inset-4 blur-xl opacity-20 pointer-events-none"
                style={{ backgroundColor: "var(--color-gilt)" }}
              />
              <WinCard
                variant="hero"
                backgroundId={FINAL_CARD.backgroundId}
                category={FINAL_CARD.category}
                date="2026-08-30"
                headline={FINAL_CARD.headline}
                body={FINAL_CARD.body}
                
                aspectRatio="3 / 4"
                className="relative z-10"
              />
            </div>
          </motion.div>

          {/* ── RIGHT: The Invitation ────────────────────────────── */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left order-1 lg:order-2 lg:pl-8">
            
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.65, delay: 0.05, ease: MUSEUM_EASE }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="text-gilt text-xs select-none">★</span>
              <span className="label-engraved" style={{ color: "var(--color-ink)", opacity: 0.6 }}>
                THE FINAL EXHIBIT
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.65, delay: 0.15, ease: MUSEUM_EASE }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                fontWeight: 400,
                color: "var(--color-ink)",
                lineHeight: 1.1,
                margin: "0 0 1.25rem 0",
                letterSpacing: "-0.01em",
              }}
            >
              There's room <br className="hidden lg:block" />
              for one more.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.65, delay: 0.25, ease: MUSEUM_EASE }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(1rem, 1.25vw, 1.125rem)",
                color: "color-mix(in srgb, var(--color-ink) 65%, transparent)",
                maxWidth: "340px",
                lineHeight: 1.65,
                margin: "0 0 3rem 0",
              }}
              className="mx-auto lg:mx-0"
            >
              Add your tiny win to the collection.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.65, delay: 0.35, ease: MUSEUM_EASE }}
            >
              <button
                onClick={onOpenModal}
                className="btn-primary"
                style={{ padding: "1rem 2.25rem", fontSize: "1.05rem" }}
              >
                Add Your Win 
                <span aria-hidden="true" className="ml-2 opacity-80" style={{ fontSize: "1.1em" }}>
                  →
                </span>
              </button>
            </motion.div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
