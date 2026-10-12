"use client";

/**
 * CategoryRail — Museum of Tiny Wins
 *
 * The shared, text-led category filter rail for both collection pages.
 * Deliberately editorial: words over icons, engraved uppercase labels, a
 * thin gilt underline for the active category, and a single hairline that
 * seats the rail against the intro above and the wall below. Not pills, not
 * dashboard chrome — a room directory.
 *
 * The rail sits on the same content rail as the intro and the wall, so the
 * whole page is composed on one disciplined grid.
 */

import { motion } from "framer-motion";
import { MUSEUM_EASE } from "@/lib/motion";

export interface CategoryRailProps {
  /** Uppercase category labels, "ALL" first. */
  categories: string[];
  /** The currently active category label. */
  active: string;
  /** Called with the newly selected category label. */
  onChange: (category: string) => void;
}

export function CategoryRail({ categories, active, onChange }: CategoryRailProps) {
  return (
    <nav
      aria-label="Collection categories"
      className="collection-rail"
      style={{ overflowX: "auto" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(1.25rem, 3vw, 2.5rem)",
          minWidth: "max-content",
        }}
      >
        {categories.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              aria-pressed={isActive}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "0.125rem 0 0.9rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "relative",
                whiteSpace: "nowrap",
                color: isActive
                  ? "var(--color-ink)"
                  : "color-mix(in srgb, var(--color-ink) 38%, transparent)",
                transition: "color 200ms",
              }}
            >
              {cat}
              {isActive && (
                <motion.span
                  layoutId="collection-category-underline"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    backgroundColor: "var(--color-gilt)",
                  }}
                  initial={false}
                  transition={{ duration: 0.3, ease: MUSEUM_EASE }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Derive an ordered category list from a set of wins.
 *
 * Order follows `allCategories` (the canonical vocabulary), filtering to
 * only those present in `wins`, prefixed with "ALL". This keeps the rail
 * curated (stable, intentional order) rather than alphabetically sorted.
 */
export function collectCategories(
  wins: { category: string }[],
  allCategories: string[],
): string[] {
  const present = new Set(wins.map((w) => w.category.toUpperCase()));
  const ordered = allCategories
    .map((c) => c.toUpperCase())
    .filter((c) => present.has(c));
  return ["ALL", ...ordered];
}
