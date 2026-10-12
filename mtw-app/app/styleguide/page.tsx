/**
 * /styleguide — Museum of Tiny Wins Design System Reference
 *
 * A visual inventory of every design token, type specimen, button state,
 * and the signature gilt-border treatment. Review this before building any
 * real screens to confirm the system is wired correctly.
 *
 * This route is dev-only infrastructure — it will be hidden or removed
 * once real UI is in place.
 *
 * 'use client' because we pass onOpenDetail callbacks to WinCard (a client
 * component). Acceptable for a dev-only styleguide page.
 */

"use client";

import { useState, useEffect } from "react";
import WinCard from "@/components/WinCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import WinCardGrid from "@/components/WinCardGrid";
import { TextField } from "@/components/forms/TextField";
import { EmailField } from "@/components/forms/EmailField";
import { PasswordField } from "@/components/forms/PasswordField";
import { FormDivider } from "@/components/forms/FormDivider";
import { Button } from "@/components/Button";
import { AuthModal } from "@/components/AuthModal";
import {
  TEXT_BUDGET,
  CARD_SIZE_NAMES,
  CARD_RATIOS,
  type WinCardSize,
} from "@/lib/winCardSize";
import { type WinCardGridItem } from "@/components/WinCardGrid";
import { drawWinCardSize, seedRng, TIER_CAPACITY, TIER_WEIGHTS } from "@/lib/drawWinCardSize";
import { pairBackground } from "@/lib/pairBackground";

/* ─── Token data ──────────────────────────────────────────────────── */
const colors = [
  {
    name: "Cream",
    cssVar: "--color-cream",
    hex: "#FAF6EF",
    tailwind: "bg-cream",
    role: "Page background — outermost layer. Everything sits on top of this.",
    textColor: "#2B2823",
    border: true,
  },
  {
    name: "Parchment",
    cssVar: "--color-parchment",
    hex: "#F1EBDC",
    tailwind: "bg-parchment",
    role: "Card / surface background. One step warmer than cream so cards read as objects sitting on the page, not inlaid blocks.",
    textColor: "#2B2823",
    border: true,
  },
  {
    name: "Sage",
    cssVar: "--color-sage",
    hex: "#7C9473",
    tailwind: "bg-sage",
    role: "Primary accent — buttons, links, active states. The palette's one mid-tone anchor.",
    textColor: "#FAF6EF",
    border: false,
  },
  {
    name: "Sky",
    cssVar: "--color-sky",
    hex: "#C9D9E8",
    tailwind: "bg-sky",
    role: "Atmospheric accent — gradients, glows, section washes. Never as a solid fill on text-bearing elements.",
    textColor: "#2B2823",
    border: true,
  },
  {
    name: "Ink",
    cssVar: "--color-ink",
    hex: "#2B2823",
    tailwind: "bg-ink",
    role: "All body text. Warm near-black — never pure #000, which reads as harsh against cream.",
    textColor: "#FAF6EF",
    border: false,
  },
  {
    name: "Gilt",
    cssVar: "--color-gilt",
    hex: "#B8934A",
    tailwind: "bg-gilt",
    role: "Signature accent — frame edges, CTA borders, accession-stamp motif. The one bold color; everything else stays quiet around it.",
    textColor: "#FAF6EF",
    border: false,
  },
] as const;

const semanticColors = [
  {
    name: "Oxide (Error)",
    cssVar: "--mtw-oxide",
    hex: "#9C3A3A",
    tailwind: "bg-oxide",
    role: "Error states, validation feedback, destructive actions. Contrast ~4.9:1 on parchment.",
    textColor: "#FAF6EF",
    border: false,
  },
  {
    name: "Success",
    cssVar: "--mtw-success",
    hex: "#7C9473",
    tailwind: "bg-success",
    role: "Success states (maps to Sage).",
    textColor: "#FAF6EF",
    border: false,
  },
  {
    name: "Info",
    cssVar: "--mtw-info",
    hex: "#C9D9E8",
    tailwind: "bg-info",
    role: "Informational states (maps to Sky).",
    textColor: "#2B2823",
    border: true,
  },
] as const;

const typeSpecimens = [
  {
    step: "display",
    label: "Display — Fraunces",
    detail: "4rem · weight 500 · Fraunces (optical sizing)",
    specimen: "Museum of Tiny Wins",
    note: "Hero headline, app name lockup (Act 0)",
    cssClass: "text-scale-display",
    fontVar: "--font-display",
  },
  {
    step: "heading-2",
    label: "Heading 2 — Fraunces",
    detail: "1.5rem · weight 600 · Fraunces",
    specimen: "Drank water before coffee.",
    note: "Win card placard headline (user's raw input as artifact title); section headings",
    cssClass: "text-scale-heading-2",
    fontVar: "--font-display",
  },
  {
    step: "body",
    label: "Body — Public Sans",
    detail: "1rem · weight 400 · Public Sans · line-height 1.65",
    specimen:
      "Submitted by the subject themselves, entirely without prompting. Visitors are encouraged to sit with this one for a moment.",
    note: "Placard body text, form copy, all general body copy",
    cssClass: "text-scale-body",
    fontVar: "--font-body",
  },
  {
    step: "label",
    label: "Label / Utility — Engraved Plate",
    detail: "0.6875rem · weight 600 · Public Sans · uppercase · letter-spacing 0.08em",
    specimen: "QUIET VICTORY · ACCESSION NO. 000001 · THE GRAND EXHIBITION — WING I",
    note: "Category tags, accession numbers, wing labels only. The 'engraved plate' register.",
    cssClass: "text-scale-label",
    fontVar: "--font-body",
  },
] as const;

const spacingSteps = [
  { name: "xs", px: "8px", rem: "0.5rem", use: "Tight inline gaps — icon-to-text, tag padding" },
  { name: "sm", px: "16px", rem: "1rem", use: "Component internal padding — button, tag" },
  { name: "md", px: "32px", rem: "2rem", use: "Card internal padding, form field gap" },
  { name: "lg", px: "48px", rem: "3rem", use: "Grid gap between cards" },
  { name: "xl", px: "64px", rem: "4rem", use: "Section padding (top/bottom within a section)" },
  { name: "2xl", px: "96px", rem: "6rem", use: "Major section separation" },
  { name: "3xl", px: "128px", rem: "8rem", use: "Full-page section vertical padding, desktop" },
] as const;

/* ─── Dev Only Overlap Checker ───────────────────────────────────── */
function OverlapChecker({ trigger }: { trigger: number }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    
    // Give layout a tick to settle
    const timer = setTimeout(() => {
      const items = Array.from(document.querySelectorAll('.win-card-masonry-item'));
      const rects = items.map(el => ({
        el,
        rect: el.getBoundingClientRect(),
        id: el.getAttribute('aria-label') || 'card'
      }));

      const overlaps: string[] = [];
      const heightViolations: { card: string; expected: number; actual: number; delta: number }[] = [];

      // 1. Check for intersections
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i].rect;
          const b = rects[j].rect;
          
          const intersects = !(
            a.right <= b.left ||
            a.left >= b.right ||
            a.bottom <= b.top ||
            a.top >= b.bottom
          );
          
          if (intersects) {
            overlaps.push(`${rects[i].id} intersects ${rects[j].id}`);
          }
        }
      }

      // 2. Check heights vs expected spans
      items.forEach(item => {
        const computedStyle = window.getComputedStyle(item);
        const actualHeight = item.getBoundingClientRect().height;
        // On desktop, height is explicitly set via inline style or CSS var, which we can read
        // from the computed style. If it's 'auto', we're on mobile.
        const expectedHeightStr = computedStyle.height;
        if (expectedHeightStr !== 'auto' && expectedHeightStr.endsWith('px')) {
          const expectedHeight = parseFloat(expectedHeightStr);
          const delta = Math.abs(actualHeight - expectedHeight);
          // Allow 1px subpixel rounding tolerance
          if (delta > 1) {
            heightViolations.push({
              card: item.getAttribute('aria-label') || 'card',
              expected: expectedHeight,
              actual: actualHeight,
              delta
            });
          }
        }
      });

      if (overlaps.length > 0) {
        console.error("GRID OVERLAP DETECTED:", overlaps);
      } else {
        console.log("Grid check passed: Zero overlaps.");
      }

      if (heightViolations.length > 0) {
        console.error("HEIGHT VIOLATIONS DETECTED:");
        console.table(heightViolations);
      } else {
        console.log("Height check passed: All cards exactly match reserved spans.");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [trigger]);

  return null;
}

/* ─── Random Size Assignment Section ─────────────────────────────── */
function RandomSizeAssignmentSection() {
  const [seed, setSeed] = useState(42);
  const [showGutters, setShowGutters] = useState(false);

  // 1. Generate 20 sample wins for the demo
  const demoWins = Array.from({ length: 20 }).map((_, i) => {
    // vary text length to test the eligible pool
    let headline = "Took a deep breath.";
    let body = "A quiet victory.";
    if (i % 5 === 0) {
      headline = "Went outside for 8 minutes.";
      body = "Quietly entered into the collection. The matter speaks for itself.";
    } else if (i % 3 === 0) {
      headline = "Replied to that scary email after putting it off for two entire weeks. The response was 'thanks!' and nothing bad happened.";
      body = "Catalogued with due care. It asks for no further defense.";
    } else if (i % 7 === 0) {
      headline = "Cleaned the thing I'd been ignoring.";
      body = "Added to the record today. Nothing essential has been omitted.";
    }

    return { id: i + 1, headline, body };
  });

  // 2. Draw sizes deterministically using the current seed
  const rng = seedRng(seed);
  const recentSizes: (WinCardSize | undefined)[] = [undefined, undefined];
  const items: WinCardGridItem[] = demoWins.map((win) => {
    const cardSize = drawWinCardSize({
      quote: win.headline,
      commentary: win.body,
      recentSizes,
      rng,
    });
    recentSizes[1] = recentSizes[0];
    recentSizes[0] = cardSize;

    return {
      id: win.id,
      variant: "public",
      backgroundId: pairBackground({ id: win.id, headline: win.headline, body: win.body }),
      category: "Demo",
      date: "2026-08-30",
      headline: win.headline,
      body: win.body,
      
      size: cardSize,
      onOpenDetail: () => {},
    };
  });

  return (
    <Section
      title="Win Card — Random Size Assignment"
      subtitle="Size is drawn once at creation and persisted. The grid spans are computed exactly from fixed ratios, guaranteeing zero overlap and uniform spacing."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
        {/* 1. Distribution & 2. Eligible Pool */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          <div>
            <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "0.5rem" }}>
              1. The Distribution
            </span>
            <p className="text-scale-body" style={{ fontSize: "0.875rem", color: "color-mix(in srgb, var(--color-ink) 80%, transparent)", marginBottom: "1rem" }}>
              When a win is created, it draws a size from the eligible pool. The base probabilities are:
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(["sm", "md", "lg", "xl"] as WinCardSize[]).map((tier) => (
                <li key={tier} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "color-mix(in srgb, var(--color-parchment) 50%, transparent)", borderRadius: "var(--radius)" }}>
                  <code style={{ color: "var(--color-gilt)" }}>{tier} ({CARD_SIZE_NAMES[tier]})</code>
                  <span style={{ fontWeight: 600 }}>Weight {TIER_WEIGHTS[tier]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "0.5rem" }}>
              2. The Eligible Pool
            </span>
            <p className="text-scale-body" style={{ fontSize: "0.875rem", color: "color-mix(in srgb, var(--color-ink) 80%, transparent)", marginBottom: "1rem" }}>
              To prevent nonsensical truncation, a win can only draw a size if its content fits within that tier&apos;s text capacity (quote + commentary characters).
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(["sm", "md", "lg", "xl"] as WinCardSize[]).map((tier) => (
                <li key={tier} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "color-mix(in srgb, var(--color-parchment) 50%, transparent)", borderRadius: "var(--radius)" }}>
                  <code style={{ color: "var(--color-gilt)" }}>{tier}</code>
                  <span style={{ fontWeight: 600 }}>≤ {TIER_CAPACITY[tier]} chars</span>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: "0.75rem", color: "color-mix(in srgb, var(--color-ink) 60%, transparent)", marginTop: "1rem" }}>
              Example: A 150-char win is eligible for lg and xl. A 50-char win is eligible for all four.
            </p>
          </div>
        </div>

        {/* 3 & 4. Live Grid Demo & Gutter Overlay */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
            <div>
              <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "0.5rem" }}>
                3. Live Grid Demo & 4. Spacing Proof
              </span>
              <p className="text-scale-body" style={{ fontSize: "0.875rem", color: "color-mix(in srgb, var(--color-ink) 60%, transparent)", margin: 0 }}>
                20 sample wins run through <code>drawWinCardSize</code>. The grid uses exact 1px spans, a looser vertical gutter, and salon-hang column offsets so the wall reads as a gallery hang rather than a feed.
              </p>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                onClick={() => setSeed(s => s + 1)}
                className="btn-ghost"
                style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
              >
                Reshuffle Demo
              </button>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-ink)" }}>
                <input 
                  type="checkbox" 
                  checked={showGutters} 
                  onChange={e => setShowGutters(e.target.checked)} 
                />
                Show Gutters Overlay
              </label>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {process.env.NODE_ENV === "development" && (
              <OverlapChecker trigger={seed} />
            )}
            <WinCardGrid items={items} />
            {showGutters && (
              <style>{`
                .win-card-masonry-grid {
                   background-color: color-mix(in srgb, var(--color-gilt) 20%, transparent);
                   padding: 1px; /* slight pad to show edge gaps */
                }
                .win-card-masonry-item {
                   background-color: var(--color-cream);
                   box-shadow: 0 0 0 1px var(--color-gilt); /* crisp edge */
                }
              `}</style>
            )}
          </div>
        </div>

        {/* 5. Span Table */}
        <div>
          <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "0.5rem" }}>
            5. Span Table (Computed)
          </span>
          <p className="text-scale-body" style={{ fontSize: "0.875rem", color: "color-mix(in srgb, var(--color-ink) 60%, transparent)", marginBottom: "1rem" }}>
            The exact row spans applied to each tier at each breakpoint, based on <code>span = round(W * h/w) + G</code>.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "0.875rem", fontFamily: "var(--font-body)" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid color-mix(in srgb, var(--color-ink) 20%, transparent)" }}>
                  <th style={{ padding: "0.5rem" }}>Size</th>
                  <th style={{ padding: "0.5rem" }}>640px (W=280, G=28)</th>
                  <th style={{ padding: "0.5rem" }}>1024px (W=300, G=36)</th>
                  <th style={{ padding: "0.5rem" }}>1280px (W=300, G=40)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>sm (1:1)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 308 (280px)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 336 (300px)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 340 (300px)</td>
                </tr>
                <tr>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>md (3:4)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 401 (373px)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 436 (400px)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 440 (400px)</td>
                </tr>
                <tr>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>lg (2:3)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 448 (420px)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 486 (450px)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 490 (450px)</td>
                </tr>
                <tr>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>xl (9:16)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 526 (498px)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 569 (533px)</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>span 573 (533px)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Do / Don't */}
        <div>
          <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "1rem" }}>
            6. Do / Don&apos;t
          </span>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
          }}>
            {[
              { type: "do", text: "Draw the size once at creation using drawWinCardSize() and persist it to the database." },
              { type: "dont", text: "Recompute size on read. It would reshuffle the museum on every visit and cause hydration mismatches." },
              { type: "do", text: "Hang the wall as a salon, not a feed — keep the vertical gutter a little looser than the horizontal and offset the first card of each column." },
              { type: "dont", text: "Scale frame stroke weight, corner radius (12px), or padding with card height." },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  padding: "1rem",
                  borderRadius: "var(--radius)",
                  border: `1px solid ${item.type === "do"
                    ? "color-mix(in srgb, var(--color-sage) 40%, transparent)"
                    : "color-mix(in srgb, #c44 35%, transparent)"}`,
                  backgroundColor: item.type === "do"
                    ? "color-mix(in srgb, var(--color-sage) 6%, transparent)"
                    : "color-mix(in srgb, #c44 4%, transparent)",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: item.type === "do" ? "var(--color-sage)" : "#c44",
                  minWidth: "28px",
                  marginTop: "0.05rem",
                }}>
                  {item.type === "do" ? "DO" : "DON'T"}
                </span>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8125rem",
                  lineHeight: 1.55,
                  color: "color-mix(in srgb, var(--color-ink) 80%, transparent)",
                  margin: 0,
                }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function FormsSection() {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authOpen, setAuthOpen] = useState(false);
  const [googleDemoLoading, setGoogleDemoLoading] = useState(false);

  return (
    <Section title="Forms & Inputs" subtitle="Input primitives and authentication patterns. Strict 12px radius and parietal boundaries.">
      <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
        {/* TextField States */}
        <div>
          <h3 className="text-scale-label" style={{ color: "var(--color-gilt)", marginBottom: "1.5rem" }}>
            TextField States
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            <TextField label="Default" placeholder="curator@example.com" />
            <TextField label="Hover / Focus" placeholder="Hover or focus me" />
            <TextField label="Filled" value="curator@example.com" readOnly />
            <TextField label="Error" placeholder="curator@example.com" state="error" error="Please enter a valid email address." />
            <TextField label="Success" placeholder="curator@example.com" state="success" description="Email looks good." />
            <TextField label="Disabled" placeholder="curator@example.com" disabled />
            <TextField label="Read Only" value="curator@example.com" readOnly />
            <TextField label="Small Size (40px)" inputSize="sm" placeholder="curator@example.com" />
          </div>
        </div>

        {/* EmailField Preset */}
        <div>
          <h3 className="text-scale-label" style={{ color: "var(--color-gilt)", marginBottom: "1.5rem" }}>
            EmailField (Validation States & Typo Suggestions)
          </h3>
          <p className="text-scale-body" style={{ color: "color-mix(in srgb, var(--color-ink) 65%, transparent)", marginBottom: "1.25rem", maxWidth: "600px" }}>
            Type a valid email and tab out to see the success state (sage border). Type an invalid email to see the error state (oxide border). Try &quot;gmial.com&quot; to see the typo suggestion.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", maxWidth: "900px" }}>
            <EmailField id="sg-email-live" label="Email (live validation)" placeholder="curator@example.com" />
            <TextField label="Email (success preview)" value="curator@example.com" state="success" description={<span style={{ color: "var(--color-sage)" }}>Email looks good.</span>} readOnly />
            <TextField label="Email (error preview)" value="curator@bad" state="error" error="Please enter a valid email address." readOnly />
          </div>
        </div>

        {/* PasswordField */}
        <div>
          <h3 className="text-scale-label" style={{ color: "var(--color-gilt)", marginBottom: "1.5rem" }}>
            PasswordField
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", maxWidth: "900px" }}>
            <PasswordField
              id="sg-pw-default"
              label="Password (default)"
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <PasswordField
              id="sg-pw-error"
              label="Password (error)"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error="Your password must be at least 8 characters."
            />
            <PasswordField
              id="sg-pw-disabled"
              label="Password (disabled)"
              placeholder="At least 8 characters"
              autoComplete="current-password"
              disabled
            />
          </div>
        </div>

        {/* FormDivider */}
        <div>
          <h3 className="text-scale-label" style={{ color: "var(--color-gilt)", marginBottom: "1.5rem" }}>
            FormDivider
          </h3>
          <div style={{ maxWidth: "420px" }}>
            <FormDivider label="Or continue with" />
          </div>
        </div>

        {/* Google Button Interactive States */}
        <div>
          <h3 className="text-scale-label" style={{ color: "var(--color-gilt)", marginBottom: "1.5rem" }}>
            Google Button (Interactive States)
          </h3>
          <p className="text-scale-body" style={{ color: "color-mix(in srgb, var(--color-ink) 65%, transparent)", marginBottom: "1.25rem", maxWidth: "600px" }}>
            Hover, press, and focus states. Click &quot;Loading&quot; to preview the pending spinner.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", maxWidth: "900px" }}>
            {/* Default / hover / active — live interactive */}
            <div>
              <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)", marginBottom: "8px", display: "block" }}>
                Default / Hover / Active
              </span>
              <button
                type="button"
                className="mtw-google-btn"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  height: "46px", width: "100%", borderRadius: "var(--radius)",
                  backgroundColor: "var(--color-cream)",
                  border: "1.5px solid color-mix(in srgb, var(--color-ink) 22%, transparent)",
                  color: "var(--color-ink)", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 500,
                  cursor: "pointer",
                  transition: "background-color 180ms ease-out, border-color 180ms ease-out, transform 120ms ease-out",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                  <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Loading state */}
            <div>
              <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)", marginBottom: "8px", display: "block" }}>
                Loading / Pending
              </span>
              <button
                type="button"
                onClick={() => { setGoogleDemoLoading((v) => !v); }}
                className="mtw-google-btn"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  height: "46px", width: "100%", borderRadius: "var(--radius)",
                  backgroundColor: "var(--color-cream)",
                  border: "1.5px solid color-mix(in srgb, var(--color-ink) 22%, transparent)",
                  color: "var(--color-ink)", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 500,
                  cursor: "pointer", opacity: googleDemoLoading ? 0.7 : 1,
                  transition: "background-color 180ms ease-out, border-color 180ms ease-out, opacity 180ms ease-out",
                }}
              >
                {googleDemoLoading ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }} aria-hidden="true">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                )}
                {googleDemoLoading ? "Connecting…" : "Click to toggle loading"}
              </button>
            </div>

            {/* Disabled state */}
            <div>
              <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)", marginBottom: "8px", display: "block" }}>
                Disabled
              </span>
              <button
                type="button"
                disabled
                className="mtw-google-btn"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  height: "46px", width: "100%", borderRadius: "var(--radius)",
                  backgroundColor: "var(--color-cream)",
                  border: "1.5px solid color-mix(in srgb, var(--color-ink) 22%, transparent)",
                  color: "var(--color-ink)", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 500,
                  cursor: "not-allowed", opacity: 0.7,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                  <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>

        {/* Buttons & AuthModal Triggers */}
        <div>
          <h3 className="text-scale-label" style={{ color: "var(--color-gilt)", marginBottom: "1.5rem" }}>
            Authentication Modal
          </h3>
          <p className="text-scale-body" style={{ color: "color-mix(in srgb, var(--color-ink) 70%, transparent)", marginBottom: "1.5rem", maxWidth: "600px" }}>
            Email/password sign-in and sign-up, plus Google OAuth. Compact 46px fields, text-based Back control, interactive Google button with hover/active/loading states, visible email validation.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Button onClick={() => { setAuthMode("signin"); setAuthOpen(true); }}>
              Open Sign In
            </Button>
            <Button variant="ghost" onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
              Open Sign Up
            </Button>
          </div>
        </div>
      </div>
      
      {/* Google button CSS — shared by demo instances */}
      <style>{`
        .mtw-google-btn:hover:not(:disabled) {
          background-color: var(--color-parchment) !important;
          border-color: color-mix(in srgb, var(--color-ink) 35%, transparent) !important;
        }
        .mtw-google-btn:active:not(:disabled) {
          background-color: color-mix(in srgb, var(--color-parchment) 85%, var(--color-ink)) !important;
          transform: translateY(1px);
        }
        .mtw-google-btn:focus-visible {
          outline: 2px solid var(--color-ink);
          outline-offset: 2px;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Auth Modal Portal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </Section>
  );
}


/* ─── Section wrapper ────────────────────────────────────────────── */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-20">
      <div className="mb-8 pb-4" style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)" }}>
        <p className="text-scale-label" style={{ color: "var(--color-gilt)", marginBottom: "0.25rem" }}>
          Design System
        </p>
        <h2 className="text-scale-heading-2" style={{ color: "var(--color-ink)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-scale-body" style={{ color: "color-mix(in srgb, var(--color-ink) 55%, transparent)", marginTop: "0.25rem" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function StyleguidePage() {
  return (
    <div
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-ink)",
        fontFamily: "var(--font-body)",
        minHeight: "100dvh",
      }}
    >
      {/* ── Page header ──────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid var(--color-gilt)",
          backgroundColor: "var(--color-parchment)",
          padding: "3rem 4rem 2.5rem",
        }}
      >
        <p
          className="text-scale-label"
          style={{ color: "var(--color-gilt)", marginBottom: "0.5rem" }}
        >
          Internal Reference · Dev Only
        </p>
        <h1
          className="text-scale-display"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)", marginBottom: "0.75rem" }}
        >
          Design System
        </h1>
        <p className="text-scale-body" style={{ color: "color-mix(in srgb, var(--color-ink) 60%, transparent)", maxWidth: "48rem" }}>
          A visual inventory of every token, type specimen, and component primitive
          used across Museum of Tiny Wins. Review this before building any real screens.
          The gilt border treatment and 12px radius are load-bearing — do not deviate from either.
        </p>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            marginTop: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {[
            ["Next.js", "16.2.10"],
            ["Tailwind", "v4 (CSS-first)"],
            ["Fraunces", "variable · opsz axis"],
            ["Public Sans", "400 / 500 / 600"],
            ["Border radius", "12px (constant)"],
          ].map(([key, val]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
              <span
                className="text-scale-label"
                style={{ color: "color-mix(in srgb, var(--color-ink) 45%, transparent)" }}
              >
                {key}
              </span>
              <span
                className="text-scale-body"
                style={{ fontWeight: 500, color: "var(--color-ink)" }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>

        {/* ── Dev route quick links ───────────────────────────────── */}
        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid color-mix(in srgb, var(--color-gilt) 25%, transparent)",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            className="text-scale-label"
            style={{ color: "color-mix(in srgb, var(--color-ink) 40%, transparent)" }}
          >
            Dev Routes:
          </span>
          <a
            href="/reveal-demo"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              color: "var(--color-sage)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            /reveal-demo — Frame Reveal Animation →
          </a>
          <a
            href="/exhibition"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              color: "var(--color-sage)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            /exhibition — Public Exhibition Hall →
          </a>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main style={{ padding: "4rem", maxWidth: "80rem", margin: "0 auto" }}>

        {/* ─────────────────────────────────────────────────────────
            1. COLOR SWATCHES
        ───────────────────────────────────────────────────────── */}
        <Section
          title="Colour Tokens"
          subtitle="Six tokens. The palette is deliberately quiet — gilt is the only bold accent."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {colors.map((c) => (
              <div
                key={c.name}
                style={{
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  border: c.border ? "1px solid color-mix(in srgb, var(--color-ink) 15%, transparent)" : "none",
                  boxShadow: "0 1px 6px color-mix(in srgb, var(--color-ink) 6%, transparent)",
                }}
              >
                {/* Swatch block */}
                <div
                  style={{
                    backgroundColor: c.hex,
                    height: "88px",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "0.6rem 0.875rem",
                  }}
                >
                  {/* Show the CSS var name on the swatch itself */}
                  <span
                    style={{
                      color: c.textColor,
                      fontFamily: "var(--font-body)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      opacity: 0.6,
                    }}
                  >
                    {c.cssVar}
                  </span>
                </div>
                {/* Metadata */}
                <div
                  style={{
                    backgroundColor: "var(--color-parchment)",
                    padding: "0.875rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--color-ink)",
                      }}
                    >
                      {c.name}
                    </span>
                    <code
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        color: "var(--color-gilt)",
                        backgroundColor: "color-mix(in srgb, var(--color-gilt) 8%, transparent)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "4px",
                      }}
                    >
                      {c.hex}
                    </code>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      lineHeight: 1.5,
                      color: "color-mix(in srgb, var(--color-ink) 60%, transparent)",
                      margin: 0,
                    }}
                  >
                    {c.role}
                  </p>
                  <p
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                      marginTop: "0.5rem",
                    }}
                  >
                    Tailwind: <code>{c.tailwind}</code>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-scale-heading-2" style={{ marginTop: "4.5rem", marginBottom: "2rem" }}>
            Semantic Form Colors
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {semanticColors.map((c) => (
              <div
                key={c.name}
                style={{
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  border: c.border ? "1px solid color-mix(in srgb, var(--color-ink) 15%, transparent)" : "none",
                  boxShadow: "0 1px 6px color-mix(in srgb, var(--color-ink) 6%, transparent)",
                }}
              >
                {/* Swatch block */}
                <div
                  style={{
                    backgroundColor: c.hex,
                    height: "88px",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "0.6rem 0.875rem",
                  }}
                >
                  <span
                    style={{
                      color: c.textColor,
                      fontFamily: "var(--font-body)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      opacity: 0.8,
                    }}
                  >
                    {c.cssVar}
                  </span>
                </div>
                {/* Metadata */}
                <div
                  style={{
                    backgroundColor: "var(--color-parchment)",
                    padding: "0.875rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--color-ink)",
                      }}
                    >
                      {c.name}
                    </span>
                    <code
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        color: "var(--color-gilt)",
                        backgroundColor: "color-mix(in srgb, var(--color-gilt) 8%, transparent)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "4px",
                      }}
                    >
                      {c.hex}
                    </code>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      lineHeight: 1.5,
                      color: "color-mix(in srgb, var(--color-ink) 60%, transparent)",
                      margin: 0,
                    }}
                  >
                    {c.role}
                  </p>
                  <p
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                      marginTop: "0.5rem",
                    }}
                  >
                    Tailwind: <code>{c.tailwind}</code>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ─────────────────────────────────────────────────────────
            2. TYPOGRAPHY SPECIMENS
        ───────────────────────────────────────────────────────── */}
        <Section
          title="Type Scale"
          subtitle="Four named steps. Fraunces for display and headings; Public Sans for body and labels."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {typeSpecimens.map((t) => (
              <div
                key={t.step}
                style={{
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--color-parchment)",
                  padding: "2rem 2.5rem",
                  border: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
                }}
              >
                {/* Step metadata */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1.5rem",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <span
                      className="text-scale-label"
                      style={{ color: "var(--color-gilt)", display: "block", marginBottom: "0.2rem" }}
                    >
                      {t.step}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.8rem",
                        color: "color-mix(in srgb, var(--color-ink) 50%, transparent)",
                      }}
                    >
                      {t.label}
                    </span>
                  </div>
                  <code
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "color-mix(in srgb, var(--color-ink) 50%, transparent)",
                      backgroundColor: "color-mix(in srgb, var(--color-ink) 6%, transparent)",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "4px",
                      alignSelf: "flex-start",
                    }}
                  >
                    {t.detail}
                  </code>
                </div>

                {/* Specimen text */}
                <p
                  className={t.cssClass}
                  style={{
                    fontFamily: `var(${t.fontVar})`,
                    color: "var(--color-ink)",
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                  {t.specimen}
                </p>

                {/* Usage note */}
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    color: "color-mix(in srgb, var(--color-ink) 45%, transparent)",
                    marginTop: "1rem",
                    marginBottom: 0,
                    fontStyle: "italic",
                  }}
                >
                  ↳ {t.note}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─────────────────────────────────────────────────────────
            4. BUTTON STATES
        ───────────────────────────────────────────────────────── */}
        <Section
          title="Button States"
          subtitle="Primary (sage fill, gilt border) and ghost variants. All states visible simultaneously."
        >
          <div
            style={{
              borderRadius: "var(--radius)",
              backgroundColor: "var(--color-parchment)",
              padding: "2.5rem",
              border: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
            }}
          >
            {/* Primary button states */}
            <p
              className="text-scale-label"
              style={{ color: "color-mix(in srgb, var(--color-ink) 45%, transparent)", marginBottom: "1.5rem" }}
            >
              Primary — sage background · gilt border · cream text
            </p>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem", alignItems: "center" }}>
              {/* Default */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <button className="btn-primary" style={{ pointerEvents: "none" }}>
                  Frame It
                </button>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                  }}
                >
                  Default
                </span>
              </div>

              {/* Hover — forced */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <button
                  className="btn-primary"
                  style={{
                    pointerEvents: "none",
                    backgroundColor: "color-mix(in srgb, var(--color-sage) 88%, black 12%)",
                    boxShadow: "0 2px 12px color-mix(in srgb, var(--color-gilt) 30%, transparent)",
                  }}
                >
                  Frame It
                </button>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                  }}
                >
                  Hover
                </span>
              </div>

              {/* Active — forced */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <button
                  className="btn-primary"
                  style={{
                    pointerEvents: "none",
                    backgroundColor: "color-mix(in srgb, var(--color-sage) 75%, black 25%)",
                    boxShadow: "none",
                    transform: "translateY(1px)",
                  }}
                >
                  Frame It
                </button>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                  }}
                >
                  Active
                </span>
              </div>

              {/* Live — actually interactive */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <button className="btn-primary" onClick={() => alert("Primary button clicked!")}>
                  Frame It
                </button>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "color-mix(in srgb, var(--color-gilt) 80%, transparent)",
                  }}
                >
                  ← Interactive
                </span>
              </div>
            </div>

            {/* Ghost button states */}
            <p
              className="text-scale-label"
              style={{
                color: "color-mix(in srgb, var(--color-ink) 45%, transparent)",
                marginBottom: "1.5rem",
                marginTop: "0.5rem",
              }}
            >
              Ghost — transparent background · muted ink border
            </p>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
              {/* Default */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <button className="btn-ghost" style={{ pointerEvents: "none" }}>
                  Frame Another
                </button>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "color-mix(in srgb, var(--color-ink) 40%, transparent)" }}>
                  Default
                </span>
              </div>

              {/* Hover — forced */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <button
                  className="btn-ghost"
                  style={{
                    pointerEvents: "none",
                    backgroundColor: "color-mix(in srgb, var(--color-parchment) 80%, transparent)",
                    borderColor: "color-mix(in srgb, var(--color-ink) 55%, transparent)",
                  }}
                >
                  Frame Another
                </button>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "color-mix(in srgb, var(--color-ink) 40%, transparent)" }}>
                  Hover
                </span>
              </div>

              {/* Live */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <button className="btn-ghost" onClick={() => alert("Ghost button clicked!")}>Frame Another</button>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "color-mix(in srgb, var(--color-gilt) 80%, transparent)" }}>
                  ← Interactive
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* ─────────────────────────────────────────────────────────
            5. UI LANGUAGE: WORDS OVER ICONS
        ───────────────────────────────────────────────────────── */}
        <Section
          title="UI Language: Words over Icons"
          subtitle="The interface should feel editorial and literate. Use words instead of icons unless an icon is absolutely functionally necessary."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Rule explanation */}
            <div
              style={{
                borderRadius: "var(--radius)",
                backgroundColor: "var(--color-parchment)",
                padding: "2rem 2.5rem",
                border: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)",
              }}
            >
              <h3 className="text-scale-heading-2" style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--color-ink)" }}>
                Core Principle
              </h3>
              <p className="text-scale-body" style={{ color: "var(--color-ink)", marginBottom: "1.5rem" }}>
                This product should feel calm, museum-like, and language-led — not app-like or dashboard-like.
                Avoid standalone icons, icon-only buttons, and generic SaaS-style iconography.
                The interface should feel like it is spoken in words, not reduced to symbols.
              </p>
              
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <h4 className="text-scale-label" style={{ color: "var(--color-gilt)", marginBottom: "0.5rem" }}>PREFER WORDS</h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <li className="text-scale-body" style={{ color: "var(--color-ink)", fontSize: "0.9rem" }}>✓ <strong>MENU / CLOSE</strong> (not hamburger/X)</li>
                    <li className="text-scale-body" style={{ color: "var(--color-ink)", fontSize: "0.9rem" }}>✓ <strong>BACK</strong> (not left-arrow)</li>
                    <li className="text-scale-body" style={{ color: "var(--color-ink)", fontSize: "0.9rem" }}>✓ <strong>NEXT / PREVIOUS</strong> (not chevrons)</li>
                    <li className="text-scale-body" style={{ color: "var(--color-ink)", fontSize: "0.9rem" }}>✓ <strong>X / Instagram</strong> (not social icons)</li>
                  </ul>
                </div>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <h4 className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 40%, transparent)", marginBottom: "0.5rem" }}>ALLOWED EXCEPTIONS</h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <li className="text-scale-body" style={{ color: "color-mix(in srgb, var(--color-ink) 70%, transparent)", fontSize: "0.9rem" }}>• Password show/hide eye toggle</li>
                    <li className="text-scale-body" style={{ color: "color-mix(in srgb, var(--color-ink) 70%, transparent)", fontSize: "0.9rem" }}>• Functional loading spinners</li>
                    <li className="text-scale-body" style={{ color: "color-mix(in srgb, var(--color-ink) 70%, transparent)", fontSize: "0.9rem" }}>• Required third-party branding (Google)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Specimen Buttons */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                className="btn-ghost"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Close
              </button>
              <button
                className="btn-ghost"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Menu
              </button>
              <button
                className="btn-ghost"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Back
              </button>
              <button
                className="btn-ghost"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Previous
              </button>
              <button
                className="btn-ghost"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </Section>

        {/* ─────────────────────────────────────────────────────────
            6. SIGNATURE GILT FRAME — FRAMED CARD MOCK
        ───────────────────────────────────────────────────────── */}
        <Section
          title="Signature Element — The Gilt Frame"
          subtitle="A thin gilt-gold rule tracing the 12px rounded-rect border of every framed object. This is the one recurring visual signature across the whole app."
        >
          {/* Show the border in isolation first */}
          <div
            style={{
              marginBottom: "2.5rem",
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            {/* Border token */}
            <div
              style={{
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-gilt)",
                backgroundColor: "var(--color-parchment)",
                padding: "1.5rem 2rem",
                minWidth: "200px",
              }}
            >
              <p className="text-scale-label" style={{ color: "var(--color-gilt)", marginBottom: "0.5rem" }}>
                Gilt frame
              </p>
              <code style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "color-mix(in srgb, var(--color-ink) 55%, transparent)" }}>
                border: 1px solid var(--color-gilt)<br />
                border-radius: var(--radius)
              </code>
            </div>

            {/* CSS class */}
            <div
              style={{
                borderRadius: "var(--radius)",
                border: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)",
                backgroundColor: "var(--color-parchment)",
                padding: "1.5rem 2rem",
                minWidth: "200px",
              }}
            >
              <p className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 45%, transparent)", marginBottom: "0.5rem" }}>
                No gilt frame
              </p>
              <code style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "color-mix(in srgb, var(--color-ink) 40%, transparent)" }}>
                border: 1px solid muted-ink<br />
                (form inputs, secondary surfaces)
              </code>
            </div>
          </div>

          {/* ── Three live WinCard instances: hero / public / personal ── */}
          <p
            className="text-scale-label"
            style={{ color: "color-mix(in srgb, var(--color-ink) 40%, transparent)", marginBottom: "1.5rem" }}
          >
            Live component — three variants side by side. Hover over public and personal to compare lift.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            {/* ── hero ───────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <span
                className="text-scale-label"
                style={{ color: "var(--color-gilt)" }}
              >
                hero — non-interactive
              </span>
              <WinCard
                variant="hero"
                backgroundId={3}
                category="Quiet Victory"
                date="2026-08-30"
                headline="Replied to that scary email."
                body="On loan from a private collection of small victories. Historians remain divided on its significance, but agree it should not be forgotten."
                
              />
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.7rem",
                  color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                copy.md §7.5 combo 1 · bg-3 (dark scrim) · no hover states
              </p>
            </div>

            {/* ── public ─────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <span
                className="text-scale-label"
                style={{ color: "var(--color-gilt)" }}
              >
                public — hover lift
              </span>
              <WinCard
                variant="public"
                backgroundId={7}
                category="Small Graces"
                date="2026-08-30"
                headline="Went outside for 8 minutes."
                body="Newly catalogued for the museum registry. Future generations will undoubtedly understand."
                
                onOpenDetail={() => alert("WinDetailModal stub — not yet built.")}
              />
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.7rem",
                  color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                copy.md §7.5 combo 2 · bg-7 (light scrim) · hover to see lift
              </p>
            </div>

            {/* ── personal ───────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <span
                className="text-scale-label"
                style={{ color: "#A67C3A" }}
              >
                personal — richer gilt
              </span>
              <WinCard
                variant="personal"
                backgroundId={12}
                category="Endurance"
                date="2026-08-30"
                headline="Made the bed before noon."
                body="A domestic landmark. Conservators note the tucked corners with particular reverence."
                
                onOpenDetail={() => alert("WinDetailModal stub — not yet built.")}
              />
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.7rem",
                  color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                copy.md §2.6 win #1 · bg-12 (dark scrim) · deeper gilt
              </p>
            </div>
          </div>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
              marginTop: "1.5rem",
              fontStyle: "italic",
            }}
          >
            ↳ Live <code style={{ fontFamily: "monospace" }}>WinCard</code> component with adaptive scrims. Text color automatically adapts to light vs dark images.
          </p>

          {/* ── Mobile constraints check ── */}
          <div
            style={{
              marginTop: "4rem",
              borderTop: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)",
              paddingTop: "2rem",
            }}
          >
            <p
              className="text-scale-label"
              style={{ color: "color-mix(in srgb, var(--color-ink) 40%, transparent)", marginBottom: "1.5rem" }}
            >
              Mobile constraints check (~300px width preview frame)
            </p>
            <div style={{ maxWidth: "300px" }}>
              <WinCard
                variant="public"
                backgroundId={4}
                category="Extremely Long Category Name That Should Truncate"
                date="2026-08-30"
                headline="A very long headline that requires fluid typography to scale down smoothly without breaking layout."
                body="The generated placard body also scales fluidly via container queries, ensuring that even at narrow widths, the text remains legible but proportional to the space."
                
              />
            </div>
          </div>
        </Section>

        {/* ─────────────────────────────────────────────────────────
            7. SPACING SCALE
        ───────────────────────────────────────────────────────── */}
        <Section
          title="Spacing Scale"
          subtitle="Generous by default — white space is atmosphere, not waste. When in doubt, go one step larger."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {spacingSteps.map((s) => (
              <div
                key={s.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--color-parchment)",
                  padding: "1rem 1.5rem",
                  border: "1px solid color-mix(in srgb, var(--color-ink) 6%, transparent)",
                  flexWrap: "wrap",
                }}
              >
                {/* Visual bar */}
                <div
                  style={{
                    height: "8px",
                    width: s.px,
                    backgroundColor: "var(--color-sage)",
                    borderRadius: "4px",
                    flexShrink: 0,
                    opacity: 0.7,
                  }}
                />
                {/* Step name + values */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", minWidth: "140px" }}>
                  <span
                    className="text-scale-label"
                    style={{ color: "var(--color-gilt)", minWidth: "2rem" }}
                  >
                    {s.name}
                  </span>
                  <code
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      color: "color-mix(in srgb, var(--color-ink) 55%, transparent)",
                    }}
                  >
                    {s.px} / {s.rem}
                  </code>
                </div>
                {/* Usage */}
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "color-mix(in srgb, var(--color-ink) 55%, transparent)",
                    margin: 0,
                    flexGrow: 1,
                  }}
                >
                  {s.use}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─────────────────────────────────────────────────────────
            8. RADIUS CONSTANT
        ───────────────────────────────────────────────────────── */}
        <Section
          title="Border Radius Constant"
          subtitle="12px everywhere. No exceptions. Load-bearing for the reveal animation."
        >
          <div
            style={{
              borderRadius: "var(--radius)",
              backgroundColor: "var(--color-parchment)",
              padding: "2rem 2.5rem",
              border: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
              display: "flex",
              gap: "3rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Show 12px applied to multiple shapes */}
            {[
              { label: "Card", w: "120px", h: "80px" },
              { label: "Button", w: "100px", h: "44px" },
              { label: "Input", w: "200px", h: "48px" },
              { label: "Modal", w: "80px", h: "100px" },
            ].map((shape) => (
              <div
                key={shape.label}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}
              >
                <div
                  style={{
                    width: shape.w,
                    height: shape.h,
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-gilt)",
                    backgroundColor: "color-mix(in srgb, var(--color-parchment) 60%, var(--color-cream))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.6rem",
                      color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
                    }}
                  >
                    12px
                  </span>
                </div>
                <span
                  className="text-scale-label"
                  style={{ color: "color-mix(in srgb, var(--color-ink) 40%, transparent)" }}
                >
                  {shape.label}
                </span>
              </div>
            ))}
            <div style={{ flexGrow: 1 }}>
              <p
                className="text-scale-body"
                style={{
                  color: "color-mix(in srgb, var(--color-ink) 60%, transparent)",
                  margin: 0,
                  maxWidth: "360px",
                }}
              >
                <strong style={{ color: "var(--color-ink)" }}>--radius: 12px</strong> is the single source of truth.
                The Win Card reveal animation registers against this exact value for the
                frame-draw-in sequence. Never deviate per-component.
              </p>
            </div>
          </div>
        </Section>

        {/* ─────────────────────────────────────────────────────────
            9. SECTION DIVIDER
        ───────────────────────────────────────────────────────── */}
        <Section
          title="Section Divider"
          subtitle="Gallery room transition — a responsive whitespace band with an optional centered gilt rule. Acts as the brass threshold strip between museum rooms."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Variant table */}
            {(
              [
                {
                  variant: "sm",
                  mobile: "1.5rem / 24px",
                  tablet: "2.25rem / 36px",
                  desktop: "3rem / 48px",
                  use: "Minor breathing room — between closely related content blocks.",
                },
                {
                  variant: "md",
                  mobile: "2rem / 32px",
                  tablet: "3rem / 48px",
                  desktop: "4rem / 64px",
                  use: "Standard gallery room transition — landing page between Hero, What This Is, and Final CTA.",
                },
                {
                  variant: "lg",
                  mobile: "3rem / 48px",
                  tablet: "4.5rem / 72px",
                  desktop: "6rem / 96px",
                  use: "Major section pause — reserved for future long-form content pages.",
                },
              ] as const
            ).map((row) => (
              <div
                key={row.variant}
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--color-parchment)",
                  padding: "1rem 1.5rem",
                  border: "1px solid color-mix(in srgb, var(--color-ink) 6%, transparent)",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                {/* Variant label */}
                <span
                  className="text-scale-label"
                  style={{ color: "var(--color-gilt)", minWidth: "2.5rem", paddingTop: "0.1rem" }}
                >
                  {row.variant}
                </span>

                {/* Responsive values */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "220px" }}>
                  <code style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "color-mix(in srgb, var(--color-ink) 55%, transparent)" }}>
                    Mobile: {row.mobile}
                  </code>
                  <code style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "color-mix(in srgb, var(--color-ink) 55%, transparent)" }}>
                    Tablet: {row.tablet}
                  </code>
                  <code style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "color-mix(in srgb, var(--color-ink) 55%, transparent)" }}>
                    Desktop: {row.desktop}
                  </code>
                </div>

                {/* Usage note */}
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "color-mix(in srgb, var(--color-ink) 55%, transparent)",
                    margin: 0,
                    flexGrow: 1,
                  }}
                >
                  {row.use}
                </p>
              </div>
            ))}

            {/* Rule toggle note */}
            <p
              className="text-scale-body"
              style={{
                color: "color-mix(in srgb, var(--color-ink) 55%, transparent)",
                margin: 0,
                fontSize: "0.8rem",
                paddingTop: "0.5rem",
                borderTop: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
              }}
            >
              <strong style={{ color: "var(--color-ink)" }}>showRule</strong> (default: <code style={{ fontFamily: "monospace" }}>true</code>) — renders a 60px × 1px gilt line at the center of the divider, animating in on scroll. Set <code style={{ fontFamily: "monospace" }}>showRule=&#123;false&#125;</code> for pure whitespace with no decorative mark.
            </p>
          </div>
        </Section>

        {/* ─────────────────────────────────────────────────────────
            10. LAYOUT SHELL & RESPONSIVE NAVBAR SYSTEM
        ───────────────────────────────────────────────────────── */}
        <Section
          title="Layout Shell — Responsive Navbar System"
          subtitle="The persistent navigation bar wrapping every page. Production-quality, responsive museum navigation built with Fraunces & Public Sans."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
            
            {/* ── Architecture & Specification Card ── */}
            <div
              style={{
                borderRadius: "var(--radius)",
                backgroundColor: "var(--color-parchment)",
                padding: "2rem",
                border: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)",
              }}
            >
              <h3 className="text-scale-heading-2" style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--color-ink)" }}>
                Navbar Specification & Responsive Behavior
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div>
                  <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "0.25rem" }}>
                    Desktop (1024px+)
                  </span>
                  <p className="text-scale-body" style={{ fontSize: "0.85rem", color: "color-mix(in srgb, var(--color-ink) 70%, transparent)", margin: 0 }}>
                    Wide 3-zone layout (Brand LEFT | Nav CENTER | Auth+CTA RIGHT). Max width 1320px with generous horizontal padding.
                  </p>
                </div>

                <div>
                  <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "0.25rem" }}>
                    Tablet (768px – 1023px)
                  </span>
                  <p className="text-scale-body" style={{ fontSize: "0.85rem", color: "color-mix(in srgb, var(--color-ink) 70%, transparent)", margin: 0 }}>
                    Brand LEFT | User/Auth + Add Your Win CTA + Accessible Menu Trigger RIGHT. Nav links collapse into menu panel.
                  </p>
                </div>

                <div>
                  <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "0.25rem" }}>
                    Mobile (320px – 767px)
                  </span>
                  <p className="text-scale-body" style={{ fontSize: "0.85rem", color: "color-mix(in srgb, var(--color-ink) 70%, transparent)", margin: 0 }}>
                    Brand LEFT | Accessible Menu Trigger RIGHT (44px+ touch target). Panel reveals links, account status, and full CTA.
                  </p>
                </div>
              </div>

              <div style={{ borderTop: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)", paddingTop: "1rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div>
                  <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 45%, transparent)" }}>WCAG Accessibility:</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-ink)", display: "block", marginTop: "0.1rem" }}>
                    <code>aria-expanded</code> · <code>aria-controls</code> · ESC key handler · 44px+ touch targets
                  </span>
                </div>
                <div>
                  <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 45%, transparent)" }}>Animation:</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-ink)", display: "block", marginTop: "0.1rem" }}>
                    Framer Motion <code>AnimatePresence</code> · Restrained opacity & height transition
                  </span>
                </div>
              </div>
            </div>

            {/* ── 0. NAVIGATION LINK INTERACTION STATES ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.75rem", backgroundColor: "var(--color-parchment)", borderRadius: "var(--radius)", border: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)" }}>
              <span className="text-scale-label" style={{ color: "var(--color-gilt)" }}>
                Navigation Link Interaction States (Shared Across All Viewports)
              </span>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
                {/* Default */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 45%, transparent)" }}>
                    1. Default State (Initial Load / Unselected)
                  </span>
                  <div className="navbar-center-nav" style={{ padding: "0.75rem 1.25rem", backgroundColor: "var(--color-cream)", borderRadius: "var(--radius)", border: "1px border-mix" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", opacity: 0.55, color: "var(--color-ink)", fontWeight: 500 }}>
                      Exhibition
                    </span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", opacity: 0.55, color: "var(--color-ink)", fontWeight: 500 }}>
                      My Museum
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "color-mix(in srgb, var(--color-ink) 50%, transparent)", margin: 0 }}>
                    Neutral link availability (opacity: 0.55, no underline, no gilt highlight).
                  </p>
                </div>

                {/* Hover */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 45%, transparent)" }}>
                    2. Hover State (User Hovering)
                  </span>
                  <div className="navbar-center-nav" style={{ padding: "0.75rem 1.25rem", backgroundColor: "var(--color-cream)", borderRadius: "var(--radius)" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", opacity: 0.85, color: "var(--color-ink)", fontWeight: 500, position: "relative" }}>
                      Exhibition
                      <span style={{ position: "absolute", bottom: "-2px", left: 0, width: "100%", height: "1px", backgroundColor: "var(--color-gilt)" }} />
                    </span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", opacity: 0.55, color: "var(--color-ink)", fontWeight: 500 }}>
                      My Museum
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "color-mix(in srgb, var(--color-ink) 50%, transparent)", margin: 0 }}>
                    Interactive feedback (opacity: 0.85, gilt underline draw-in).
                  </p>
                </div>

                {/* Active */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 45%, transparent)" }}>
                    3. Active State (Current Destination)
                  </span>
                  <div className="navbar-center-nav" style={{ padding: "0.75rem 1.25rem", backgroundColor: "var(--color-cream)", borderRadius: "var(--radius)" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", opacity: 1, color: "var(--color-ink)", fontWeight: 500, position: "relative" }}>
                      Exhibition
                      <span style={{ position: "absolute", bottom: "-2px", left: 0, width: "100%", height: "1px", backgroundColor: "var(--color-gilt)" }} />
                    </span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", opacity: 0.55, color: "var(--color-ink)", fontWeight: 500 }}>
                      My Museum
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "color-mix(in srgb, var(--color-ink) 50%, transparent)", margin: 0 }}>
                    Current route match (opacity: 1, gilt underline visible).
                  </p>
                </div>
              </div>
            </div>

            {/* ── 1. UNAAUTHENTICATED NAVBAR VARIANTS ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              <div style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-gilt) 30%, transparent)", paddingBottom: "0.5rem" }}>
                <span className="text-scale-label" style={{ color: "var(--color-gilt)", fontSize: "0.75rem" }}>
                  1. Unauthenticated Navbar States (isAuthenticated = false)
                </span>
              </div>

              {/* Desktop — Default State (activePath="") */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}>
                  Desktop — Default State (Initial Load / Landing Page)
                </span>
                <div style={{ border: "1px dashed color-mix(in srgb, var(--color-ink) 15%, transparent)", borderRadius: "var(--radius)", overflow: "visible" }}>
                  <Navbar isAuthenticated={false} forceViewport="desktop" activePath="" />
                </div>
              </div>

              {/* Tablet */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}>
                  Tablet (768px – 1023px)
                </span>
                <div style={{ maxWidth: "880px", border: "1px dashed color-mix(in srgb, var(--color-ink) 15%, transparent)", borderRadius: "var(--radius)", overflow: "visible" }}>
                  <Navbar isAuthenticated={false} forceViewport="tablet" />
                </div>
              </div>

              {/* Mobile Grid (Closed & Open) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}>
                    Mobile Closed (375px)
                  </span>
                  <div style={{ maxWidth: "375px", border: "1px dashed color-mix(in srgb, var(--color-ink) 15%, transparent)", borderRadius: "var(--radius)", overflow: "visible" }}>
                    <Navbar isAuthenticated={false} forceViewport="mobile" initialOpen={false} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}>
                    Mobile Open (375px)
                  </span>
                  <div style={{ maxWidth: "375px", border: "1px dashed color-mix(in srgb, var(--color-ink) 15%, transparent)", borderRadius: "var(--radius)", overflow: "visible" }}>
                    <Navbar isAuthenticated={false} forceViewport="mobile" initialOpen={true} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. AUTHENTICATED NAVBAR VARIANTS ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", marginTop: "1rem" }}>
              <div style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-gilt) 30%, transparent)", paddingBottom: "0.5rem" }}>
                <span className="text-scale-label" style={{ color: "var(--color-gilt)", fontSize: "0.75rem" }}>
                  2. Authenticated Navbar States (isAuthenticated = true, firstName = &quot;Maya&quot;)
                </span>
              </div>

              {/* Desktop */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}>
                  Desktop (1024px+)
                </span>
                <div style={{ border: "1px dashed color-mix(in srgb, var(--color-ink) 15%, transparent)", borderRadius: "var(--radius)", overflow: "visible" }}>
                  <Navbar isAuthenticated={true} firstName="Maya" forceViewport="desktop" activePath="/museum" />
                </div>
              </div>

              {/* Tablet */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}>
                  Tablet (768px – 1023px)
                </span>
                <div style={{ maxWidth: "880px", border: "1px dashed color-mix(in srgb, var(--color-ink) 15%, transparent)", borderRadius: "var(--radius)", overflow: "visible" }}>
                  <Navbar isAuthenticated={true} firstName="Maya" forceViewport="tablet" />
                </div>
              </div>

              {/* Mobile Grid (Closed & Open) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}>
                    Mobile Closed (375px)
                  </span>
                  <div style={{ maxWidth: "375px", border: "1px dashed color-mix(in srgb, var(--color-ink) 15%, transparent)", borderRadius: "var(--radius)", overflow: "visible" }}>
                    <Navbar isAuthenticated={true} firstName="Maya" forceViewport="mobile" initialOpen={false} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}>
                    Mobile Open (375px)
                  </span>
                  <div style={{ maxWidth: "375px", border: "1px dashed color-mix(in srgb, var(--color-ink) 15%, transparent)", borderRadius: "var(--radius)", overflow: "visible" }}>
                    <Navbar isAuthenticated={true} firstName="Maya" forceViewport="mobile" initialOpen={true} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. LIVE INTERACTIVE NAVBAR TEST ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <span className="text-scale-label" style={{ color: "var(--color-gilt)" }}>
                3. Live Dynamic Window-Responsive Component Instance
              </span>
              <p className="text-scale-body" style={{ fontSize: "0.85rem", color: "color-mix(in srgb, var(--color-ink) 60%, transparent)", margin: 0 }}>
                Resize your browser window to test dynamic breakpoint switching in real time.
              </p>
              <div style={{ borderRadius: "var(--radius)", overflow: "visible", border: "1px solid color-mix(in srgb, var(--color-ink) 15%, transparent)" }}>
                <Navbar isAuthenticated={true} firstName="Maya" />
              </div>
            </div>

            {/* Footer Preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
              <span className="text-scale-label" style={{ color: "var(--color-gilt)" }}>Persistent Page Footer</span>
              <div style={{ borderRadius: "var(--radius)", overflow: "visible", border: "1px dashed color-mix(in srgb, var(--color-ink) 15%, transparent)" }}>
                <Footer />
              </div>
            </div>

          </div>
        </Section>

        {/* ─────────────────────────────────────────────────────────
            WIN CARD — SIZE SCALE  (appended section per spec §6)
        ───────────────────────────────────────────────────────── */}
        <Section
          title="Win Card — Size Scale"
          subtitle="Four closed tiers. Width never varies — only height varies via aspect ratio. Frame weight, corner radius, and content padding are pixel-identical across every size."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>

            {/* ── 1. THE SCALE ─────────────────────────────────────── */}
            <div>
              <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "1rem" }}>
                1. The Scale — All Four Sizes
              </span>
              <p className="text-scale-body" style={{ fontSize: "0.875rem", color: "color-mix(in srgb, var(--color-ink) 60%, transparent)", marginBottom: "1.5rem" }}>
                Rendered at 280px column width (≥ 640px breakpoint). Labels show token · museum name · aspect ratio · pixel height at this column width.
              </p>

              {/* Side-by-side scale */}
              <div style={{
                display: "flex",
                gap: "20px",
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}>
                {(["sm", "md", "lg", "xl"] as WinCardSize[]).map((size) => {
                  const COL_W = 280;
                  const RATIOS_DECIMAL: Record<WinCardSize, number> = { sm: 1, md: 3/4, lg: 2/3, xl: 9/16 };
                  const heightPx = Math.round(COL_W / RATIOS_DECIMAL[size]);
                  return (
                    <div key={size} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: "0 0 auto" }}>
                      {/* Label above card */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <span className="text-scale-label" style={{ color: "var(--color-gilt)", fontSize: "0.7rem" }}>
                          {size} · {CARD_SIZE_NAMES[size]}
                        </span>
                        <span className="text-scale-label" style={{ color: "color-mix(in srgb, var(--color-ink) 45%, transparent)", fontSize: "0.6rem" }}>
                          {CARD_RATIOS[size].replace(" / ", ":")} · {heightPx}px @ 280px col
                        </span>
                      </div>
                      {/* Card */}
                      <div style={{ width: `${COL_W}px` }}>
                        <WinCard
                          variant="public"
                          backgroundId={((["sm","md","lg","xl"].indexOf(size) * 3 + 1) as 1|2|3|4|5|6|7|8|9|10|11|12|13|14)}
                          category={size === "sm" ? "Resilience" : size === "md" ? "Quiet Victory" : size === "lg" ? "Endurance" : "Triumph"}
                          date="2026-08-30"
                          headline={size === "sm" ? "Made the bed." : size === "md" ? "Replied to that scary email." : size === "lg" ? "Showed up, even when I didn't want to." : "Sent the apology I'd been sitting on for three weeks."}
                          body={size === "sm" ? "Added to the record today. It merits brief attention." : size === "md" ? "Quietly entered into the collection. Visitors tend to understand." : size === "lg" ? "Catalogued with due care. Even modest works endure." : "Received into the permanent collection. Its place here is secure."}
                          
                          size={size}
                          onOpenDetail={() => {}}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 2. TEXT BUDGET TABLE ─────────────────────────────── */}
            <div>
              <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "1rem" }}>
                2. Text Budget per Tier
              </span>
              <p className="text-scale-body" style={{ fontSize: "0.875rem", color: "color-mix(in srgb, var(--color-ink) 60%, transparent)", marginBottom: "1.25rem" }}>
                Clamping is the only overflow strategy. Never auto-scale or shrink type below the tier&apos;s specified size. The meta line (accession no. / year) is always one line and is never clamped away.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8125rem",
                }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-gilt)" }}>
                      {["Token", "Museum name", "Quote size / line-height", "Quote clamp", "Commentary size / line-height", "Commentary clamp", "Safe quote length"].map((h) => (
                        <th key={h} style={{
                          textAlign: "left",
                          padding: "0.5rem 0.75rem",
                          fontFamily: "var(--font-body)",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          color: "color-mix(in srgb, var(--color-ink) 55%, transparent)",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(["sm", "md", "lg", "xl"] as WinCardSize[]).map((size, i) => {
                      const b = TEXT_BUDGET[size];
                      const safeLen: Record<WinCardSize, string> = { sm: "≤ 45 chars", md: "≤ 90 chars", lg: "≤ 150 chars", xl: "≤ 210 chars" };
                      return (
                        <tr key={size} style={{
                          borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
                          backgroundColor: i % 2 === 0 ? "transparent" : "color-mix(in srgb, var(--color-parchment) 50%, transparent)",
                        }}>
                          <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600, color: "var(--color-gilt)" }}>{size}</td>
                          <td style={{ padding: "0.6rem 0.75rem", color: "color-mix(in srgb, var(--color-ink) 70%, transparent)" }}>{CARD_SIZE_NAMES[size]}</td>
                          <td style={{ padding: "0.6rem 0.75rem" }}>{b.quoteFontSize}px / {b.quoteLineHeight}</td>
                          <td style={{ padding: "0.6rem 0.75rem" }}>{b.quoteClamp} lines</td>
                          <td style={{ padding: "0.6rem 0.75rem" }}>{b.bodyFontSize}px / {b.bodyLineHeight}</td>
                          <td style={{ padding: "0.6rem 0.75rem" }}>{b.bodyClamp} lines</td>
                          <td style={{ padding: "0.6rem 0.75rem", color: "color-mix(in srgb, var(--color-ink) 60%, transparent)" }}>{safeLen[size]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>


            {/* ── 4. TRUNCATION PROOF ─────────────────────────────── */}
            <div>
              <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "0.5rem" }}>
                4. Truncation Proof — One Card per Tier, 500-character Quote
              </span>
              <p className="text-scale-body" style={{ fontSize: "0.875rem", color: "color-mix(in srgb, var(--color-ink) 60%, transparent)", marginBottom: "1.5rem" }}>
                Each card below is fed intentionally overlong text (500+ characters). The clamp holds at every tier. The frame never grows to accommodate overflow — only the ellipsis indicates truncation.
              </p>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-end", flexWrap: "wrap" }}>
                {(["sm", "md", "lg", "xl"] as WinCardSize[]).map((size) => (
                  <div key={size} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <span className="text-scale-label" style={{ color: "var(--color-gilt)", fontSize: "0.65rem" }}>
                      {size} · overlong text (500 chars)
                    </span>
                    <div style={{ width: "280px" }}>
                      <WinCard
                        variant="public"
                        backgroundId={(["sm","md","lg","xl"].indexOf(size) + 2) as 2|3|4|5}
                        category="Truncation Test"
                        date="2026-08-30"
                        headline="This is a deliberately overlong headline that goes on and on well past any reasonable length to verify the line clamp holds at its tier boundary and the card frame never grows to accommodate the extra text no matter how many words are added here at the very end."
                        body="This is deliberately overlong commentary text designed to overflow its budget. The clamp should halt at the specified number of lines for this size tier. Visitors will never see beyond this point. The museum does not permit its frames to be distorted by the ambitions of any single exhibit. This sentence exists purely to exceed the character budget. And this one too. And this one. The frame holds."
                        
                        size={size}
                        onOpenDetail={() => {}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* ── 6. TOKENS ────────────────────────────────────────── */}
            <div>
              <span className="text-scale-label" style={{ color: "var(--color-gilt)", display: "block", marginBottom: "1rem" }}>
                6. Tokens
              </span>

              {/* Aspect-ratio tokens */}
              <div style={{ marginBottom: "1.5rem" }}>
                <span className="text-scale-label" style={{ fontSize: "0.65rem", color: "color-mix(in srgb, var(--color-ink) 45%, transparent)", display: "block", marginBottom: "0.75rem" }}>
                  Aspect-ratio CSS Custom Properties
                </span>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "0.75rem",
                }}>
                  {(["sm", "md", "lg", "xl"] as WinCardSize[]).map((size) => (
                    <div
                      key={size}
                      style={{
                        padding: "0.875rem 1rem",
                        borderRadius: "var(--radius)",
                        border: "1px solid color-mix(in srgb, var(--color-gilt) 30%, transparent)",
                        backgroundColor: "var(--color-parchment)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                      }}
                    >
                      <code style={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        color: "var(--color-gilt)",
                        letterSpacing: "0.02em",
                      }}>
                        --mtw-card-ratio-{size}
                      </code>
                      <span style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--color-ink)",
                      }}>
                        {CARD_RATIOS[size]}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.7rem",
                        color: "color-mix(in srgb, var(--color-ink) 50%, transparent)",
                      }}>
                        {CARD_SIZE_NAMES[size]} · {size}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column-width tokens */}
              <div style={{ marginBottom: "1.5rem" }}>
                <span className="text-scale-label" style={{ fontSize: "0.65rem", color: "color-mix(in srgb, var(--color-ink) 45%, transparent)", display: "block", marginBottom: "0.75rem" }}>
                  Grid Column-Width CSS Custom Properties
                </span>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "0.75rem",
                }}>
                  {[
                    { name: "--mtw-col-sm", value: "280px", note: "≥ 640px, gap 20px" },
                    { name: "--mtw-col-md", value: "300px", note: "≥ 1024px, gap 24px" },
                    { name: "--mtw-col-lg", value: "300px", note: "≥ 1280px, gap 28px (four columns)" },
                    { name: "--mtw-col-gap-sm", value: "20px", note: "Gutter at ≥ 640px" },
                    { name: "--mtw-col-gap-md", value: "24px", note: "Gutter at ≥ 1024px" },
                  ].map((tok) => (
                    <div
                      key={tok.name}
                      style={{
                        padding: "0.875rem 1rem",
                        borderRadius: "var(--radius)",
                        border: "1px solid color-mix(in srgb, var(--color-gilt) 30%, transparent)",
                        backgroundColor: "var(--color-parchment)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                      }}
                    >
                      <code style={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        color: "var(--color-gilt)",
                        letterSpacing: "0.02em",
                      }}>
                        {tok.name}
                      </code>
                      <span style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--color-ink)",
                      }}>
                        {tok.value}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.7rem",
                        color: "color-mix(in srgb, var(--color-ink) 50%, transparent)",
                      }}>
                        {tok.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid-row-span reference table */}
              <div>
                <span className="text-scale-label" style={{ fontSize: "0.65rem", color: "color-mix(in srgb, var(--color-ink) 45%, transparent)", display: "block", marginBottom: "0.75rem" }}>
                  Masonry Row-Span Reference (grid-auto-rows: 4px)
                </span>
                <p className="text-scale-body" style={{ fontSize: "0.8rem", color: "color-mix(in srgb, var(--color-ink) 55%, transparent)", marginBottom: "0.875rem" }}>
                  N = round((colWidth / ratio + gutter) / 4). These are the pre-computed constants in WinCardGrid.tsx.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", fontSize: "0.8125rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--color-gilt)" }}>
                        {["Size", "280px / 20px gap", "300px / 24px gap", "312px / 24px gap"].map((h) => (
                          <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-ink) 55%, transparent)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        { size: "sm", spans: [75, 81, 84] },
                        { size: "md", spans: [98, 106, 110] },
                        { size: "lg", spans: [110, 119, 123] },
                        { size: "xl", spans: [129, 139, 145] },
                      ] as Array<{ size: WinCardSize; spans: number[] }>).map(({ size, spans }, i) => (
                        <tr key={size} style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)", backgroundColor: i % 2 === 0 ? "transparent" : "color-mix(in srgb, var(--color-parchment) 50%, transparent)" }}>
                          <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600, color: "var(--color-gilt)" }}>{size}</td>
                          {spans.map((s, j) => (
                            <td key={j} style={{ padding: "0.6rem 0.75rem" }}>span {s}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </Section>

        {/* ─────────────────────────────────────────────────────────
            WIN CARD — RANDOM SIZE ASSIGNMENT  (appended section per 02 spec §3)
        ───────────────────────────────────────────────────────── */}
        <RandomSizeAssignmentSection />

        {/* ─────────────────────────────────────────────────────────
            FORMS & INPUTS
        ───────────────────────────────────────────────────────── */}
        <FormsSection />

      </main>
    </div>
  );
}

