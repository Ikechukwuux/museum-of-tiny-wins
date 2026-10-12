"use client";

import { useRef, useEffect } from "react";
import { MotionValue, useTransform, useMotionValue, motion } from "framer-motion";
import WinCard from "@/components/WinCard";

const THROUGH_LINE_WIN = {
  backgroundId: 9 as const,
  category: "Quiet Victory",
  date: "2026-08-30",
  headline: "Drank water before coffee.",
  body: "Newly catalogued for the permanent collection: \u201cDrank water before coffee.\u201d Filed under: small, but not nothing.",
  
};

interface TravelingCardProps {
  scrollYProgress: MotionValue<number>;
  gridSlotRef: React.RefObject<HTMLDivElement | null>;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function TravelingCard({ scrollYProgress, gridSlotRef }: TravelingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for Act 4 landing target (measured from DOM)
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const targetW = useMotionValue(260);
  const targetH = useMotionValue(347);

  useEffect(() => {
    function measure() {
      const slot = gridSlotRef.current;
      if (!slot) return;
      const rect = slot.getBoundingClientRect();
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX.set(rect.left + rect.width / 2 - cx);
      targetY.set(rect.top + rect.height / 2 - cy);
      targetW.set(rect.width);
      targetH.set(rect.height);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [gridSlotRef, targetX, targetY, targetW, targetH]);

  // ── Card position (multi-value transforms for full reactivity) ──
  const x = useTransform(
    [scrollYProgress, targetX],
    ([p, tx]: number[]) => {
      if (p < 0.8) return 0;
      const t = Math.min((p - 0.8) / 0.07, 1);
      return tx * easeOutCubic(t);
    }
  );

  const y = useTransform(
    [scrollYProgress, targetY],
    ([p, ty]: number[]) => {
      if (p < 0.12) return 60 * (1 - p / 0.12);
      if (p < 0.8) return 0;
      const t = Math.min((p - 0.8) / 0.07, 1);
      return ty * easeOutCubic(t);
    }
  );

  const scale = useTransform(
    [scrollYProgress, targetW, targetH],
    ([p, tw, th]: number[]) => {
      if (p < 0.12) return 0.92 + 0.08 * (p / 0.12);
      if (p < 0.8) return 1;
      const slotScale = Math.min(tw / 260, th / 347, 1);
      const t = Math.min((p - 0.8) / 0.07, 1);
      return 1 - (1 - slotScale) * easeOutCubic(t);
    }
  );

  // ── Visual state transitions ───────────────────────────────────
  const plainOverlayOpacity = useTransform(scrollYProgress, [0.58, 0.66], [1, 0]);

  // Each act-specific satellite element fades in AND out so it doesn't
  // linger past its scroll range and overlap later acts' visuals.
  const borderOpacity = useTransform(scrollYProgress, [0.21, 0.25, 0.38, 0.42], [0, 1, 1, 0]);
  const borderScaleX = useTransform(scrollYProgress, [0.23, 0.28, 0.38, 0.42], [0, 1, 1, 0]);

  const stampOpacity = useTransform(scrollYProgress, [0.22, 0.26, 0.38, 0.42], [0, 1, 1, 0]);

  const placardOpacity = useTransform(scrollYProgress, [0.46, 0.52, 0.58, 0.62], [0, 1, 1, 0]);
  const placardY = useTransform(scrollYProgress, [0.46, 0.52], [16, 0]);

  // Fade out the entire traveling card before Act 4 grid renders,
  // so the grid's own first card takes over — no duplicate card visible.
  const travelingOpacity = useTransform(scrollYProgress, [0.84, 0.87], [1, 0]);

  return (
    <div
      ref={cardRef}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        zIndex: 20,
      }}
    >
      <motion.div
        style={{
          x,
          y,
          scale,
          width: "260px",
          position: "relative",
          opacity: travelingOpacity,
        }}
      >
        {/* ── Base: real WinCard (always mounted) ─────────────── */}
        <div style={{ width: "100%", aspectRatio: "3 / 4" }}>
          <WinCard variant="hero" {...THROUGH_LINE_WIN} />
        </div>

        {/* ── Plain card overlay (covers WinCard for Acts 0–2) ── */}
        <motion.div
          style={{
            position: "absolute",
            inset: "-1px",
            borderRadius: "12px",
            backgroundColor: "var(--color-cream)",
            border: "1px solid color-mix(in srgb, var(--color-ink) 15%, transparent)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 2.5rem",
            opacity: plainOverlayOpacity,
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--color-ink)",
              lineHeight: 1.4,
              margin: 0,
              textAlign: "center",
            }}
          >
            &ldquo;Drank water before coffee.&rdquo;
          </p>
        </motion.div>

        {/* ── Forming border (Act 1) ──────────────────────────── */}
        <motion.div
          style={{
            position: "absolute",
            inset: "-0.75rem -1.25rem",
            border: "1px solid color-mix(in srgb, var(--color-gilt) 45%, transparent)",
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: 4,
            opacity: borderOpacity,
            scaleX: borderScaleX,
            transformOrigin: "center center",
          }}
        />

        {/* ── Accession stamp (Act 1) ─────────────────────────── */}
        <motion.p
          style={{
            position: "absolute",
            top: "-2.5rem",
            left: 0,
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "var(--color-gilt)",
            textTransform: "uppercase",
            zIndex: 5,
            margin: 0,
            opacity: stampOpacity,
          }}
        >
          Accession No. 000001
        </motion.p>

        {/* ── Placard body (Act 2) ────────────────────────────── */}
        <motion.div
          style={{
            position: "absolute",
            top: "calc(100% + 1.5rem)",
            left: "-1rem",
            right: "-1rem",
            zIndex: 5,
            opacity: placardOpacity,
            y: placardY,
          }}
        >
          <div
            style={{
              borderLeft: "2px solid var(--color-gilt)",
              paddingLeft: "1.5rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                fontWeight: 400,
                color: "var(--color-ink)",
                lineHeight: 1.6,
                margin: 0,
                textAlign: "left",
              }}
            >
              Newly catalogued for the permanent collection: &ldquo;Drank water
              before coffee.&rdquo; Filed under: small, but not nothing.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
