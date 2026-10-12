"use client";

import React, { useState, forwardRef, useEffect } from "react";
import { TextField, TextFieldProps } from "./TextField";

export interface EmailFieldProps extends Omit<TextFieldProps, "type" | "inputMode" | "autoComplete" | "autoCapitalize" | "autoCorrect" | "spellCheck"> {
  onValueChange?: (value: string) => void;
  onValidEmail?: (isValid: boolean) => void;
}

// Very lenient regex: local part, @, dot-bearing domain
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Common typos map
const COMMON_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "hotmai.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahou.com": "yahoo.com",
  "outloo.com": "outlook.com",
};

export const EmailField = forwardRef<HTMLInputElement, EmailFieldProps>(
  (
    {
      value,
      onChange,
      onBlur,
      onValueChange,
      onValidEmail,
      error: externalError,
      description: externalDescription,
      state: externalState,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(value || "");
    const [internalError, setInternalError] = useState<string | undefined>();
    const [hasBlurred, setHasBlurred] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);

    // Sync external value
    useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value);
      }
    }, [value]);

    const validate = (val: string, showErrors: boolean) => {
      let isError = false;
      let errMsg: string | undefined = undefined;
      let newSuggestion: string | null = null;

      const trimmed = val.trim().toLowerCase();

      if (trimmed && !EMAIL_REGEX.test(trimmed)) {
        isError = true;
        errMsg = "Please enter a valid email address.";
      } else if (trimmed) {
        // Check for typos if valid structure
        const [, domain] = trimmed.split("@");
        if (domain && COMMON_TYPOS[domain]) {
          newSuggestion = trimmed.replace(`@${domain}`, `@${COMMON_TYPOS[domain]}`);
        }
      }

      setSuggestion(newSuggestion);

      if (showErrors) {
        setInternalError(errMsg);
      }
      
      onValidEmail?.(!isError && trimmed.length > 0);
      return !isError;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalValue(val);
      onChange?.(e);
      onValueChange?.(val);

      // Re-validate on change ONLY if we already showed an error
      if (internalError) {
        validate(val, true);
      } else {
        // Still check for typos silently
        validate(val, false);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setHasBlurred(true);
      
      // Auto-trim and lowercase on blur
      const trimmed = localValue.toString().trim().toLowerCase();
      if (trimmed !== localValue) {
        setLocalValue(trimmed);
        onValueChange?.(trimmed);
        // We'd need to mock the event if we were calling onChange but we can just let state handle it
      }

      validate(trimmed, true);
      onBlur?.(e);
    };

    const acceptSuggestion = () => {
      if (suggestion) {
        setLocalValue(suggestion);
        onValueChange?.(suggestion);
        setSuggestion(null);
        setInternalError(undefined);
        onValidEmail?.(true);
      }
    };

    const displayError = externalError || internalError;
    const isValid = !displayError && localValue.toString().trim().length > 0 && EMAIL_REGEX.test(localValue.toString().trim().toLowerCase());
    const computedState = displayError ? "error" : (isValid && hasBlurred) ? "success" : externalState;

    // Show success description when valid and blurred (no external description override)
    let descriptionContent: React.ReactNode = externalDescription;

    if (suggestion && !displayError) {
      descriptionContent = (
        <span>
          Did you mean{" "}
          <button
            type="button"
            onClick={acceptSuggestion}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: "inherit",
              fontSize: "inherit",
              color: "var(--color-sage)",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {suggestion}
          </button>
          ?
        </span>
      );
    } else if (isValid && hasBlurred && !externalDescription) {
      descriptionContent = (
        <span style={{ color: "var(--color-sage)" }}>Email looks good.</span>
      );
    }

    return (
      <TextField
        ref={ref}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        error={displayError}
        description={descriptionContent}
        state={computedState}
        {...props}
      />
    );
  }
);
EmailField.displayName = "EmailField";
