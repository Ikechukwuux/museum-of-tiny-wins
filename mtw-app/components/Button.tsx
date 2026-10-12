"use client";

import { forwardRef } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", isLoading = false, children, disabled, style, ...props }, ref) => {
    const baseClass = variant === "primary" ? "btn-primary" : "btn-ghost";
    
    // Cursor handled by CSS usually, but we can set it here for completeness or rely on CSS
    const isDisabled = disabled || isLoading;
    const disabledStyles: React.CSSProperties = isDisabled
      ? { cursor: "not-allowed" }
      : {};

    const combinedClassName = `${baseClass} ${className}`.trim();

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={isDisabled}
        aria-busy={isLoading}
        style={{
          position: "relative",
          ...disabledStyles,
          ...style,
        }}
        {...props}
      >
        <span
          style={{
            visibility: isLoading ? "hidden" : "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {children}
        </span>
        {isLoading && (
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
