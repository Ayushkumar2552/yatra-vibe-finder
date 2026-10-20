import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DestinationGallery } from "@/components/DestinationGallery";

const images = ["first.jpg", "second.jpg", "third.jpg"];
const labels = ["Beach", "Fort", "Temple"];

function setup(reducedMotion = false, hero = false) {
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
    observe() {}
    disconnect() {}
  });
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: reducedMotion, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList);
  const result = render(<div><DestinationGallery images={images} labels={labels} name="Goa" hero={hero} /></div>);
  result.container.querySelectorAll("img").forEach((image) => fireEvent.load(image));
  const gallery = result.container.querySelector("[data-gallery]");
  if (!gallery?.parentElement) throw new Error("Missing gallery");
  return { ...result, gallery, parent: gallery.parentElement };
}

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("Destination slideshow", () => {
  it("advances loaded images after four seconds and loops", () => {
    vi.useFakeTimers();
    const { gallery } = setup();
    expect(gallery.getAttribute("data-active-slide")).toBe("0");
    act(() => vi.advanceTimersByTime(4000));
    expect(gallery.getAttribute("data-active-slide")).toBe("1");
    act(() => vi.advanceTimersByTime(8000));
    expect(gallery.getAttribute("data-active-slide")).toBe("0");
  });
  it("pauses on desktop hover and resumes on leave", () => {
    vi.useFakeTimers();
    const { gallery, parent } = setup();
    act(() => { const event = new Event("pointerenter"); Object.defineProperty(event, "pointerType", { value: "mouse" }); parent.dispatchEvent(event); });
    act(() => vi.advanceTimersByTime(8000));
    expect(gallery.getAttribute("data-active-slide")).toBe("0");
    fireEvent.pointerLeave(parent);
    act(() => vi.advanceTimersByTime(4000));
    expect(gallery.getAttribute("data-active-slide")).toBe("1");
  });
  it("stays still with reduced motion, but allows manual hero navigation", () => {
    vi.useFakeTimers();
    const { gallery, getByRole } = setup(true, true);
    act(() => vi.advanceTimersByTime(12000));
    expect(gallery.getAttribute("data-active-slide")).toBe("0");
    fireEvent.click(getByRole("button", { name: "Next attraction photo" }));
    expect(gallery.getAttribute("data-active-slide")).toBe("1");
  });
  it("swipes without following the destination link", () => {
    const { gallery, parent } = setup(true);
    fireEvent.touchStart(parent, { touches: [{ clientX: 180, clientY: 80 }] });
    fireEvent.touchEnd(parent, { changedTouches: [{ clientX: 60, clientY: 85 }] });
    expect(gallery.getAttribute("data-active-slide")).toBe("1");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    parent.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
  it("skips a failed image rather than fading to a broken photo", () => {
    vi.useFakeTimers();
    const { gallery, container } = setup();
    const second = container.querySelectorAll("img")[1];
    if (!second) throw new Error("Missing second image");
    fireEvent.error(second);
    act(() => vi.advanceTimersByTime(4000));
    expect(gallery.getAttribute("data-active-slide")).toBe("2");
  });
});