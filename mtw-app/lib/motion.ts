/**
 * Museum Motion — Shared animation constants & variants
 *
 * A consistent motion language for the Museum of Tiny Wins landing page.
 * All landing page components import from this single source of truth.
 *
 * Design direction: slow, restrained, editorial, museum-like.
 * "A curator slowly revealing an exhibition."
 */

import type { Variants, Transition } from "framer-motion";

/* ── Shared easing ───────────────────────────────────────────────── */
/** Refined ease-out curve — smooth deceleration, no bounce. */
export const MUSEUM_EASE = [0.16, 1, 0.3, 1] as const;

/* ── Viewport trigger defaults ───────────────────────────────────── */
export const VIEWPORT_ONCE = { once: true, margin: "-10%" } as const;

/* ── Reusable variants ───────────────────────────────────────────── */

/** Fade up from below — the primary reveal gesture. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/** Reduced movement version for mobile (smaller translateY). */
export const fadeUpMobile: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

/** Simple opacity fade — no movement. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Stagger container — orchestrates children. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/** Subtle image reveal — opacity + extremely gentle scale. */
export const subtleReveal: Variants = {
  hidden: { opacity: 0, scale: 1.015 },
  visible: { opacity: 1, scale: 1 },
};

/* ── Transition presets ──────────────────────────────────────────── */

/** Standard reveal transition (~650ms). */
export const revealTransition: Transition = {
  duration: 0.65,
  ease: MUSEUM_EASE,
};

/** Slower reveal for hero/image elements (~800ms). */
export const slowRevealTransition: Transition = {
  duration: 0.8,
  ease: MUSEUM_EASE,
};

/** Quick reveal for supporting elements (~500ms). */
export const quickRevealTransition: Transition = {
  duration: 0.5,
  ease: MUSEUM_EASE,
};

/* ── Stacked Exhibition Panel Transitions ────────────────────────── */

export const PANEL_DESKTOP = {
  scaleExit: 0.96,
  rotateExit: -0.3,
  opacityExit: 0.92,
  translateEnter: 100,
  scaleEnter: 0.97,
  rotateEnter: 0.3,
  opacityEnter: 0.96,
} as const;

export const PANEL_TABLET = {
  scaleExit: 0.97,
  rotateExit: -0.3,
  opacityExit: 0.93,
  translateEnter: 70,
  scaleEnter: 0.975,
  rotateEnter: 0.3,
  opacityEnter: 0.96,
} as const;

export const PANEL_MOBILE = {
  scaleExit: 0.985,
  rotateExit: -0.2,
  opacityExit: 0.94,
  translateEnter: 50,
  scaleEnter: 0.985,
  rotateEnter: 0.2,
  opacityEnter: 0.96,
} as const;

