"use client";

import React, { forwardRef, useId } from "react";

export interface FormFieldProps {
  id: string;
  label: string;
  error?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export function FormField({ id, label, error, description, children }: FormFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Label: Public Sans, 12px, uppercase, 0.08em tracking, ink ~60% */}
      <label
        htmlFor={id}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "color-mix(in srgb, var(--color-ink) 60%, transparent)",
          marginBottom: "6px",
          userSelect: "none",
        }}
      >
        {label}
      </label>
      
      {/* Input Slot */}
      {children}

      {/* Helper/Error Slot: 13px, reserved height (1 line) to prevent layout shift */}
      <div
        style={{
          marginTop: "4px",
          minHeight: "18px",
          fontFamily: "var(--font-body)",
          fontSize: "13px",
        }}
        aria-live="polite"
      >
        {error ? (
          <span style={{ color: "var(--color-oxide)" }}>{error}</span>
        ) : description ? (
          <span style={{ color: "color-mix(in srgb, var(--color-ink) 55%, transparent)" }}>
            {description}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: React.ReactNode;
  description?: React.ReactNode;
  inputSize?: "sm" | "md"; // md: 52px, sm: 44px
  state?: "default" | "success" | "error";
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      description,
      inputSize = "md",
      state = "default",
      className = "",
      id: providedId,
      disabled,
      readOnly,
      ...props
    },
    ref
  ) => {
    const backupId = useId();
    const id = providedId || backupId;
    const isError = state === "error" || !!error;
    const isSuccess = state === "success";

    // Determine border color based on state
    let borderColor = "color-mix(in srgb, var(--color-ink) 22%, transparent)";
    if (isError) borderColor = "var(--color-oxide)";
    else if (isSuccess) borderColor = "var(--color-sage)";

    // Determine text and background styles
    let backgroundColor = "var(--color-parchment)";
    let textColor = "var(--color-ink)";

    if (disabled) {
      backgroundColor = "var(--color-cream)";
      textColor = "color-mix(in srgb, var(--color-ink) 30%, transparent)";
    } else if (isError) {
      backgroundColor = "color-mix(in srgb, var(--mtw-oxide) 6%, var(--color-parchment))";
    } else if (isSuccess) {
      backgroundColor = "color-mix(in srgb, var(--color-sage) 6%, var(--color-parchment))";
    }

    return (
      <FormField id={id} label={label} error={error} description={description}>
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={isError ? "true" : undefined}
          aria-describedby={error || description ? `${id}-description` : undefined}
          style={{
            height: inputSize === "md" ? "46px" : "40px",
            padding: "0 16px",
            borderRadius: "var(--radius)",
            backgroundColor,
            color: textColor,
            border: `1.5px solid ${borderColor}`,
            fontFamily: "var(--font-body)",
            fontSize: "16px", // 16px minimum to prevent iOS zoom
            outline: "none",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            cursor: disabled ? "not-allowed" : readOnly ? "default" : "text",
            opacity: disabled ? 0.8 : 1,
            width: "100%",
          }}
          className={`mtw-textfield ${className}`}
          {...props}
        />
        <style>{`
          .mtw-textfield {
            caret-color: var(--color-gilt);
          }
          .mtw-textfield::selection {
            background-color: color-mix(in srgb, var(--color-gilt) 20%, transparent);
            color: var(--color-ink);
          }
          .mtw-textfield::placeholder {
            color: color-mix(in srgb, var(--color-ink) 35%, transparent);
          }
          .mtw-textfield:hover:not(:disabled):not(:read-only) {
            border-color: color-mix(in srgb, var(--color-ink) 35%, transparent);
          }
          .mtw-textfield:focus-visible:not(:disabled):not(:read-only) {
            border-color: var(--color-gilt) !important;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-gilt) 18%, transparent);
          }
          /* Override hover border if error or success */
          .mtw-textfield[aria-invalid="true"]:hover {
            border-color: var(--color-oxide) !important;
          }
          /* Can't easily target success via pure CSS without an attribute, handled via inline style overrides usually, 
             but inline style border takes precedence anyway. */
        `}</style>
      </FormField>
    );
  }
);
TextField.displayName = "TextField";
