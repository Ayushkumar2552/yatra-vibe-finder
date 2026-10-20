import beach from "@/assets/hero-beach.jpg";
import roadtrip from "@/assets/hero-roadtrip.jpg";
import desert from "@/assets/hero-desert.jpg";
import mountains from "@/assets/cat-mountains.jpg";
import heritage from "@/assets/cat-heritage.jpg";
import nature from "@/assets/cat-nature.jpg";
import type { Category, Destination } from "@/data/destinations";

export const CATEGORY_IMAGE: Record<Category, string> = {
  beach, roadtrip, desert, mountain: mountains, adventure: mountains,
  heritage, spiritual: heritage, nature, wildlife: nature, relax: beach,
};
export const HERO = { beach, roadtrip, desert };
export const destImage = (d: Destination) => d.image ?? CATEGORY_IMAGE[d.categories[0]];
