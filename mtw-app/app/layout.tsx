import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";

/**
 * Fraunces — display serif.
 * Loaded as a variable font with the optical-size axis (opsz) enabled,
 * so large headlines feel properly letterpress-heavy and smaller uses
 * auto-lighten. Used for the app name, win card headline, and placard body.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],   // opsz = optical size; SOFT/WONK are Fraunces-specific axes
  display: "swap",
});

/**
 * Public Sans — body sans-serif.
 * Clean, slightly condensed — handles body copy, buttons, labels, and
 * the "engraved plate" utility variant (small-caps, 0.08em letter-spacing).
 */
const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Museum of Tiny Wins",
  description:
    "A place where the small stuff gets the glory it deserves. Submit your tiny wins; we frame them as museum exhibits.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${publicSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: "var(--color-cream)" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
