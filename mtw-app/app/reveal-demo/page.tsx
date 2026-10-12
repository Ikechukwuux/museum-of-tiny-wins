"use client";

/**
 * /reveal-demo — Submit Win Modal Step 3 reveal animation, in isolation.
 *
 * Three-phase sequence:
 *   1. "loading"   — animated gilt dash chases around the future card border.
 *                    Loading copy pulses gently (copy.md §5.2).
 *   2. "revealing" — the full gilt frame draws itself in along the border path
 *                    (stroke-dashoffset 0 → full perimeter), while the real
 *                    WinCard fades + scales up from behind it.
 *   3. "revealed"  — card static, SVG overlay gone, WinCard's own border takes
 *                    over at the identical position.
 *
 * Corner-matching guarantee: SVG rect is sized from measured container pixels
 * (via ResizeObserver, no viewBox), rx="11.5" so the stroke CENTRE sits at
 * the same 11.5px arc radius as the centre of WinCard's 1px border with
 * border-radius: 12px. No corner pop on transition.
 *
 * Cycles through 5 combos from copy.md §7.2–7.4 phrase pools.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import WinCard from "@/components/WinCard";

// ── Demo combos from copy.md §7.2–7.4 ────────────────────────────
const DEMO_COMBOS = [
  {
    headline: "Replied to that scary email.",
    body: "Submitted by the subject themselves, entirely without prompting. Visitors are encouraged to sit with this one for a moment.",
    category: "Quiet Victory",
    backgroundId: 3,
  },
  {
    headline: "Made the bed before noon.",
    body: "Discovered during a routine inventory of ordinary days. No further explanation has been deemed necessary.",
    category: "Discipline",
    backgroundId: 11,
  },
  {
    headline: "Went outside for 8 minutes.",
    body: "Newly catalogued for the museum registry. Future generations will undoubtedly understand.",
    category: "Small Graces",
    backgroundId: 7,
  },
  {
    headline: "Said no and meant it.",
    body: "On loan from a private collection of small victories. This particular exhibit speaks for itself.",
    category: "Restraint",
    backgroundId: 14,
  },
  {
    headline: "Drank water before coffee.",
    body: "Quietly entered into the official museum catalog. Filed away under: small, but entirely significant.",
    category: "Preservation",
    backgroundId: 2,
  },
] as const;

// ── Timing (ms) ───────────────────────────────────────────────────
const LOADING_MS  = 2500;   // loading phase duration
const DRAW_MS     = 1300;   // gilt frame draw-in
const CARD_DELAY  = 320;    // card starts fading in 320ms after frame begins
const CARD_FADE   = 800;    // card opacity + scale duration
const DWELL_MS    = 500;    // pause after animation before "revealed" phase

type Phase = "idle" | "loading" | "revealing" | "revealed";

// ── Component ─────────────────────────────────────────────────────
export default function RevealDemoPage() {
  const [phase, setPhase]         = useState<Phase>("idle");
  // comboIdx tracks which combo is displayed; init to last so first trigger → index 0
  const [comboIdx, setComboIdx]   = useState(DEMO_COMBOS.length - 1);
  const [svgSize, setSvgSize]     = useState({ w: 320, h: 427 });

  const containerRef = useRef<HTMLDivElement>(null);
  const timers       = useRef<ReturnType<typeof setTimeout>[]>([]);

  const currentCombo = DEMO_COMBOS[comboIdx];

  // ── Measure container in real pixels via ResizeObserver ───────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSvgSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── SVG geometry ──────────────────────────────────────────────────
  // stroke-width: 1 → center at 0.5px from rect edge → rx=11.5 → outer stroke
  // edge radius = 12px = WinCard's border-radius. Exact match guaranteed.
  const { w, h } = svgSize;
  const SVG_RX = 11.5;
  // Perimeter of a rounded rect in SVG units (= screen pixels, 1:1 mapping)
  const perimeter = Math.ceil(
    2 * (w - 1 - 2 * SVG_RX) + 2 * (h - 1 - 2 * SVG_RX) + 2 * Math.PI * SVG_RX
  );
  // Chase dash: ~1/12th of perimeter so there's visible gap
  const chaseDash = Math.max(40, Math.round(perimeter / 12));

  // ── Timer helpers ─────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // ── Trigger ───────────────────────────────────────────────────────
  const triggerReveal = useCallback(() => {
    clearTimers();
    const next = (comboIdx + 1) % DEMO_COMBOS.length;
    setComboIdx(next);
    setPhase("loading");

    timers.current = [
      setTimeout(() => setPhase("revealing"), LOADING_MS),
      setTimeout(
        () => setPhase("revealed"),
        LOADING_MS + DRAW_MS + DWELL_MS
      ),
    ];
  }, [comboIdx, clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
  }, [clearTimers]);

  // ── Derived state ─────────────────────────────────────────────────
  const showOverlay = phase === "loading" || phase === "revealing";
  const showCard    = phase !== "idle";

  // ── SVG rect animation style ──────────────────────────────────────
  const svgRectStyle: React.CSSProperties = {
    fill: "none",
    stroke: "var(--color-gilt)",
    strokeWidth: 1,
    ...(phase === "loading"
      ? {
          // Short animated dash chasing around the perimeter — "almost there"
          strokeDasharray: `${chaseDash} ${perimeter - chaseDash}`,
          animation: `giltChase 1.8s linear infinite`,
        }
      : phase === "revealing"
      ? {
          // Full stroke draws in from 0 to complete — the reveal itself
          strokeDasharray: `${perimeter} ${perimeter}`,
          strokeDashoffset: perimeter,
          animation: `giltDraw ${DRAW_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        }
      : {}),
  };

  return (
    <>
      {/* ── Injected keyframes (dynamic values from perimeter) ──────── */}
      <style>{`
        /* Chasing loading dash — travels clockwise around the rect */
        @keyframes giltChase {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -${perimeter}; }
        }

        /* Full gilt frame draws itself in along the rounded-rect path */
        @keyframes giltDraw {
          from { stroke-dashoffset: ${perimeter}; }
          to   { stroke-dashoffset: 0; }
        }

        /* Card emerges: opacity 0→1, slight scale-up */
        @keyframes cardReveal {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* Loading copy fades + rises in */
        @keyframes copyFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Primary loading line pulses gently while curators "work" */
        @keyframes textPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }

        /* Loading parchment glow — radial pulse from centre */
        @keyframes parchmentBreath {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--color-cream)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1.5rem",
          gap: "2.5rem",
        }}
      >
        {/* ── Page header ──────────────────────────────────────────── */}
        <header style={{ textAlign: "center", maxWidth: "420px" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-sage)",
              margin: "0 0 0.75rem",
            }}
          >
            Dev Reference · Submit Win Modal · Step 3
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 700,
              color: "var(--color-ink)",
              margin: "0 0 0.5rem",
              lineHeight: 1.15,
            }}
          >
            Frame Reveal
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              color: "color-mix(in srgb, var(--color-ink) 55%, transparent)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Loading glow → gilt frame draws in → card unveils.
            <br />
            Cycles through {DEMO_COMBOS.length} content combos.
          </p>
        </header>

        {/* ── Demo stage ───────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2.25rem",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {/* ── Card container (measured for SVG sizing) ───────────── */}
          <div
            ref={containerRef}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "3 / 4",
            }}
          >
            {/* Parchment backing — the "canvas" before the card appears.
                Breathes gently during loading, fades as card fades in. */}
            {showOverlay && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "12px",
                  backgroundColor: "var(--color-parchment)",
                  animation:
                    phase === "loading"
                      ? "parchmentBreath 3s ease-in-out infinite"
                      : "none",
                  opacity: phase === "revealing" ? 0 : undefined,
                  transition:
                    phase === "revealing"
                      ? `opacity ${CARD_FADE}ms ease-out ${CARD_DELAY}ms`
                      : "none",
                }}
              />
            )}

            {/* ── The real WinCard — fades + scales in ───────────────
                Uses animation during "revealing" so timing is CSS-precise;
                switches to explicit styles for "revealed" / hidden states. */}
            {showCard && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  ...(phase === "revealing"
                    ? {
                        animation: `cardReveal ${CARD_FADE}ms cubic-bezier(0.25, 0.1, 0.25, 1) ${CARD_DELAY}ms both`,
                      }
                    : phase === "revealed"
                    ? { opacity: 1, transform: "scale(1)" }
                    : { opacity: 0, transform: "scale(0.96)" }),
                }}
              >
                <WinCard
                  variant="hero"
                  backgroundId={currentCombo.backgroundId}
                  category={currentCombo.category}
                  date="2026-08-30"
                  headline={currentCombo.headline}
                  body={currentCombo.body}
                  
                />
              </div>
            )}

            {/* ── SVG gilt frame overlay ──────────────────────────────
                Sits on top of both the parchment and the card.
                During "loading": short animated dash chases clockwise.
                During "revealing": full stroke draws in from dashoffset=perimeter→0.

                Sizing: no viewBox → SVG coordinate system = screen pixels (1:1).
                rect rx=11.5 → stroke centre at r=11.5px from corner arc.
                Outer stroke edge: r=12px = WinCard's border-radius. ✓ */}
            {showOverlay && (
              <svg
                aria-hidden
                width={w}
                height={h}
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  // overflow: visible so the outer 0.5px of the stroke
                  // can bleed slightly past the container edge
                  overflow: "visible",
                }}
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width={Math.max(1, w - 1)}
                  height={Math.max(1, h - 1)}
                  rx={SVG_RX}
                  ry={SVG_RX}
                  style={svgRectStyle}
                />
              </svg>
            )}
          </div>

          {/* ── Loading copy (copy.md §5.2) ────────────────────────── */}
          {showOverlay && (
            <div
              style={{
                textAlign: "center",
                animation: "copyFadeIn 400ms ease-out both",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1rem",
                  color: "var(--color-ink)",
                  margin: "0 0 0.4rem",
                  // Pulse only during "loading"; fade out when "revealing" begins
                  animation:
                    phase === "loading"
                      ? "textPulse 2.4s ease-in-out infinite"
                      : "none",
                  opacity: phase === "revealing" ? 0 : undefined,
                  transition:
                    phase === "revealing" ? "opacity 350ms ease-out" : "none",
                }}
              >
                Our curators are writing your plaque...
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.78rem",
                  color: "color-mix(in srgb, var(--color-ink) 45%, transparent)",
                  margin: 0,
                  fontStyle: "italic",
                  opacity: phase === "revealing" ? 0 : undefined,
                  transition:
                    phase === "revealing" ? "opacity 350ms ease-out" : "none",
                }}
              >
                Every word is chosen with great care.
              </p>
            </div>
          )}

          {/* ── Controls ───────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={triggerReveal}
              className="btn-primary"
              disabled={phase === "loading" || phase === "revealing"}
              style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem" }}
            >
              {phase === "idle"
                ? "Trigger Reveal"
                : phase === "loading" || phase === "revealing"
                ? "Unveiling…"
                : "Trigger Again →"}
            </button>

            {phase !== "idle" && (
              <button
                onClick={reset}
                className="btn-ghost"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem" }}
              >
                Reset
              </button>
            )}
          </div>

          {/* ── Combo indicator ────────────────────────────────────── */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              color: "color-mix(in srgb, var(--color-ink) 30%, transparent)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              margin: 0,
              textAlign: "center",
            }}
          >
            Combo {comboIdx + 1} / {DEMO_COMBOS.length}
            {" · "}bg-{currentCombo.backgroundId}
            {" · "}{currentCombo.category}
          </p>
        </div>

        {/* ── Timing reference (dev aid) ────────────────────────────── */}
        <details
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
            maxWidth: "320px",
            width: "100%",
            lineHeight: 1.6,
          }}
        >
          <summary style={{ cursor: "pointer", letterSpacing: "0.04em" }}>
            Timing reference
          </summary>
          <table style={{ marginTop: "0.75rem", borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {[
                ["Loading phase", `${LOADING_MS}ms`],
                ["Frame draw-in", `${DRAW_MS}ms`],
                ["Card fade delay", `+${CARD_DELAY}ms`],
                ["Card fade duration", `${CARD_FADE}ms`],
                ["Dwell before revealed", `${DWELL_MS}ms`],
                ["Total sequence", `${LOADING_MS + DRAW_MS + DWELL_MS}ms`],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: "0.2rem 1rem 0.2rem 0", opacity: 0.7 }}>{label}</td>
                  <td style={{ fontFamily: "monospace" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>

        {/* ── Back link ─────────────────────────────────────────────── */}
        <a
          href="/styleguide"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          ← Styleguide
        </a>
      </div>
    </>
  );
}
