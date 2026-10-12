"use client";

import { useEffect, useState } from "react";

/**
 * useIsDesktop — Museum of Tiny Wins
 *
 * SSR-safe responsive flag for gating scroll-linked ("exhibit handoff")
 * motion. Returns false on the server and on first client render, then
 * settles to the true viewport value once mounted. Because the elements
 * this gates are below the fold (What This Is) or only affect scroll-out
 * (hero yield), the initial false value never produces a visible flash.
 *
 * Default query: (min-width: 1024px) — the lg breakpoint used across the
 * landing page for the desktop choreography.
 */
export function useIsDesktop(query = "(min-width: 1024px)"): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
