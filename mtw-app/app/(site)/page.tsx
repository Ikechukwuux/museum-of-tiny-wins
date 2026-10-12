"use client";

/**
 * Landing Page — Museum of Tiny Wins
 *
 * Three sections only:
 *   1. EditorialHero — asymmetric editorial collage
 *   2. WhatThisIsSection — text-led product explanation
 *   3. Footer — rendered by (site)/layout.tsx
 *
 * The Navbar (header) is also rendered by (site)/layout.tsx —
 * it is reused, not rebuilt.
 */

import { useState } from "react";
import EditorialHero from "@/components/landing/EditorialHero";
import WhatThisIsSection from "@/components/landing/WhatThisIsSection";
import { SubmitWinModal } from "@/components/SubmitWinModal";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Section 1: Hero */}
      <EditorialHero />

      {/* Section 2: What This Is */}
      <WhatThisIsSection />

      {/* Section 3: Footer — rendered by (site)/layout.tsx */}

      {/* Submit Win Modal — triggered from hero CTA */}
      <SubmitWinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
