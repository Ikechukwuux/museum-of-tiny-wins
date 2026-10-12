/**
 * PasswordField — Museum of Tiny Wins
 *
 * Password input primitive consistent with the existing design system.
 * Shares the same visual shell as TextField: 52px height, 16px font,
 * 12px radius, parchment fill, ink hairline border.
 *
 * Features:
 *   • type="password" by default, toggleable to type="text" via trailing eye icon
 *   • Toggle is keyboard-accessible and screen-reader labelled
 *   • autocomplete prop: "current-password" (sign-in) or "new-password" (sign-up)
 *   • Validate-on-blur, re-validate-on-change once an error is shown
 *   • Error slot uses the same reserved-height FormField pattern
 *   • Supports paste (do NOT block password managers)
 *   • Minimum 16px font to prevent iOS zoom
 *
 * agents.md §2.1: business logic lives here, not inline in page components.
 */

"use client";

import React, { useState, forwardRef, useId } from "react";
import { FormField } from "./TextField";

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: string;
  error?: React.ReactNode;
  description?: React.ReactNode;
  inputSize?: "sm" | "md";
  /** "current-password" for sign-in, "new-password" for sign-up / confirm */
  autoComplete?: "current-password" | "new-password" | "off";
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label,
      error,
      description,
      inputSize = "md",
      autoComplete = "current-password",
      className = "",
      id: providedId,
      disabled,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const backupId = useId();
    const id = providedId || backupId;
    const toggleId = `${id}-toggle`;
    const [revealed, setRevealed] = useState(false);
    const isError = !!error;

    let borderColor = "color-mix(in srgb, var(--color-ink) 22%, transparent)";
    if (isError) borderColor = "var(--color-oxide)";

    const height = inputSize === "md" ? "46px" : "40px";

    return (
      <FormField id={id} label={label} error={error} description={description}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            ref={ref}
            id={id}
            type={revealed ? "text" : "password"}
            autoComplete={autoComplete}
            disabled={disabled}
            aria-invalid={isError ? "true" : undefined}
            aria-describedby={error || description ? `${id}-description` : undefined}
            onBlur={onBlur}
            onChange={onChange}
            style={{
              height,
              padding: "0 48px 0 16px", // right padding for toggle button
              borderRadius: "var(--radius)",
              backgroundColor: disabled
                ? "var(--color-cream)"
                : "var(--color-parchment)",
              color: disabled
                ? "color-mix(in srgb, var(--color-ink) 30%, transparent)"
                : "var(--color-ink)",
              border: `1.5px solid ${borderColor}`,
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              cursor: disabled ? "not-allowed" : "text",
              opacity: disabled ? 0.8 : 1,
              width: "100%",
            }}
            className={`mtw-textfield mtw-passwordfield ${className}`}
            {...props}
          />

          {/* Show / Hide toggle */}
          <button
            type="button"
            id={toggleId}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-controls={id}
            tabIndex={disabled ? -1 : 0}
            disabled={disabled}
            onClick={() => setRevealed((r) => !r)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: "4px",
              cursor: disabled ? "not-allowed" : "pointer",
              color: "color-mix(in srgb, var(--color-ink) 45%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "color 0.15s ease",
            }}
            className="mtw-pw-toggle"
          >
            {revealed ? (
              /* Eye-off icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              /* Eye icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        <style>{`
          .mtw-passwordfield {
            caret-color: var(--color-gilt);
          }
          .mtw-passwordfield::selection {
            background-color: color-mix(in srgb, var(--color-gilt) 20%, transparent);
            color: var(--color-ink);
          }
          .mtw-passwordfield::placeholder {
            color: color-mix(in srgb, var(--color-ink) 35%, transparent);
          }
          .mtw-passwordfield:hover:not(:disabled) {
            border-color: color-mix(in srgb, var(--color-ink) 35%, transparent);
          }
          .mtw-passwordfield:focus-visible:not(:disabled) {
            border-color: var(--color-gilt) !important;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-gilt) 18%, transparent);
          }
          .mtw-passwordfield[aria-invalid="true"]:hover {
            border-color: var(--color-oxide) !important;
          }
          .mtw-pw-toggle:hover:not(:disabled) {
            color: var(--color-ink);
          }
          .mtw-pw-toggle:focus-visible {
            outline: 2px solid var(--color-gilt);
            outline-offset: 2px;
          }
        `}</style>
      </FormField>
    );
  }
);
PasswordField.displayName = "PasswordField";
