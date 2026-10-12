/**
 * CollectionIntro — Museum of Tiny Wins
 *
 * Shared, two-part "wall label" intro for the collection pages
 * (Exhibition Hall and My Museum). Both pages share this architecture so
 * they read as one family.
 *
 * Left  — the room label: a small engraved overline, a serif title, a short
 *         supporting line, an optional detail line (collection count), and
 *         an optional action (e.g. "Add a Tiny Win").
 * Right — a small, restrained curatorial note: museum marginalia, not a
 *         second headline and not a feature module.
 *
 * The whole page (intro → rail → wall → continuation) is composed on one
 * disciplined content rail; this intro anchors its left edge. See
 * globals.css `.collection-intro` / `.collection-note` for layout.
 */

import type { ReactNode } from "react";

export interface CuratorialNote {
  overline: string;
  body: string;
}

interface CollectionIntroProps {
  /** Small engraved overline / room label (e.g. "The Grand Exhibition — Wing I"). */
  overline: string;
  /** Main page title (e.g. "Public Exhibition Hall"). */
  title: string;
  /** Short supporting line under the title. */
  supporting?: string;
  /** Optional tiny detail line under the supporting line (e.g. collection count). */
  detail?: string;
  /** Optional curatorial note for the right-hand placard. */
  note?: CuratorialNote;
  /** Optional action (e.g. "Add a Tiny Win" button), rendered in the left block. */
  action?: ReactNode;
}

export function CollectionIntro({
  overline,
  title,
  supporting,
  detail,
  note,
  action,
}: CollectionIntroProps) {
  return (
    <header className="collection-intro">
      {/* ── Left: room label ─────────────────────────────────────── */}
      <div style={{ minWidth: 0 }}>
        <p
          className="label-engraved"
          style={{ color: "var(--color-gilt)", margin: 0, marginBottom: "0.9rem" }}
        >
          {overline}
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            color: "var(--color-ink)",
            margin: 0,
            maxWidth: "22ch",
          }}
        >
          {title}
        </h1>

        {supporting && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
              lineHeight: 1.6,
              color: "color-mix(in srgb, var(--color-ink) 62%, transparent)",
              margin: 0,
              marginTop: "1rem",
              maxWidth: "34rem",
            }}
          >
            {supporting}
          </p>
        )}

        {detail && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
              margin: 0,
              marginTop: "1.25rem",
            }}
          >
            {detail}
          </p>
        )}

        {action && <div style={{ marginTop: "1.75rem" }}>{action}</div>}
      </div>

      {/* ── Right: curatorial note placard ───────────────────────── */}
      {note && (
        <div className="collection-note">
          <span
            className="label-engraved"
            style={{
              color: "color-mix(in srgb, var(--color-gilt) 85%, var(--color-ink))",
              display: "block",
              margin: 0,
              marginBottom: "0.75rem",
            }}
          >
            {note.overline}
          </span>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(0.9rem, 1vw, 1rem)",
              lineHeight: 1.55,
              fontStyle: "italic",
              color: "color-mix(in srgb, var(--color-ink) 58%, transparent)",
              margin: 0,
            }}
          >
            {note.body}
          </p>
        </div>
      )}
    </header>
  );
}
