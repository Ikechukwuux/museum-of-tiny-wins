import { type BackgroundId } from "@/components/WinCard";
import { IMAGE_TAXONOMY, type ImageBusyness, type ImageMood } from "./imageTaxonomy";
import { hashId } from "./winCardSize";

interface PairingCriteria {
  preferredBusyness: ImageBusyness[];
  preferredMoods: ImageMood[];
}

/**
 * Deterministically pairs a win with an appropriate background image
 * based on the length and density of the text.
 */
export function pairBackground(
  win: { id: string | number; headline: string; body: string }
): BackgroundId {
  const weight = win.headline.length + win.body.length;
  
  let criteria: PairingCriteria;

  // 1. Long/dense text (headline + body > 150 chars) 
  // → prefer `calm` busyness + `airy` or `warm` mood
  if (weight > 150) {
    criteria = {
      preferredBusyness: ["calm"],
      preferredMoods: ["airy", "warm", "dark"]
    };
  } 
  // 2. Short punchy text (< 80 chars) 
  // → allowed to use `dramatic` or `busy` images
  else if (weight < 80) {
    criteria = {
      preferredBusyness: ["busy", "moderate", "calm"],
      preferredMoods: ["dramatic", "dark", "floral", "airy", "warm"]
    };
  } 
  // 3. Mid-range → prefers `moderate` busyness
  else {
    criteria = {
      preferredBusyness: ["moderate", "calm"],
      preferredMoods: ["floral", "warm", "airy", "dark"]
    };
  }

  const allImages = Object.values(IMAGE_TAXONOMY);
  
  // Filter based on criteria
  let eligible = allImages.filter(img => 
    criteria.preferredBusyness.includes(img.busyness) &&
    criteria.preferredMoods.includes(img.mood)
  );

  // Fallback if somehow empty
  if (eligible.length === 0) {
    eligible = allImages.filter(img => criteria.preferredBusyness.includes(img.busyness));
  }
  if (eligible.length === 0) {
    eligible = allImages;
  }

  // Pick deterministically based on ID hash
  const hash = hashId(win.id);
  const picked = eligible[hash % eligible.length];

  return picked.id;
}
