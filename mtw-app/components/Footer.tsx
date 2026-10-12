"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MUSEUM_EASE } from "@/lib/motion";

/**
 * Footer — the closing room / final wall text of the museum.
 *
 * The reveal is a calm whileInView fade-up (the same "exhibit handoff"
 * gesture as the rest of the page), triggered only once a meaningful slice
 * of the footer is on screen — after the What This Is panel has settled.
 * The watermark emerges first, the content rises, and "Made with care."
 * appears last and most delicately. prefers-reduced-motion renders static.
 */

export function Footer() {
  const reduced = useReducedMotion() ?? false;
  const linkStyle = "font-[family-name:var(--font-body)] text-[0.95rem] text-[var(--color-ink)] hover:opacity-60 transition-opacity text-decoration-none";

  return (
    <footer
      className="relative overflow-hidden bg-[var(--color-cream)] mt-auto"
      style={{
        paddingTop: "6rem",
        paddingBottom: "2rem",
        borderTop: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
      }}
    >
      {/* ── Giant Background Text Overlay (Watermark) ── */}
      <motion.div
        className="absolute top-0 right-0 w-full flex justify-end pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
        style={{ zIndex: 0 }}
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: MUSEUM_EASE }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(6rem, 15vw, 18rem)",
            lineHeight: 0.8,
            color: "color-mix(in srgb, var(--color-ink) 2.5%, transparent)",
            whiteSpace: "nowrap",
            transform: "translate(5%, -15%)",
          }}
        >
          Tiny Wins
        </div>
      </motion.div>

      {/* ── Footer content — rises softly into clarity ── */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.9, ease: MUSEUM_EASE }}
      >
        {/* ── Main Links Grid ── */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-8 pb-16">
          
          {/* Column 1: Brand & Bio */}
          <div className="flex flex-col gap-4 max-w-[280px]">
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "1.75rem",
                  color: "var(--color-ink)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                MTW
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "color-mix(in srgb, var(--color-ink) 60%, transparent)",
                  marginTop: "0.5rem",
                }}
              >
                Museum of Tiny Wins
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                color: "color-mix(in srgb, var(--color-ink) 80%, transparent)",
                lineHeight: 1.5,
                margin: 0,
                marginTop: "0.5rem",
              }}
            >
              A place where the small stuff gets the glory it deserves.
            </p>
          </div>

          {/* Links Columns Container */}
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-16 lg:gap-24 lg:justify-end lg:w-1/2">
            
            {/* Column 2: Explore */}
            <div className="flex flex-col gap-5 min-w-[120px]">
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}>
                Explore
              </span>
              <div className="flex flex-col gap-3">
                <Link href="/exhibition" className={linkStyle}>Exhibition</Link>
                <Link href="/museum" className={linkStyle}>My Museum</Link>
                <Link href="/add-win" className={linkStyle}>Add a Win</Link>
              </div>
            </div>

            {/* Column 3: Info */}
            <div className="flex flex-col gap-5 min-w-[120px]">
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}>
                Info
              </span>
              <div className="flex flex-col gap-3">
                <Link href="/#what-this-is" className={linkStyle}>About</Link>
                <a href="mailto:hello@museumoftinywins.com" className={linkStyle}>Report an Issue</a>
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom Divider & Copyright ── */}
        <div
          style={{
            borderTop: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)",
            paddingTop: "1.5rem",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <motion.span
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.25, ease: MUSEUM_EASE }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              color: "color-mix(in srgb, var(--color-ink) 50%, transparent)",
            }}
          >
            © 2026 Museum of Tiny Wins. All rights reserved.
          </motion.span>
          
          {/* The delicate final note — appears last */}
          <motion.span
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.5, ease: MUSEUM_EASE }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              fontStyle: "italic",
              color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
            }}
          >
            Made with care.
          </motion.span>
        </div>
      </motion.div>
    </footer>
  );
}
