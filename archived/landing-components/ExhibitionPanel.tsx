"use client";

/**
 * ExhibitionPanel — Museum of Tiny Wins
 *
 * Pure CSS sticky stacking with optional scroll-linked micro-rotation.
 *
 * Architecture: Each panel is `position: sticky; top: 0` within the
 * shared `<main>` container. Ascending z-indexes create the physical
 * stacking order. The Hero panel stays pinned as the permanent base
 * layer while subsequent panels scroll up and settle on top of it.
 *
 * Scrolling DOWN builds the stack. Scrolling UP dismantles it.
 * All behavior is driven by native CSS sticky — no scroll-jacking.
 */

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface ExhibitionPanelProps {
  children: React.ReactNode;
  /** Stacking order — higher values sit on top (e.g. 10, 20, 30) */
  zIndex: number;
  /** The Hero panel: sticky base layer, no animation, no styling */
  isHero?: boolean;
  /** Subtle rotation (degrees) as the panel enters from below. Resolves to 0 when settled. */
  enterRotation?: number;
}

export default function ExhibitionPanel({
  children,
  zIndex,
  isHero = false,
  enterRotation = 0,
}: ExhibitionPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Track scroll progress of this element entering the viewport.
  // progress 0 = element top is at viewport bottom
  // progress 1 = element top has reached viewport top (sticky position)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });

  // Scroll-linked micro-rotation: resolves to 0deg when the panel reaches
  // its sticky position. Naturally reverses when scrolling back up.
  const rotate = useTransform(scrollYProgress, (latest) => {
    if (isHero || prefersReducedMotion || !enterRotation) return 0;
    const clamped = Math.min(Math.max(latest, 0), 1);
    return enterRotation * (1 - clamped);
  });

  const shouldAnimate = !isHero && !prefersReducedMotion && enterRotation !== 0;

  return (
    <motion.div
      ref={ref}
      style={{
        position: "sticky",
        top: 0,
        zIndex,
        backgroundColor: "var(--color-cream)",
        // Non-hero panels get rounded top corners and a depth shadow
        // to visually separate from the layer beneath
        borderRadius: isHero ? 0 : "12px 12px 0 0",
        boxShadow: isHero
          ? "none"
          : "0 -8px 40px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        // Micro-rotation only on non-hero panels
        rotate: shouldAnimate ? rotate : 0,
      }}
    >
      {children}
    </motion.div>
  );
}
