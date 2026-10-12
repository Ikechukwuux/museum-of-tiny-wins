/**
 * app/auth/callback/route.ts — Museum of Tiny Wins
 *
 * OAuth callback Route Handler for Supabase.
 * Exchanges the `code` query param for a Supabase session.
 *
 * Used by Google OAuth (and any future OAuth provider).
 * The redirect URI configured in Supabase and Google Cloud Console
 * must point to: {SITE_URL}/auth/callback
 *
 * Success → redirects to /museum (authenticated landing)
 * Failure → redirects to / with ?auth_error=1 so the modal can
 *            surface an error without a blank page.
 *
 * Works identically in local dev (localhost:3000) and deployed preview
 * because the redirect target is relative.
 *
 * agents.md §2.3: rate limits / auth requirements documented here.
 *   - No rate limit needed: this endpoint is only hit after a successful
 *     Google OAuth redirect, not user-callable directly.
 *   - Auth: none required — the `code` is the one-time secret.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/museum";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful OAuth — redirect to the intended destination.
      // Use the request origin so relative redirects work on any domain.
      const redirectUrl = new URL(next, requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Code missing or exchange failed — surface error on landing page.
  // The AuthModal listens for ?auth_error=1 and shows an inline message.
  const errorUrl = new URL("/?auth_error=1", requestUrl.origin);
  return NextResponse.redirect(errorUrl);
}
