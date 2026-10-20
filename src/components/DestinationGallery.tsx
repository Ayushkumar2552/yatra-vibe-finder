import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GALLERY_INTERVAL_MS, SWIPE_THRESHOLD_PX, galleryCanAutoplay, nextGalleryIndex } from "@/lib/gallery";

export function DestinationGallery({ images, labels, name, hero = false }: {
  images: string[]; labels: string[]; name: string; hero?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const usable = images.map((_, index) => index).filter((index) => !failed.has(index));
  const displayed = usable.includes(active) ? active : (usable[0] ?? 0);
  const move = (direction: number) => {
    setActive((current) => usable[nextGalleryIndex(Math.max(0, usable.indexOf(current)), usable.length, direction)] ?? 0);
  };

  useEffect(() => {
    const element = host.current;
    const parent = element?.parentElement;
    if (!element || !parent) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReducedMotion(preference.matches);
    motion();
    preference.addEventListener("change", motion);
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { rootMargin: "100px" });
    observer.observe(element);
    const enter = (event: PointerEvent) => { if (event.pointerType !== "touch") setHovered(true); };
    const leave = () => setHovered(false);
    let startX = 0;
    let startY = 0;
    let swiped = false;
    const start = (event: TouchEvent) => {
      startX = event.touches[0]?.clientX ?? 0;
      startY = event.touches[0]?.clientY ?? 0;
      swiped = false;
    };
    const end = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
        swiped = true;
        setActive((current) => {
          const available = images.map((_, index) => index).filter((index) => !failed.has(index));
          return available[nextGalleryIndex(Math.max(0, available.indexOf(current)), available.length, dx < 0 ? 1 : -1)] ?? 0;
        });
      }
    };
    const click = (event: MouseEvent) => {
      if (swiped) { event.preventDefault(); event.stopPropagation(); swiped = false; }
    };
    parent.addEventListener("pointerenter", enter);
    parent.addEventListener("pointerleave", leave);
    parent.addEventListener("touchstart", start, { passive: true });
    parent.addEventListener("touchend", end, { passive: true });
    parent.addEventListener("click", click, true);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", motion);
      parent.removeEventListener("pointerenter", enter);
      parent.removeEventListener("pointerleave", leave);
      parent.removeEventListener("touchstart", start);
      parent.removeEventListener("touchend", end);
      parent.removeEventListener("click", click, true);
    };
  }, [images, failed]);

  useEffect(() => {
    if (!galleryCanAutoplay(reducedMotion, hovered, visible, usable.length)) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setActive((current) => {
        const next = usable[nextGalleryIndex(Math.max(0, usable.indexOf(current)), usable.length)];
        return next !== undefined && loaded.has(next) ? next : current;
      });
    }, GALLERY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reducedMotion, hovered, visible, images, failed, loaded]);

  return (
    <div ref={host} className="absolute inset-0" data-gallery={name} data-active-slide={displayed}>
      {images.map((src, index) => !failed.has(index) && (
        <img key={src} src={src} alt={`${name} — ${labels[index] ?? name}`} width={1400} height={1000}
          loading={hero && index === 0 ? "eager" : "lazy"} decoding="async" draggable={false}
          onLoad={() => setLoaded((previous) => new Set(previous).add(index))}
          onError={() => setFailed((previous) => new Set(previous).add(index))}
          aria-hidden={index !== displayed}
          className={cn("absolute inset-0 size-full object-cover transition-all duration-700 motion-reduce:transition-none", index === displayed ? "opacity-100" : "opacity-0", !hero && "group-hover:scale-105 motion-reduce:transform-none")} />
      ))}
      {usable.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-20 flex justify-center gap-1.5" aria-label={`Photo ${usable.indexOf(displayed) + 1} of ${usable.length}`}>
          {usable.map((index) => <span key={index} className={cn("size-1.5 rounded-full bg-on-media transition-opacity motion-reduce:transition-none", index === displayed ? "opacity-100" : "opacity-40")} />)}
        </div>
      )}
      {hero && usable.length > 1 && (
        <div className="pointer-events-none absolute inset-x-4 top-1/2 z-20 flex -translate-y-1/2 justify-between">
          <Button variant="ghost" size="icon" className="glass pointer-events-auto rounded-full" aria-label="Previous attraction photo" onClick={() => move(-1)}><ChevronLeft /></Button>
          <Button variant="ghost" size="icon" className="glass pointer-events-auto rounded-full" aria-label="Next attraction photo" onClick={() => move(1)}><ChevronRight /></Button>
        </div>
      )}
    </div>
  );
}