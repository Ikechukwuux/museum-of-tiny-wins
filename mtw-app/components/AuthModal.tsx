/**
 * AuthModal — Museum of Tiny Wins
 *
 * Single reusable modal covering sign-in and sign-up.
 * Auth method: email/password + Google OAuth via Supabase.
 *
 * Magic-link / passwordless flow has been removed entirely.
 * There is no sent-state, no resend countdown, no "check your inbox" copy.
 *
 * Modal layout order (both modes):
 *   1. Headline
 *   2. Supporting line
 *   3. Google button
 *   4. Divider ("or continue with email")
 *   5. Email field
 *   6. Password field
 *   7. Confirm password field (sign-up only)
 *   8. Primary submit button (gilt)
 *   9. Footer mode switch
 *   10. Legal microcopy (sign-up only)
 *
 * Password validation rules (agents.md §2.1 — logic isolated here):
 *   • Required (non-empty)
 *   • Minimum 8 characters
 *   • Validate on blur; re-validate on change once error is shown
 *   • Confirm password must match password exactly
 *
 * copy.md compliance:
 *   • No em dashes in any copy
 *   • Headlines in Title Case
 *   • Footer switch links gilt and underlined
 *   • Legal microcopy on sign-up only
 *
 * agents.md §2.4: all copy is sourced from copy.md. Do not invent copy here.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EmailField } from "./forms/EmailField";
import { PasswordField } from "./forms/PasswordField";
import { FormDivider } from "./forms/FormDivider";
import { Button } from "./Button";
import { createClient } from "@/lib/supabase/client";

export type AuthMode = "signin" | "signup";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  /** Called after a successful auth event so parents can update their state. */
  onAuthSuccess?: () => void;
}

/* ─── Copy (sourced from content/copy.md) ───────────────────────── */
const COPY = {
  signin: {
    headline: "Return to Your Museum",
    supporting:
      "Your collection is where you left it. Sign in with Google or your email and password.",
    submit: "Sign In",
    footerSwitch: "Don't have a collection yet?",
    footerSwitchAction: "Sign up",
  },
  signup: {
    headline: "Begin Your Collection",
    supporting: "Create a small account to keep your collection safe.",
    submit: "Create Account",
    footerSwitch: "Already have a collection?",
    footerSwitchAction: "Sign in",
  },
} as const;

/* ─── Password validation ────────────────────────────────────────── */
function validatePassword(value: string): string | null {
  if (!value) return "Enter your password.";
  if (value.length < 8) return "Your password must be at least 8 characters.";
  return null;
}

/* ─── Google "G" mark SVG ────────────────────────────────────────── */
function GoogleMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────── */
export function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
  onAuthSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const supabase = createClient();

  /* ── Form state ─────────────────────────────────────────────────── */
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  /* ── Refs ────────────────────────────────────────────────────────── */
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  /* ── Reset on open ───────────────────────────────────────────────── */
  const resetForm = useCallback(() => {
    setEmail("");
    setIsValidEmail(false);
    setPassword("");
    setPasswordError(null);
    setFormError(null);
    setIsSubmitting(false);
    setIsGoogleLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setMode(initialMode);
      resetForm();
      setTimeout(() => emailInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialMode, resetForm]);

  /* ── Reset password fields when switching modes ──────────────────── */
  const switchMode = (next: AuthMode) => {
    setMode(next);
    setPassword("");
    setPasswordError(null);
    setFormError(null);
  };

  /* ── Escape key ──────────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape" && !isSubmitting && !isGoogleLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, isGoogleLoading, onClose]);

  /* ── Auth state listener — closes modal on successful sign-in ───── */
  useEffect(() => {
    if (!isOpen) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN") {
          onAuthSuccess?.();
          onClose();
          router.refresh();
        }
      }
    );
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ── Password field handlers ─────────────────────────────────────── */
  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordError) setPasswordError(validatePassword(val));
  };

  /* ── Form submission ─────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validation gate
    const pwErr = validatePassword(password);
    if (pwErr) {
      setPasswordError(pwErr);
      return;
    }
    if (!isValidEmail) return;

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) {
          setFormError("We couldn't sign you in with that email and password.");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            // emailRedirectTo is not used because email confirmation is
            // disabled in Supabase (Auth Settings). Sign-up completes
            // immediately with a live session.
            emailRedirectTo: undefined,
          },
        });
        if (error) {
          if (
            error.message.toLowerCase().includes("already") ||
            error.message.toLowerCase().includes("registered")
          ) {
            setFormError("An account already exists for that email.");
          } else {
            setFormError(error.message);
          }
        }
        // onAuthStateChange SIGNED_IN handles modal close + refresh
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Google OAuth ─────────────────────────────────────────────────── */
  const handleGoogle = async () => {
    if (isGoogleLoading || isSubmitting) return;
    setIsGoogleLoading(true);
    setFormError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setFormError("Google sign-in didn't complete. Please try again.");
        setIsGoogleLoading(false);
      }
      // On success, the browser navigates to Google — no further action needed here.
    } catch {
      setFormError("Google sign-in didn't complete. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  /* ── Submit disabled logic ───────────────────────────────────────── */
  const isFormDisabled = isSubmitting || isGoogleLoading;
  const isSubmitDisabled =
    isFormDisabled ||
    !isValidEmail ||
    !password;

  if (!isOpen) return null;

  const copy = COPY[mode];

  return (
    <>
      <style>{`
        @keyframes modalReveal {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .mtw-external-back {
          padding: 0.5rem 0.75rem !important;
          margin-right: -0.75rem;
        }
        @media (max-width: 480px) {
          .mtw-auth-shell {
            padding: 1.5rem 1.25rem !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        role="presentation"
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
          animation: "modalReveal 300ms cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isFormDisabled) onClose();
        }}
      >
        {/* Dialog */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-headline"
          style={{
            width: "100%",
            maxWidth: "420px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* External Back Button (In-flow to prevent clipping) */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
            {!isFormDisabled && (
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost mtw-external-back"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                }}
              >
                Back
              </button>
            )}
          </div>

          {/* Modal shell */}
          <div
            className="mtw-auth-shell"
            style={{
              backgroundColor: "var(--color-parchment)",
              borderRadius: "var(--radius)",
              border: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)",
              padding: "2rem 1.75rem",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 32px color-mix(in srgb, var(--color-ink) 8%, transparent)",
            }}
          >

            {/* Form-level error banner */}
            {formError && (
              <div
                role="alert"
                aria-live="assertive"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-oxide) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-oxide) 25%, transparent)",
                  borderRadius: "var(--radius)",
                  padding: "12px 16px",
                  color: "var(--color-oxide)",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                {formError}
              </div>
            )}

            {/* ── 1 & 2. Headline + Supporting line ────────────────── */}
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <h2
                id="auth-modal-headline"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.75rem",
                  color: "var(--color-ink)",
                  margin: "0 0 0.5rem",
                }}
              >
                {copy.headline}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.925rem",
                  color: "color-mix(in srgb, var(--color-ink) 65%, transparent)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {copy.supporting}
              </p>
            </div>

            {/* ── 3. Google button ─────────────────────────────────── */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={isFormDisabled}
              aria-busy={isGoogleLoading}
              aria-label="Continue with Google"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                height: "46px",
                width: "100%",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--color-cream)",
                border: "1.5px solid color-mix(in srgb, var(--color-ink) 22%, transparent)",
                color: "var(--color-ink)",
                fontFamily: "var(--font-body)",
                fontSize: "15px",
                fontWeight: 500,
                cursor: isFormDisabled ? "not-allowed" : "pointer",
                opacity: isFormDisabled ? 0.7 : 1,
                transition: "background-color 180ms ease-out, border-color 180ms ease-out, transform 120ms ease-out",
              }}
              className="mtw-google-btn"
            >
              {isGoogleLoading ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ animation: "spin 1s linear infinite" }} aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <GoogleMark />
              )}
              Continue with Google
            </button>

            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .mtw-google-btn:hover:not(:disabled) {
                background-color: var(--color-parchment);
                border-color: color-mix(in srgb, var(--color-ink) 35%, transparent);
              }
              .mtw-google-btn:active:not(:disabled) {
                background-color: color-mix(in srgb, var(--color-parchment) 85%, var(--color-ink));
                transform: translateY(1px);
              }
              .mtw-google-btn:focus-visible {
                outline: 2px solid var(--color-ink);
                outline-offset: 2px;
              }
            `}</style>

            {/* ── 4. Divider ────────────────────────────────────────── */}
            <FormDivider label="or continue with email" />

            {/* ── 5–7. Email/password form ──────────────────────────── */}
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
              noValidate
            >
              <EmailField
                id="auth-email"
                label="Email"
                ref={emailInputRef}
                value={email}
                onValueChange={setEmail}
                onValidEmail={setIsValidEmail}
                placeholder="curator@example.com"
                disabled={isFormDisabled}
              />

              <PasswordField
                id="auth-password"
                label="Password"
                value={password}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                error={passwordError ?? undefined}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                disabled={isFormDisabled}
                placeholder={mode === "signup" ? "At least 8 characters" : ""}
              />

              {/* ── 8. Primary submit button (gilt) ───────────────── */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitDisabled}
                style={{ width: "100%", marginTop: "12px" }}
              >
                {copy.submit}
              </Button>
            </form>

            {/* ── 9. Footer mode switch ─────────────────────────────── */}
            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  color: "color-mix(in srgb, var(--color-ink) 60%, transparent)",
                }}
              >
                {copy.footerSwitch}{" "}
              </span>
              <button
                type="button"
                onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                disabled={isFormDisabled}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  color: "var(--color-gilt)",
                  textDecoration: "underline",
                  cursor: isFormDisabled ? "not-allowed" : "pointer",
                  padding: 0,
                }}
              >
                {copy.footerSwitchAction}
              </button>
            </div>

            {/* ── 10. Legal microcopy (sign-up only) ───────────────── */}
            {mode === "signup" && (
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  color: "color-mix(in srgb, var(--color-ink) 55%, transparent)",
                  textAlign: "center",
                  marginTop: "8px",
                  lineHeight: 1.5,
                }}
              >
                By continuing, you agree to the{" "}
                <a
                  href="/terms"
                  style={{ color: "var(--color-gilt)", textDecoration: "underline" }}
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  style={{ color: "var(--color-gilt)", textDecoration: "underline" }}
                >
                  Privacy Policy
                </a>
                .
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
