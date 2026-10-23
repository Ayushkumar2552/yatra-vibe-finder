import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronDown, Cloud, CloudRain, Heart, Snowflake, Sun, Wind } from "lucide-react";
import { useState } from "react";
import { CATEGORY_META, type Destination } from "@/data/destinations";
import { destImage } from "@/lib/images";
import { useSaved } from "@/lib/saved";
import { inr } from "@/lib/engine/estimate";
import { FACTOR_LABEL, WEIGHTS, type Factor, type Recommendation } from "@/lib/engine/recommend";
import type { WeatherNow } from "@/lib/weather/types";
import { MONTHS } from "@/lib/planner-params";
import { cn } from "@/lib/utils";
import { DestinationGallery } from "@/components/DestinationGallery";

export function WeatherIcon({ c, className }: { c: string; className?: string }) {
  const I = c === "Rain" || c === "Thunderstorm" || c === "Drizzle" ? CloudRain : c === "Snow" ? Snowflake : c === "Clouds" ? Cloud : c === "Fog" || c === "Haze" || c === "Mist" ? Wind : Sun;
  return <I className={className} />;
}

export function WeatherChip({ w, suit, onMedia }: { w: WeatherNow; suit?: number | null; onMedia?: boolean }) {
  if (w.source === "unavailable") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", onMedia ? "glass" : "bg-muted")}>
        <Cloud className="size-3.5" /> Weather unavailable
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", onMedia ? "glass" : "bg-muted")}>
      <WeatherIcon c={w.condition} className="size-3.5" />
      {w.source === "forecast" ? `${w.temp}°C high/low midpoint` : `${w.temp}°C · feels ${w.feelsLike}°`}
      <span className={cn("rounded-full px-1.5 text-[10px] uppercase tracking-wide", w.source === "live" ? "bg-success text-on-media" : "bg-accent text-accent-foreground")}>
        {w.source === "live" ? "Live" : "Forecast"}
      </span>
      {suit !== undefined && suit !== null && <span className="opacity-80">· {suit}% suitable</span>}
    </span>
  );
}

/** "5 hr 15 min" from decimal hours. */
export const fmtHours = (h: number) => { const minutes = Math.round(h * 60); return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`; };

/** "Open-Meteo · Live · updated 6 min ago" style source label. */
export function weatherSourceLabel(w: WeatherNow) {
  if (w.source === "unavailable") return "Weather currently unavailable";
  if (w.source === "forecast") return `Open-Meteo · Forecast for ${w.updatedAt.slice(0, 10)} (India time)`;
  const stamp = Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(w.updatedAt) ? w.updatedAt : `${w.updatedAt}+05:30`);
  const mins = Number.isFinite(stamp) ? Math.max(0, Math.round((Date.now() - stamp) / 60000)) : null;
  const ago = mins === null ? "" : mins < 1 ? " · updated just now" : mins < 90 ? ` · updated ${mins} min ago` : ` · updated ${Math.round(mins / 60)} hr ago`;
  return `Open-Meteo · ${w.source === "live" ? "Live" : "Forecast"}${ago}`;
}

export function SaveButton({ id, onMedia }: { id: string; onMedia?: boolean }) {
  const { has, toggle } = useSaved();
  const on = has(id);
  return (
    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }} aria-label={on ? "Remove from saved" : "Save trip"}
      className={cn("grid size-10 place-items-center rounded-full transition hover:scale-110", onMedia ? "glass" : "border bg-card")}>
      <Heart className={cn("size-4", on && "fill-accent text-accent")} />
    </button>
  );
}

export function Badges({ d, onMedia }: { d: Destination; onMedia?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {d.categories.slice(0, 3).map((c) => (
        <span key={c} className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", onMedia ? "glass" : "bg-secondary")}>{CATEGORY_META[c].label}</span>
      ))}
    </div>
  );
}

export function ExplainPanel({ r }: { r: Recommendation }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border bg-background/60">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold">
        See score breakdown <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-4 px-4 pb-4 text-xs">
          <div className="space-y-2">
            {(Object.keys(WEIGHTS) as Factor[]).map((k) => {
              const f = r.factors[k];
              return (
                <div key={k}>
                  <div className="flex justify-between">
                    <span>{FACTOR_LABEL[k]} <span className="text-muted-foreground">({Math.round(r.effectiveWeights[k] * 100)}% weight)</span></span>
                    {f === null
                      ? <span className="text-muted-foreground">not applicable — excluded</span>
                      : <span className="font-mono">{Math.round(f * 100)}% × {r.effectiveWeights[k].toFixed(2)} = {(f * r.effectiveWeights[k] * 100).toFixed(1)} pts</span>}
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${(f ?? 0) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
          <div>
            <p className="mb-1.5 font-semibold">Context checks (already reflected in fit; no extra score bonuses)</p>
            {r.rules.length === 0 && <p className="text-muted-foreground">No rules fired.</p>}
            <ul className="space-y-1 font-mono text-[11px]">
              {r.rules.map((x) => (
                <li key={x.id} className={cn(x.effect > 0 ? "text-success" : x.effect < 0 ? "text-destructive" : "text-muted-foreground")}>{x.id}: {x.text}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function RecommendationCard({ r, featured, rank }: { r: Recommendation; featured?: boolean; rank?: number }) {
  const d = r.dest;
  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-[28px] border bg-card shadow-soft", featured && "lg:col-span-1")}>
      <Link to="/destination/$id" params={{ id: d.id }} className="relative block aspect-[4/3] overflow-hidden">
        <img src={destImage(d)} alt={d.name} loading="lazy" width={1280} height={960} className="size-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 card-scrim" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          {rank && <span className="rounded-full bg-on-media px-3 py-1 text-xs font-bold text-foreground">#{rank}</span>}
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">{r.match}/100 fit</span>
        </div>
        <div className="absolute right-4 top-4"><SaveButton id={d.id} onMedia /></div>
        <div className="absolute inset-x-4 bottom-4 text-on-media">
          <h3 className="text-2xl font-bold">{d.name}</h3>
          <p className="text-sm opacity-85">{d.state}</p>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2"><Badges d={d} /><WeatherChip w={r.weather} suit={r.suitability} /></div>
        <p className="text-sm leading-relaxed text-muted-foreground">{r.description}</p>
        {!r.eligible && <p className="rounded-xl bg-muted p-3 text-sm font-semibold">Alternative — requires changes to your preferences</p>}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">Estimated total</p>
            <p className="font-display text-lg font-bold">{inr(r.estimate.total)}</p><p className="text-xs text-muted-foreground">Indicative range {inr(r.budgetRange[0])}–{inr(r.budgetRange[1])}</p>
            <p className="text-[11px] capitalize text-muted-foreground">{r.estimate.tier} tier · {r.estimate.mode} · cost confidence: {r.budgetConfidence}</p>
          </div>
          <div className="rounded-2xl bg-muted p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3" /> Best time</p>
            <p className="text-sm font-semibold">{d.bestMonths.slice(0, 4).map((m) => MONTHS[m - 1]).join(", ")}{d.bestMonths.length > 4 ? "…" : ""}</p>
            <p className="text-[11px] text-muted-foreground">Suggested {d.days[0]}–{d.days[1]} days</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {r.estimate.intercitySource === "not-applicable"
            ? "Road route not applicable — flight/ferry required. Intercity cost is an estimated airfare."
            : r.estimate.intercitySource === "route"
              ? `Road distance: ${r.estimate.km} km · approx drive ${fmtHours(r.estimate.hours)} · OSRM live route`
              : `Approx distance: ${r.estimate.km} km · ~${fmtHours(r.estimate.hours)} · estimated (route unavailable)`}
        </p>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{r.eligible ? "Why this matches your trip" : "What matches"}</p>
          <ul className="mt-2 space-y-1 text-sm">{r.reasons.slice(0, 5).map((x) => <li key={x}>• {x}</li>)}</ul>
        </div>
        <p className="text-xs text-muted-foreground">{r.weatherContext}</p>
        {r.cautions.length > 0 && <div className="rounded-2xl bg-muted p-3 text-sm"><p className="font-semibold">Before you choose</p><ul className="mt-2 space-y-1">{r.cautions.map(c => <li key={c}>• {c}</li>)}</ul></div>}
        {featured && <p className="text-sm text-muted-foreground">Try: {d.activities.slice(0, 3).join(" · ")}</p>}
        <div className="mt-auto"><ExplainPanel r={r} /></div>
      </div>
    </article>
  );
}

export function SimpleCard({ d, w }: { d: Destination; w?: WeatherNow }) {
  return (
    <Link to="/destination/$id" params={{ id: d.id }} className="group relative block aspect-[3/4] overflow-hidden rounded-[28px] shadow-soft">
      <DestinationGallery images={d.images} labels={d.imageLabels} name={d.name} />
      <div className="absolute inset-0 card-scrim" />
      <div className="absolute right-4 top-4"><SaveButton id={d.id} onMedia /></div>
      <div className="absolute inset-x-4 bottom-4 space-y-2 text-on-media">
        <Badges d={d} onMedia />
        <h3 className="text-2xl font-bold">{d.name}</h3>
        <p className="text-sm opacity-85">{d.state} · from {inr(d.daily.budget)}/day est.</p>
        {w && <WeatherChip w={w} onMedia />}
      </div>
    </Link>
  );
}
