"use client";

/**
 * Public Exhibition Hall — /exhibition
 * copy.md §3.1–3.7
 *
 * A curated museum gallery built on the shared collection-wall layout
 * system (components/collection/CollectionIntro + CategoryRail + the
 * WinCardGrid salon wall, all composed on the .collection-shell rail).
 * Structure:
 *
 *   1. Wall-label intro (title block left, curatorial note right)
 *   2. Text-led category rail
 *   3. Salon-hung masonry wall (WinCardGrid)
 *   4. Quiet "reveal more" continuation
 *
 * The wall is the star — no featured hero card, no oversized preamble.
 */

import { useState } from "react";
import WinCardGrid, { type WinCardGridItem } from "@/components/WinCardGrid";
import { CollectionIntro } from "@/components/collection/CollectionIntro";
import { CategoryRail, collectCategories } from "@/components/collection/CategoryRail";
import { MOCK_WINS, CATEGORIES, type MockWin } from "@/lib/mockWins";
import { SubmitWinModal } from "@/components/SubmitWinModal";

// ── Config ────────────────────────────────────────────────────────
const PAGE_SIZE = 12;
const ALL_WINS: MockWin[] = MOCK_WINS;
const RAIL_CATEGORIES = collectCategories(ALL_WINS, CATEGORIES);

// ── Component ─────────────────────────────────────────────────────
export default function ExhibitionPage() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter the collection based on category
  const filteredWins = ALL_WINS.filter((win) => {
    if (activeCategory === "ALL") return true;
    return win.category.toUpperCase() === activeCategory;
  });

  const visibleWins = filteredWins.slice(0, visibleCount);
  const hasMore = visibleCount < filteredWins.length;

  // Map the visible wins into the shared design-system masonry grid items.
  // Each item carries its own record's date and drawn card size.
  const gridItems: WinCardGridItem[] = visibleWins.map((win) => ({
    id: win.id,
    variant: "public",
    backgroundId: win.backgroundId,
    category: win.category,
    date: win.date,
    headline: win.headline,
    body: win.body,
    size: win.card_size,
    onOpenDetail: () => console.log("Open detail:", win.id),
  }));

  function loadMore() {
    setVisibleCount((n) => Math.min(n + PAGE_SIZE, filteredWins.length));
  }

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
  }

  // ── Empty state (§3.5) ──────────────────────────────────────────
  if (ALL_WINS.length === 0) {
    return (
      <>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "8rem 2rem",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              color: "var(--color-ink)",
              margin: 0,
            }}
          >
            This Wing Is Still Being Built
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "color-mix(in srgb, var(--color-ink) 60%, transparent)",
              maxWidth: "480px",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            No pieces have been donated to the public collection yet. Be the
            first to leave something behind.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Add Your Win
          </button>
        </div>
        <SubmitWinModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // ── Main exhibition ──────────────────────────────────────────────
  return (
    <div className="collection-shell">
      {/* ── 1. Wall-label intro ─────────────────────────────────────── */}
      <CollectionIntro
        overline="The Grand Exhibition — Wing I"
        title="Public Exhibition Hall"
        supporting="Donated by visitors, displayed without names."
        detail={`The collection holds ${ALL_WINS.length} artifacts.`}
        note={{
          overline: "A Note from the Curators",
          body: "Every piece here was donated anonymously and is displayed without a name. What remains is the act itself — preserved exactly as it happened.",
        }}
      />

      {/* ── 2. Text-led category rail ───────────────────────────────── */}
      <CategoryRail
        categories={RAIL_CATEGORIES}
        active={activeCategory}
        onChange={handleCategoryChange}
      />

      {/* ── 3. Salon-hung masonry wall ──────────────────────────────── */}
      {visibleWins.length > 0 ? (
        <WinCardGrid items={gridItems} />
      ) : (
        <div style={{ padding: "5rem 0", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              color: "color-mix(in srgb, var(--color-ink) 50%, transparent)",
              fontStyle: "italic",
            }}
          >
            No pieces found in this category.
          </p>
        </div>
      )}

      {/* ── 4. Quiet "reveal more" continuation ─────────────────────── */}
      {hasMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginTop: "clamp(2.5rem, 5vw, 3.5rem)",
          }}
        >
          <button
            onClick={loadMore}
            className="btn-ghost"
            style={{ fontFamily: "var(--font-body)", letterSpacing: "0.03em" }}
          >
            Reveal More of the Collection
          </button>
        </div>
      )}

      <SubmitWinModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
