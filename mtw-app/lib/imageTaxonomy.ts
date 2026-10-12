import { type BackgroundId, type ScrimTone } from "@/components/WinCard";

export type ImageMood = "airy" | "floral" | "warm" | "dark" | "dramatic";
export type ImageBusyness = "calm" | "moderate" | "busy";

export interface ImageMetadata {
  id: BackgroundId;
  scrimTone: ScrimTone;
  mood: ImageMood;
  busyness: ImageBusyness;
}

/**
 * Lightweight taxonomy of all 27 background images.
 * Used by the pairing logic to match text density to image calmness.
 */
export const IMAGE_TAXONOMY: Record<BackgroundId, ImageMetadata> = {
  1:  { id: 1,  scrimTone: "light", mood: "airy",     busyness: "calm" },
  2:  { id: 2,  scrimTone: "light", mood: "warm",     busyness: "moderate" },
  3:  { id: 3,  scrimTone: "dark",  mood: "dramatic", busyness: "busy" },
  4:  { id: 4,  scrimTone: "light", mood: "floral",   busyness: "moderate" },
  5:  { id: 5,  scrimTone: "light", mood: "airy",     busyness: "calm" },
  6:  { id: 6,  scrimTone: "light", mood: "warm",     busyness: "moderate" },
  7:  { id: 7,  scrimTone: "light", mood: "warm",     busyness: "calm" },
  8:  { id: 8,  scrimTone: "light", mood: "floral",   busyness: "busy" },
  9:  { id: 9,  scrimTone: "light", mood: "airy",     busyness: "calm" },
  10: { id: 10, scrimTone: "light", mood: "floral",   busyness: "moderate" },
  11: { id: 11, scrimTone: "dark",  mood: "dark",     busyness: "calm" },
  12: { id: 12, scrimTone: "dark",  mood: "dark",     busyness: "moderate" },
  13: { id: 13, scrimTone: "light", mood: "airy",     busyness: "calm" },
  14: { id: 14, scrimTone: "light", mood: "warm",     busyness: "moderate" },
  15: { id: 15, scrimTone: "dark",  mood: "dramatic", busyness: "busy" },
  16: { id: 16, scrimTone: "light", mood: "floral",   busyness: "moderate" },
  17: { id: 17, scrimTone: "light", mood: "airy",     busyness: "calm" },
  18: { id: 18, scrimTone: "dark",  mood: "dark",     busyness: "calm" },
  19: { id: 19, scrimTone: "dark",  mood: "dramatic", busyness: "busy" },
  20: { id: 20, scrimTone: "light", mood: "warm",     busyness: "moderate" },
  21: { id: 21, scrimTone: "dark",  mood: "dark",     busyness: "calm" },
  22: { id: 22, scrimTone: "light", mood: "airy",     busyness: "calm" },
  23: { id: 23, scrimTone: "light", mood: "floral",   busyness: "moderate" },
  24: { id: 24, scrimTone: "dark",  mood: "dramatic", busyness: "busy" },
  25: { id: 25, scrimTone: "dark",  mood: "dark",     busyness: "moderate" },
  26: { id: 26, scrimTone: "light", mood: "airy",     busyness: "calm" },
  27: { id: 27, scrimTone: "dark",  mood: "dramatic", busyness: "moderate" },
};
