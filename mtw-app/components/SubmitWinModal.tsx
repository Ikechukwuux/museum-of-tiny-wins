"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import WinCard from "@/components/WinCard";
import { OPENERS, CLOSERS, CATEGORIES } from "@/lib/mockWins";
import { drawWinCardSize } from "@/lib/drawWinCardSize";
import { CARD_RATIOS, type WinCardSize } from "@/lib/winCardSize";

// ── Timing (ms) ───────────────────────────────────────────────────
const LOADING_MS  = 2000;   // loading phase duration
const DRAW_MS     = 1300;   // gilt frame draw-in
const CARD_DELAY  = 320;    // card starts fading in 320ms after frame begins
const CARD_FADE   = 800;    // card opacity + scale duration
const DWELL_MS    = 500;    // pause after animation before "revealed" phase

type Step = 1 | 2 | 3;
type Phase = "idle" | "loading" | "revealing" | "revealed";

export interface SubmitWinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitWinModal({ isOpen, onClose }: SubmitWinModalProps) {
  // Modal State
  const [step, setStep] = useState<Step>(1);
  const [phase, setPhase] = useState<Phase>("idle");
  
  // Form State
  const [input, setInput] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  // Generated Win State
  const [generatedWin, setGeneratedWin] = useState({
    headline: "",
    body: "",
    category: "",
    backgroundId: 1 as import("@/components/WinCard").BackgroundId,
    cardSize: "md" as WinCardSize,
  });

  // Animation State
  const [svgSize, setSvgSize] = useState({ w: 320, h: 427 });
  const containerRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Prevent body scroll when open ─────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ── Measure container in real pixels via ResizeObserver ───────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el || step === 1) return; // Only measure when container is rendered
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSvgSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [step]);

  // ── Timer helpers ─────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Reset modal state
  const handleReset = useCallback(() => {
    clearTimers();
    setStep(1);
    setPhase("idle");
    setInput("");
    setIsPublic(false);
    setError(null);
    setConfirmation(null);
  }, [clearTimers]);

  // Close modal completely
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // ── Generation & Trigger ──────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") {
      setError("Even the smallest win needs a few words to be framed.");
      return;
    }
    setError(null);

    // 1. Generate client-side payload
    const opener = OPENERS[Math.floor(Math.random() * OPENERS.length)];
    const closer = CLOSERS[Math.floor(Math.random() * CLOSERS.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const bgId = Math.floor(Math.random() * 14) + 1;
    const body = `${opener} ${closer}`;

    // Draw card size — same operation as image + tag (§1.1)
    const cardSize = drawWinCardSize({
      quote: input.trim(),
      commentary: body,
      // TODO: pass recentSizes from user's actual history when auth is wired
    });

    setGeneratedWin({
      headline: input.trim(),
      body,
      category,
      backgroundId: bgId as import("@/components/WinCard").BackgroundId,
      cardSize,
    });

    // 2. Start Animation Sequence
    setStep(2);
    setPhase("loading");
    clearTimers();

    timers.current = [
      setTimeout(() => setPhase("revealing"), LOADING_MS),
      setTimeout(() => {
        setPhase("revealed");
        setStep(3);
      }, LOADING_MS + DRAW_MS + DWELL_MS),
    ];
  };

  const handleAddToMuseum = () => {
    setConfirmation(
      isPublic
        ? "Added to the collection... and placed on public display."
        : "Added to the collection."
    );
    // Brief toast simulation before closing
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  if (!isOpen) return null;

  // ── SVG geometry ──────────────────────────────────────────────────
  const { w, h } = svgSize;
  const SVG_RX = 11.5;
  const perimeter = Math.ceil(
    2 * (w - 1 - 2 * SVG_RX) + 2 * (h - 1 - 2 * SVG_RX) + 2 * Math.PI * SVG_RX
  );
  const chaseDash = Math.max(40, Math.round(perimeter / 12));

  const showOverlay = phase === "loading" || phase === "revealing";
  const showCard    = phase !== "idle";

  const svgRectStyle: React.CSSProperties = {
    fill: "none",
    stroke: "var(--color-gilt)",
    strokeWidth: 1,
    ...(phase === "loading"
      ? {
          strokeDasharray: `${chaseDash} ${perimeter - chaseDash}`,
          animation: `giltChase 1.8s linear infinite`,
        }
      : phase === "revealing"
      ? {
          strokeDasharray: `${perimeter} ${perimeter}`,
          strokeDashoffset: perimeter,
          animation: `giltDraw ${DRAW_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        }
      : {}),
  };

  return (
    <>
      <style>{`
        @keyframes giltChase {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -${perimeter}; }
        }
        @keyframes giltDraw {
          from { stroke-dashoffset: ${perimeter}; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes copyFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes textPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        @keyframes parchmentBreath {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* ── Modal Backdrop ─────────────────────────────────────────── */}
      <div
        className="modal-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          backgroundColor: "color-mix(in srgb, var(--color-cream) 85%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          animation: "cardReveal 300ms ease-out both",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && step === 1) {
            handleClose();
          }
        }}
      >
        {/* Close Button (only show if not animating/loading) */}
        {(step === 1 || step === 3) && !confirmation && (
          <button
            onClick={handleClose}
            aria-label="Close modal"
            style={{
              position: "absolute",
              top: "2rem",
              right: "2rem",
              background: "transparent",
              border: "none",
              color: "var(--color-ink)",
              opacity: 0.5,
              cursor: "pointer",
              padding: "0.5rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              zIndex: 10,
            }}
          >
            Close
          </button>
        )}

        {/* ── Confirmation Toast Overlay ───────────────────────────── */}
        {confirmation && (
          <div
            style={{
              position: "absolute",
              zIndex: 1010,
              textAlign: "center",
              animation: "copyFadeIn 400ms ease-out both",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                color: "var(--color-ink)",
                margin: 0,
              }}
            >
              {confirmation}
            </p>
          </div>
        )}

        {/* ── Step 1: Input Form ───────────────────────────────────── */}
        {step === 1 && !confirmation && (
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-sage)",
                  margin: "0 0 0.5rem",
                }}
              >
                New Acquisition
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                  color: "var(--color-ink)",
                  margin: 0,
                }}
              >
                What tiny thing did you do today?
              </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ position: "relative" }}>
                <textarea
                  value={input}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      setInput(e.target.value);
                      setError(null);
                    }
                  }}
                  placeholder="What tiny thing did you do today?"
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    resize: "none",
                    padding: "1.25rem",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    lineHeight: 1.4,
                    color: "var(--color-ink)",
                    backgroundColor: "transparent",
                    border: "1px solid color-mix(in srgb, var(--color-ink) 20%, transparent)",
                    borderRadius: "12px",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-sage)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "color-mix(in srgb, var(--color-ink) 20%, transparent)";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    right: "1rem",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                  }}
                >
                  {input.length} / 300
                </div>
              </div>

              {error && (
                <p style={{ color: "#d9534f", fontSize: "0.85rem", margin: "-0.5rem 0 0 0" }}>
                  {error}
                </p>
              )}

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{
                    appearance: "none",
                    width: "1.25rem",
                    height: "1.25rem",
                    border: "1px solid var(--color-gilt)",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    backgroundColor: isPublic ? "var(--color-sage)" : "transparent",
                    borderColor: isPublic ? "var(--color-sage)" : "var(--color-gilt)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    color: "var(--color-ink)",
                  }}
                >
                  Add this to the Public Exhibition 🖼️
                </span>
              </label>

              {/* Turnstile Stub */}
              <div
                style={{
                  width: "100%",
                  height: "64px",
                  backgroundColor: "color-mix(in srgb, var(--color-ink) 5%, transparent)",
                  border: "1px dashed color-mix(in srgb, var(--color-ink) 20%, transparent)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                  fontSize: "0.8rem",
                }}
              >
                [ Turnstile CAPTCHA Stub ]
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                  Frame It
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Steps 2 & 3: Generation & Reveal ─────────────────────── */}
        {(step === 2 || step === 3) && !confirmation && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2.25rem",
              width: "100%",
              maxWidth: "340px",
            }}
          >
            {step === 3 && (
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-sage)",
                  margin: 0,
                  animation: "copyFadeIn 600ms ease-out both",
                }}
              >
                Newly Acquired
              </p>
            )}

            <div
              ref={containerRef}
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: CARD_RATIOS[generatedWin.cardSize],
              }}
            >
              {/* Parchment backing */}
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

              {/* The real WinCard */}
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
                    backgroundId={generatedWin.backgroundId}
                    category={generatedWin.category}
                    date="2026-08-30" // Fake ID for now
                    headline={generatedWin.headline}
                    body={generatedWin.body}
                    
                    size={generatedWin.cardSize}
                  />
                </div>
              )}

              {/* SVG gilt frame overlay */}
              {showOverlay && (
                <svg
                  aria-hidden
                  width={w}
                  height={h}
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
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

            {/* Loading Copy (Step 2) */}
            {step === 2 && showOverlay && (
              <div style={{ textAlign: "center", animation: "copyFadeIn 400ms ease-out both" }}>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    color: "var(--color-ink)",
                    margin: "0 0 0.4rem",
                    animation:
                      phase === "loading"
                        ? "textPulse 2.4s ease-in-out infinite"
                        : "none",
                    opacity: phase === "revealing" ? 0 : undefined,
                    transition: phase === "revealing" ? "opacity 350ms ease-out" : "none",
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
                    transition: phase === "revealing" ? "opacity 350ms ease-out" : "none",
                  }}
                >
                  Every word is chosen with great care.
                </p>
              </div>
            )}

            {/* Actions (Step 3) */}
            {step === 3 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  width: "100%",
                  animation: "copyFadeIn 600ms ease-out 300ms both",
                }}
              >
                <button
                  onClick={handleAddToMuseum}
                  className="btn-primary"
                  style={{ width: "100%" }}
                >
                  Add to My Museum
                </button>
                <button
                  onClick={handleReset}
                  className="btn-ghost"
                  style={{ width: "100%" }}
                >
                  Frame Another
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
