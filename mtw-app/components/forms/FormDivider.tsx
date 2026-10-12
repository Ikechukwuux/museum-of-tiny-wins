"use client";

import React from "react";

export interface FormDividerProps {
  label?: string;
}

export function FormDivider({ label }: FormDividerProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", margin: "14px 0" }}>
      <div
        style={{
          flex: 1,
          height: "1px",
          backgroundColor: "color-mix(in srgb, var(--color-ink) 12%, transparent)",
        }}
      />
      {label && (
        <span
          style={{
            margin: "0 16px",
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            fontWeight: 500,
            color: "color-mix(in srgb, var(--color-ink) 45%, transparent)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          flex: 1,
          height: "1px",
          backgroundColor: "color-mix(in srgb, var(--color-ink) 12%, transparent)",
        }}
      />
    </div>
  );
}
