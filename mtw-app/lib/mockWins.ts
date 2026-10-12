/**
 * mockWins.ts — Museum of Tiny Wins
 *
 * 24 fabricated win objects for the /exhibition page mock.
 * Uses real phrase pools from copy.md §7.2–7.4 so the cards read in the
 * actual museum voice. Cycles through all 14 real background images.
 *
 * Each win is backfilled with a `card_size` drawn by the real
 * `drawWinCardSize` utility using a seeded PRNG, so sizes are stable
 * across builds and never re-shuffle on import.
 *
 * To test the empty state on /exhibition, pass an empty array instead of
 * this import, e.g.:  const WINS_TO_DISPLAY: MockWin[] = [];
 */

import { type BackgroundId } from "@/components/WinCard";
import { type WinCardSize } from "@/lib/winCardSize";
import { drawWinCardSize, seedRng } from "@/lib/drawWinCardSize";
import { pairBackground } from "@/lib/pairBackground";
import { formatWinDate } from "@/lib/date";

export interface MockWin {
  id: number;
  headline: string;
  body: string;
  category: string;
  backgroundId: BackgroundId;
  year: number;
  createdAt: Date;
  /** Canonical "YYYY-MM-DD" string rendered as the card footer stamp. */
  date: string;
  isExhibited: boolean;
  /** Drawn once at creation, persisted, never recomputed. */
  card_size: WinCardSize;
}

// ── Phrase pools from copy.md §7.2–7.4 ────────────────────────────
export const OPENERS = [
  "Quietly entered into the collection.",
  "Catalogued with due care.",
  "Added to the record today.",
  "Filed among ordinary wonders.",
  "Set aside for preservation.",
  "Noted by the museum and retained.",
  "Placed in the archive without fuss.",
  "Received into the permanent collection.",
  "Recorded for future viewing.",
  "Kept here against forgetting.",
  "Accepted into the registry at once.",
  "Preserved under museum care.",
];

export const CLOSERS = [
  "It asks for no further defense.",
  "Little else need be said.",
  "The record is sufficient.",
  "Its place here is secure.",
  "Visitors tend to understand.",
  "It rewards a second look.",
  "Nothing essential has been omitted.",
  "The matter speaks for itself.",
  "Even modest works endure.",
  "Posterity may judge kindly.",
  "The museum stands by it.",
  "It merits brief attention.",
];

export const CATEGORIES = [
  "Endurance",
  "Resilience",
  "Discipline",
  "Quiet Victory",
  "Restraint",
  "Triumph",
  "Forward Motion",
  "Preservation",
  "Small Graces",
  "Audacity",
];

// ── Raw win headlines ──────────────────────────────────────────────
const HEADLINES = [
  "Replied to that scary email.",
  "Went outside for 8 minutes.",
  "Made the bed before noon.",
  "Drank water before coffee.",
  "Said no and meant it.",
  "Finished the thing I'd been avoiding.",
  "Ate a vegetable on purpose.",
  "Took the stairs.",
  "Read three pages of a book.",
  "Washed the dishes the same day.",
  "Remembered to take my vitamins.",
  "Called instead of texting.",
  "Got out of bed before 9am.",
  "Sent the apology I'd been sitting on.",
  "Went to the appointment.",
  "Turned off the screen an hour early.",
  "Wrote something down.",
  "Asked for help.",
  "Took a lunch break.",
  "Cleaned the thing I'd been ignoring.",
  "Made a decision and didn't second-guess it.",
  "Accepted the compliment.",
  "Showed up, even when I didn't want to.",
  "Let it go.",
];

// ── Build the 24 mock wins ─────────────────────────────────────────
// Sorted most-recent-first: createdAt dates spread over the past year.
// Each win is backfilled with a card_size via the real drawWinCardSize
// algorithm and a seeded PRNG (seed=42) so sizes are stable.
const rng = seedRng(42);

export const MOCK_WINS: MockWin[] = (() => {
  const recentSizes: (WinCardSize | undefined)[] = [undefined, undefined];

  return HEADLINES.map((headline, i) => {
    const openerIdx  = (i * 3)  % OPENERS.length;
    const closerIdx  = (i * 5)  % CLOSERS.length;
    const catIdx     = (i * 7)  % CATEGORIES.length;
    // Space dates ~15 days apart, most recent first
    const daysAgo    = i * 15;
    const createdAt  = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const body = `${OPENERS[openerIdx]} ${CLOSERS[closerIdx]}`;
    
    const bgId = pairBackground({ id: i + 1, headline, body });

    // Draw size using the real algorithm with seeded RNG
    const card_size = drawWinCardSize({
      quote: headline,
      commentary: body,
      recentSizes: [recentSizes[0], recentSizes[1]],
      rng,
    });

    // Update recent sizes for anti-run tracking
    recentSizes[1] = recentSizes[0];
    recentSizes[0] = card_size;

    return {
      id:          i + 1,
      headline,
      body,
      category:    CATEGORIES[catIdx],
      backgroundId: bgId as BackgroundId,
      year:        createdAt.getFullYear(),
      createdAt,
      date:        formatWinDate(createdAt),
      isExhibited: i % 3 === 0, // 1 in 3 are exhibited
      card_size,
    };
  });
})();
