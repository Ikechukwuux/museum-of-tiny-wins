/**
 * (site) group layout — Museum of Tiny Wins
 *
 * Wraps all real site pages (/, /exhibition, /museum, etc.) with the
 * editorial Navbar and Footer. The (site) folder name is a Next.js
 * route group: it has NO effect on the URL.
 *
 * Session: reads the Supabase user from the server-side client so the
 * Navbar always reflects the real auth state on initial render.
 * Client-side changes (sign-in, sign-out) trigger router.refresh()
 * inside the Navbar, which re-runs this Server Component.
 */

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  // Derive a display name: prefer full_name from metadata, fall back to
  // the first segment of the email, fall back to empty string.
  const firstName: string =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "";

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} firstName={firstName} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
      {/* Footer needs a stacking context above the sticky panels (z-10/20/30) */}
      <div style={{ position: "relative", zIndex: 40 }}>
        <Footer />
      </div>
    </>
  );
}
