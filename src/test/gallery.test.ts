import { describe, expect, it } from "vitest";
import { GALLERY_INTERVAL_MS, galleryCanAutoplay, nextGalleryIndex } from "@/lib/gallery";
import { DESTINATIONS } from "@/data/destinations";

describe("Destination gallery rules", () => {
  it("uses only available destination-specific galleries without broken legacy hosting paths", () => {
    const all: string[] = [];
    for (const destination of DESTINATIONS) {
      expect(destination.images.length).toBeGreaterThanOrEqual(1);
      expect(destination.images.every(url => !url.startsWith("/__l5e/"))).toBe(true);
      expect(destination.images.length).toBeLessThanOrEqual(5);
      expect(destination.imageLabels.length).toBe(destination.images.length);
      expect(new Set(destination.images).size).toBe(destination.images.length);
      expect(destination.image).toBe(destination.images[0]);
      all.push(...destination.images);
    }
    expect(new Set(all).size).toBe(all.length);
  });
  it("advances every four seconds within the requested 3–5 second range", () => {
    expect(GALLERY_INTERVAL_MS).toBe(4000);
  });
  it("loops forward and backward", () => {
    expect(nextGalleryIndex(2, 3)).toBe(0);
    expect(nextGalleryIndex(0, 3, -1)).toBe(2);
  });
  it("pauses while hovered", () => {
    expect(galleryCanAutoplay(false, true, true, 3)).toBe(false);
    expect(galleryCanAutoplay(false, false, true, 3)).toBe(true);
  });
  it("does not autoplay with reduced motion", () => {
    expect(galleryCanAutoplay(true, false, true, 3)).toBe(false);
  });
  it("does not autoplay off-screen", () => {
    expect(galleryCanAutoplay(false, false, false, 3)).toBe(false);
  });
});