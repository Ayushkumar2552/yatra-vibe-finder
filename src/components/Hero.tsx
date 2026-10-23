import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { HERO } from "@/lib/images";
import { cn } from "@/lib/utils";

/** Homepage photo slideshow. Video playback belongs to FooterJourney. */
const SCENES = [
  { key: "beach", poster: HERO.beach, line: "Breathe by the blue." },
  { key: "roadtrip", poster: HERO.roadtrip, line: "Take the long way." },
  { key: "desert", poster: HERO.desert, line: "Chase a different horizon." },
];
const INTERVAL = 8000;

export function Hero({ children }: { children?: React.ReactNode }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);


  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((x) => (x + 1) % SCENES.length), INTERVAL);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <section className="relative h-[92svh] min-h-[600px] w-full overflow-hidden bg-overlay">
      {SCENES.map((s, idx) => (
        <div key={s.key} className={cn("absolute inset-0 transition-opacity duration-[1600ms] ease-in-out", idx === i ? "opacity-100" : "opacity-0")} aria-hidden={idx !== i}>
          <img src={s.poster} alt="" className={cn("absolute inset-0 size-full object-cover transition-transform duration-[9000ms] ease-out", idx === i && playing ? "scale-110" : "scale-100")} width={1920} height={1088} />

        </div>
      ))}
      <div className="absolute inset-0 media-scrim" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-16 md:px-8 md:pb-24">
        <div className="relative h-8 overflow-hidden text-on-media/90">
          {SCENES.map((s, idx) => (
            <p key={s.key} className={cn("absolute inset-0 text-lg font-medium transition-all duration-700", idx === i ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}>
              {s.line}
            </p>
          ))}
        </div>
        <h1 className="mt-3 max-w-4xl text-5xl font-bold leading-[0.95] text-on-media sm:text-7xl md:text-8xl animate-rise">
          India, picked<br />for your mood.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-on-media/85 animate-rise [animation-delay:150ms]">
          Tell us your budget, crew and vibe. Our explainable recommender ranks 48 destinations across India — and shows exactly why.
        </p>
        {children}
      </div>

      <div className="absolute bottom-6 right-5 z-10 flex items-center gap-3 md:right-8">
        <div className="flex gap-1.5">
          {SCENES.map((s, idx) => (
            <button key={s.key} onClick={() => setI(idx)} aria-label={`Show ${s.key} scene`}
              className={cn("h-1.5 rounded-full bg-on-media transition-all", idx === i ? "w-8 opacity-100" : "w-3 opacity-50")} />
          ))}
        </div>
        <button onClick={() => setPlaying(!playing)} className="glass grid size-10 place-items-center rounded-full" aria-label={playing ? "Pause slideshow" : "Play slideshow"}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
      </div>
    </section>
  );
}
