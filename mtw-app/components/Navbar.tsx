"use client";

/**
 * Navbar — Museum of Tiny Wins
 *
 * Production-ready sticky responsive editorial museum header.
 * Shared component handling both Authenticated and Unauthenticated states.
 *
 * Sticky Navigation:
 *   • Sticky top-0 z-50 persistent navigation across all viewports.
 *   • Solid cream background (var(--color-cream)) with subtle border to prevent opacity/bleed-through over images.
 *   • Body scroll lock when mobile/tablet menu panel is open.
 *
 * Link State Logic:
 *   • Default: Neutral, available link state (no gilt text, no active underline).
 *     On initial load / landing page ("/"), links sit in DEFAULT state.
 *   • Hover: Existing hover state (opacity shift, gilt underline draw-in).
 *   • Active: Existing active state (opacity 1, gilt underline visible).
 *     Active state is ONLY applied when currently on that specific route (e.g. "/exhibition").
 *
 * Responsive Breakpoints:
 *   • Desktop (1024px+): Wide 3-zone layout (Brand LEFT | Nav CENTER | Auth+CTA RIGHT)
 *   • Tablet (768px–1023px): Brand LEFT | Auth+CTA+Menu Button RIGHT (Nav in drawer)
 *   • Mobile (320px–767px): Brand LEFT | Menu Button RIGHT (Full nav in mobile panel)
 */

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SubmitWinModal } from "@/components/SubmitWinModal";
import { AuthModal } from "@/components/AuthModal";

export interface NavbarProps {
  isAuthenticated?: boolean;
  firstName?: string;
  forceViewport?: "desktop" | "tablet" | "mobile";
  initialOpen?: boolean;
  activePath?: string;
  /** Called after a successful sign-in so the parent can refresh session state. */
  onAuthSuccess?: () => void;
  /** Called when the user signs out so the parent can clear session state. */
  onSignOut?: () => void;
}

const transitionEasing = [0.16, 1, 0.3, 1] as const;

export function Navbar({
  isAuthenticated = false,
  firstName = "",
  forceViewport,
  initialOpen = false,
  activePath,
  onAuthSuccess,
  onSignOut,
}: NavbarProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"signin" | "signup">("signin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(initialOpen);
  const [isScrolled, setIsScrolled] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleDocumentClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".account-popover-container")) {
        setAccountMenuOpen(false);
      }
    };
    // Use a slight delay or capture phase to avoid immediate closing on the toggle click
    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [accountMenuOpen]);

  // Get current pathname from Next.js router, fallback to activePath if explicitly passed (e.g. for styleguide)
  const pathname = usePathname();
  const currentPath = activePath !== undefined ? activePath : (pathname || "");

  // Close menu on Escape key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMobileMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, handleKeyDown]);

  // Lock body scroll when mobile/tablet menu panel is open on live site
  useEffect(() => {
    if (mobileMenuOpen && !forceViewport) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, forceViewport]);

  // Scroll-based elevation — adds subtle shadow when user has scrolled
  useEffect(() => {
    if (forceViewport) return; // Skip in styleguide previews
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceViewport]);

  const closeMenu = () => setMobileMenuOpen(false);

  const openSignIn = () => {
    setAuthInitialMode("signin");
    setAuthOpen(true);
    closeMenu();
  };

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    onSignOut?.();
    router.refresh();
    closeMenu();
  };

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
  };

  // Determine viewport modes based on forceViewport or CSS responsive classes
  const isForcedDesktop = forceViewport === "desktop";
  const isForcedTablet = forceViewport === "tablet";
  const isForcedMobile = forceViewport === "mobile";

  return (
    <>
      <header
        className={`w-full border-b transition-[box-shadow,border-color] duration-200 ${
          forceViewport ? "relative z-40" : "sticky top-0 z-50"
        } ${
          isScrolled
            ? "border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)]"
            : "border-[color-mix(in_srgb,var(--color-ink)_8%,transparent)]"
        }`}
        style={{
          backgroundColor: "var(--color-cream)",
          borderRadius: forceViewport ? "calc(var(--radius) - 1px)" : "0",
          boxShadow: isScrolled
            ? "0 1px 8px color-mix(in srgb, var(--color-ink) 6%, transparent)"
            : "none",
        }}
      >
        <nav
          aria-label="Main Navigation"
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
          className={`px-4 sm:px-6 md:px-8 lg:px-10 py-5 transition-all duration-200 ${
            isForcedMobile
              ? "flex justify-between items-center"
              : isForcedTablet
              ? "flex justify-between items-center"
              : isForcedDesktop
              ? "grid grid-cols-[1fr_auto_1fr] items-center gap-6"
              : "flex justify-between items-center lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6"
          }`}
        >
          {/* ── 1. BRAND / WORDMARK (LEFT) ───────────────────────── */}
          <div className="justify-self-start flex-shrink-0">
            <Link
              href="/"
              onClick={closeMenu}
              className="group flex flex-col gap-0.5 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sage)] rounded-sm"
              aria-label="Museum of Tiny Wins — Home"
            >
              <span
                style={{ fontFamily: "var(--font-display)" }}
                className="text-[1.2rem] sm:text-[1.25rem] font-bold text-[var(--color-ink)] leading-none tracking-[-0.02em] group-hover:opacity-80 transition-opacity"
              >
                MTW
              </span>
              <span
                className={`navbar-wordmark-full text-[0.6rem] sm:text-[0.625rem] font-medium tracking-[0.12em] uppercase text-[color-mix(in_srgb,var(--color-ink)_55%,transparent)] leading-tight ${
                  isForcedMobile ? "hidden xs:block" : ""
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                Museum of Tiny Wins
              </span>
            </Link>
          </div>

          {/* ── 2. CENTER NAV LINKS (DESKTOP ONLY) ───────────────── */}
          <div
            className={`navbar-center-nav justify-self-center items-center gap-8 ${
              isForcedDesktop
                ? "flex"
                : isForcedTablet || isForcedMobile
                ? "hidden"
                : "hidden lg:flex"
            }`}
          >
            <Link
              href="/exhibition"
              className={currentPath === "/exhibition" ? "active" : ""}
            >
              Exhibition
            </Link>
            {isAuthenticated && (
              <Link
                href="/museum"
                className={currentPath === "/museum" ? "active" : ""}
              >
                My Museum
              </Link>
            )}
          </div>

          {/* ── 3. RIGHT ACTIONS SLOT ────────────────────────────── */}
          <div className="justify-self-end flex items-center gap-3 sm:gap-4 md:gap-5 flex-shrink-0">
            {/* Desktop / Tablet User Auth Slot */}
            <div
              className={`items-center gap-3 ${
                isForcedMobile
                  ? "hidden"
                  : isForcedTablet
                  ? "flex"
                  : isForcedDesktop
                  ? "flex"
                  : "hidden md:flex"
              }`}
            >
              {isAuthenticated ? (
                <div className="relative account-popover-container" style={{ display: "flex", alignItems: "center" }}>
                  <button
                    onClick={() => setAccountMenuOpen((prev) => !prev)}
                    className="text-[0.85rem] font-medium text-[var(--color-ink)] hover:opacity-80 transition-opacity px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sage)]"
                    style={{ fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "pointer" }}
                    aria-expanded={accountMenuOpen}
                    aria-label="Toggle account menu"
                  >
                    Account
                  </button>

                  <AnimatePresence>
                    {accountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: transitionEasing }}
                        style={{
                          position: "absolute",
                          top: "calc(100% + 8px)",
                          right: 0,
                          width: "max-content",
                          minWidth: "160px",
                          backgroundColor: "var(--color-parchment)",
                          borderRadius: "var(--radius)",
                          border: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)",
                          boxShadow: "0 8px 24px color-mix(in srgb, var(--color-ink) 8%, transparent)",
                          padding: "0.75rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          zIndex: 60,
                        }}
                      >
                        <span
                          className="text-[0.75rem] font-medium text-[color-mix(in_srgb,var(--color-ink)_60%,transparent)] px-2 pt-1"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          Signed in as {firstName}
                        </span>
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "color-mix(in srgb, var(--color-ink) 8%, transparent)",
                            margin: "0.25rem 0",
                          }}
                        />
                        <button
                          onClick={handleSignOut}
                          className="text-[0.85rem] font-medium text-[var(--color-ink)] hover:opacity-70 transition-colors px-2 py-1.5 text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sage)]"
                          style={{ fontFamily: "var(--font-body)", background: "transparent", border: "none", cursor: "pointer", width: "100%" }}
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={openSignIn}
                  className="text-[0.85rem] font-medium text-[var(--color-ink)] opacity-75 hover:opacity-100 transition-opacity px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sage)]"
                  style={{ fontFamily: "var(--font-body)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Desktop / Tablet Primary CTA */}
            <div
              className={`${
                isForcedMobile
                  ? "hidden"
                  : isForcedTablet || isForcedDesktop
                  ? "block"
                  : "hidden sm:block"
              }`}
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary min-h-[44px] min-w-[44px] px-4 py-2 text-[0.85rem] whitespace-nowrap"
              >
                Add Your Win
              </button>
            </div>

            {/* Mobile / Tablet Accessible Menu Toggle Button */}
            <div
              className={`${
                isForcedDesktop
                  ? "hidden"
                  : isForcedTablet || isForcedMobile
                  ? "block"
                  : "block lg:hidden"
              }`}
            >
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-controls="navbar-responsive-panel"
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--color-ink)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-parchment)_60%,transparent)] text-[var(--color-ink)] hover:bg-[var(--color-parchment)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sage)] cursor-pointer"
              >
                <span
                  className="text-[0.8rem] font-medium tracking-[0.04em] uppercase"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {mobileMenuOpen ? "Close" : "Menu"}
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* ── 4. RESPONSIVE DROPDOWN PANEL (MOBILE & TABLET) ──────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="navbar-responsive-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: transitionEasing }}
              className="overflow-hidden border-t border-[color-mix(in_srgb,var(--color-ink)_8%,transparent)] bg-[var(--color-parchment)] shadow-lg"
            >
              <div
                className="max-w-[1320px] mx-auto px-6 py-6 flex flex-col gap-6"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {/* Navigation Links */}
                <div className="flex flex-col gap-3 pb-4 border-b border-[color-mix(in_srgb,var(--color-ink)_10%,transparent)]">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-ink)_45%,transparent)]">
                    Exhibition Rooms
                  </span>
                  <Link
                    href="/exhibition"
                    onClick={closeMenu}
                    className={`text-[1rem] font-medium py-1.5 no-underline transition-colors ${
                      currentPath === "/exhibition"
                        ? "text-[var(--color-ink)] font-semibold"
                        : "text-[color-mix(in_srgb,var(--color-ink)_75%,transparent)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    Exhibition
                  </Link>
                  {isAuthenticated && (
                    <Link
                      href="/museum"
                      onClick={closeMenu}
                      className={`text-[1rem] font-medium py-1.5 no-underline transition-colors ${
                        currentPath === "/museum"
                          ? "text-[var(--color-ink)] font-semibold"
                          : "text-[color-mix(in_srgb,var(--color-ink)_75%,transparent)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      My Museum
                    </Link>
                  )}
                </div>

                {/* Account / User Section (Unauthenticated only) */}
                {!isAuthenticated && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--color-ink)_45%,transparent)]">
                        Account:
                      </span>
                      <button
                        onClick={openSignIn}
                        className="text-[0.95rem] font-medium text-[var(--color-sage)] underline hover:opacity-80"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                )}

                {/* Prominent CTA inside panel */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      closeMenu();
                      setIsModalOpen(true);
                    }}
                    className="btn-primary w-full min-h-[44px] py-3 text-[0.95rem] justify-center"
                  >
                    Add Your Win
                  </button>
                </div>

                {/* Sign Out at the very bottom for authenticated users */}
                {isAuthenticated && (
                  <div className="mt-2 pt-4 border-t border-[color-mix(in_srgb,var(--color-ink)_10%,transparent)] flex justify-between items-center">
                    <span
                      className="text-[0.8rem] font-medium text-[color-mix(in_srgb,var(--color-ink)_60%,transparent)]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Signed in as {firstName}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-[0.85rem] font-medium text-[var(--color-ink)] hover:text-[var(--color-sage)] transition-colors px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sage)]"
                      style={{ fontFamily: "var(--font-body)", background: "transparent", border: "none", cursor: "pointer" }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SubmitWinModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authInitialMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
