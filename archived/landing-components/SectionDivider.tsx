"use client";

/**
 * SectionDivider — Museum of Tiny Wins
 *
 * A reusable "gallery room transition" — responsive whitespace band with an
 * optional thin centered gilt rule that fades in on scroll. Reads as
 * the brass threshold strip between gallery rooms in a real museum.
 *
 * Props:
 *   showRule  — whether to render the central gilt accent line (default true)
 *   spacing   — vertical padding shorthand: "sm" | "md" | "lg" (default "md")
 */

import { motion } from "framer-motion";
import { MUSEUM_EASE } from "@/lib/motion";

type Spacing = "sm" | "md" | "lg";

export default function SectionDivider({
  showRule = true,
  spacing = "md",
}: {
  showRule?: boolean;
  spacing?: Spacing;
}) {
  const paddingClasses: Record<Spacing, string> = {
    sm: "py-6 md:py-9 lg:py-12",
    md: "py-8 md:py-12 lg:py-16",
    lg: "py-12 md:py-18 lg:py-24",
  };

  return (
    <div
      aria-hidden="true"
      className={`w-full flex items-center justify-center ${paddingClasses[spacing]}`}
    >
      {showRule && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: MUSEUM_EASE }}
          style={{
            width: "60px",
            height: "1px",
            backgroundColor: "color-mix(in srgb, var(--color-gilt) 30%, transparent)",
            transformOrigin: "center center",
          }}
        />
      )}
    </div>
  );
}
