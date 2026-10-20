export const GALLERY_INTERVAL_MS = 4000;
export const SWIPE_THRESHOLD_PX = 45;

export function nextGalleryIndex(current: number, count: number, direction = 1) {
  return count > 0 ? (current + direction + count) % count : 0;
}

export function galleryCanAutoplay(reducedMotion: boolean, hovered: boolean, visible: boolean, count: number) {
  return !reducedMotion && !hovered && visible && count > 1;
}