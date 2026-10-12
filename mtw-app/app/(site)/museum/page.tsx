"use client";

/**
 * Personal Museum — /museum
 * copy.md §4.1–4.6
 *
 * A private collection wall built on the same shared collection-page layout
 * family as Exhibition Hall (components/collection/CollectionIntro +
 * CategoryRail + the WinCardGrid salon wall, all composed on the
 * .collection-shell rail). Structure:
 *
 *   1. Wall-label intro (title block left, curatorial note right)
 *   2. Text-led category rail
 *   3. Salon-hung masonry wall (WinCardGrid)
 *
 * Includes local state management to test Exhibit/Withdraw and Remove actions.
 *
 * EMPTY STATE TESTING:
 *   To see the §4.5 empty state, temporarily change `const TEST_EMPTY = false;` to `true`.
 */

import { useState } from "react";
import WinCardGrid, { type WinCardGridItem } from "@/components/WinCardGrid";
import { CollectionIntro } from "@/components/collection/CollectionIntro";
import { CategoryRail, collectCategories } from "@/components/collection/CategoryRail";
import { WinDetailModal } from "@/components/WinDetailModal";
import { SubmitWinModal } from "@/components/SubmitWinModal";
import { MOCK_WINS, CATEGORIES, type MockWin } from "@/lib/mockWins";

// ── Config ────────────────────────────────────────────────────────
const MOCK_FIRST_NAME = "Maya";
const TEST_EMPTY = false; // Toggle this to test the empty state

// ── Component ─────────────────────────────────────────────────────
export default function PersonalMuseumPage() {
  const [wins, setWins] = useState<MockWin[]>(TEST_EMPTY ? [] : MOCK_WINS);

  // Filter + modal states
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedWinId, setSelectedWinId] = useState<number | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const selectedWin = wins.find((w) => w.id === selectedWinId) || null;

  // Derive the rail categories from the user's actual collection.
  const railCategories = collectCategories(wins, CATEGORIES);

  const filteredWins = wins.filter((win) => {
    if (activeCategory === "ALL") return true;
    return win.category.toUpperCase() === activeCategory;
  });

  // Map wins into the shared design-system masonry grid items.
  // Each item carries its own record's date and drawn card size.
  const gridItems: WinCardGridItem[] = filteredWins.map((win) => ({
    id: win.id,
    variant: "personal",
    backgroundId: win.backgroundId,
    category: win.category,
    date: win.date,
    headline: win.headline,
    body: win.body,
    size: win.card_size,
    isExhibited: win.isExhibited,
    onOpenDetail: () => setSelectedWinId(win.id),
  }));

  // ── Handlers ──────────────────────────────────────────────────────
  const handleToggleExhibit = (id: number) => {
    setWins((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isExhibited: !w.isExhibited } : w))
    );
  };

  const handleRemove = (id: number) => {
    setWins((prev) => prev.filter((w) => w.id !== id));
    setSelectedWinId(null);
  };

  // ── Header Strings (§4.3) ─────────────────────────────────────────
  const getArtifactCountString = (count: number) => {
    if (count === 1) return "Your collection holds 1 artifact.";
    return `Your collection holds ${count} artifacts.`;
  };

  // ── Empty state (§4.5) ──────────────────────────────────────────
  if (wins.length === 0) {
    return (
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
          The Museum Is Empty — For Now
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
          Every collection starts somewhere. Yours can start with something very small.
        </p>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="btn-primary"
        >
          Add Your First Tiny Win
        </button>

        <SubmitWinModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
        />
      </div>
    );
  }

  // ── Main gallery ─────────────────────────────────────────────────
  return (
    <div className="collection-shell">
      {/* ── 1. Wall-label intro ─────────────────────────────────────── */}
      <CollectionIntro
        overline="Private Collection"
        title={`${MOCK_FIRST_NAME}'s Museum`}
        supporting={getArtifactCountString(wins.length)}
        note={{
          overline: "A Private Gallery",
          body: "This room is yours alone. Each artifact is held here in private until you choose to place it on public display.",
        }}
        action={
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn-primary"
            style={{ padding: "0.5rem 1.5rem" }}
          >
            + Add a Tiny Win
          </button>
        }
      />

      {/* ── 2. Text-led category rail ───────────────────────────────── */}
      {railCategories.length > 1 && (
        <CategoryRail
          categories={railCategories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      )}

      {/* ── 3. Salon-hung masonry wall ──────────────────────────────── */}
      {filteredWins.length > 0 ? (
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

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <SubmitWinModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />

      <WinDetailModal
        isOpen={selectedWinId !== null}
        onClose={() => setSelectedWinId(null)}
        win={selectedWin}
        onToggleExhibit={handleToggleExhibit}
        onRemove={handleRemove}
      />
    </div>
  );
}
