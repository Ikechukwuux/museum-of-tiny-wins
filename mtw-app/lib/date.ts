/**
 * date.ts — Museum of Tiny Wins
 *
 * Single source of truth for producing the canonical "YYYY-MM-DD" date
 * string that Win Cards render as "PERMANENT COLLECTION . YYYY . MM . DD"
 * (copy.md §7.8). Any future date handling for card metadata lives here so
 * the display never drifts between pages.
 */

/**
 * Format a Date into the canonical "YYYY-MM-DD" string used by Win Card
 * metadata. Uses local time (not UTC) so a win created "today" shows today.
 *
 * @param date the record's creation date
 * @returns "YYYY-MM-DD"
 */
export function formatWinDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
