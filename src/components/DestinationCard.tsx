import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronDown, Cloud, CloudRain, Heart, Snowflake, Sun, Wind } from "lucide-react";
import { useState } from "react";
import { CATEGORY_META, type Destination } from "@/data/destinations";
import { destImage } from "@/lib/images";
import { useSaved } from "@/lib/saved";
import { inr } from "@/lib/engine/estimate";
import { FACTOR_LABEL, WEIGHTS, type Factor, type Recommendation } from "@/lib/engine/recommend";
import type { WeatherNow } from "@/lib/weather/mock";
import { MONTHS } from "@/lib/planner-params";
import { cn } from "@/lib/utils";

export function WeatherIcon({ c, className }: { c: string; className?: string }) {
  const I = c === "Rain" || c === "Thunderstorm" || c === "Drizzle" ? CloudRain : c === "Snow" ? Snowflake : c === "Clouds" ? Cloud : c === "Haze" || c === "Mist" ? Wind : Sun;
  return <I className={className} />;
}

export function WeatherChip({ w, suit, onMedia }: { w: WeatherNow; suit?: number; onMedia?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", onMedia ? "glass" : "bg-muted")}>
      <WeatherIcon c={w.condition} className="size-3.5" />
      {w.temp}°C · feels {w.feelsLike}°
      <span className={cn("rounded-full px-1.5 text-[10px] uppercase tracking-wide", w.source === "live" ? "bg-success text-on-media" : "bg-warning text-foreground")}>
        {w.source === "live" ? "Live" : "Demo"}
      </span>
      {suit !== undefined && <span className="opacity-80">· {suit}% suitable</span>}
    </span>
  );
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
        How AI decided <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-4 px-4 pb-4 text-xs">
          <div className="space-y-2">
            {(Object.keys(WEIGHTS) as Factor[]).map((k) => (
              <div key={k}>
                <div className="flex justify-between"><span>{FACTOR_LABEL[k]} <span className="text-muted-foreground">(w={WEIGHTS[k]})</span></span><span className="font-mono">{Math.round(r.factors[k] * 100)}%</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${r.factors[k] * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-1.5 font-semibold">Rules fired (forward chaining)</p>
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
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">{r.match}% match</span>
        </div>
        <div className="absolute right-4 top-4"><SaveButton id={d.id} onMedia /></div>
        <div className="absolute inset-x-4 bottom-4 text-on-media">
          <h3 className="text-2xl font-bold">{d.name}</h3>
          <p className="text-sm opacity-85">{d.state}</p>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2"><Badges d={d} /><WeatherChip w={r.weather} suit={r.suitability} /></div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">Estimated total</p>
            <p className="font-display text-lg font-bold">{inr(r.estimate.total)}</p>
            <p className="text-[11px] capitalize text-muted-foreground">{r.estimate.tier} tier · {r.estimate.mode}</p>
          </div>
          <div className="rounded-2xl bg-muted p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3" /> Best time</p>
            <p className="text-sm font-semibold">{d.bestMonths.slice(0, 4).map((m) => MONTHS[m - 1]).join(", ")}{d.bestMonths.length > 4 ? "…" : ""}</p>
            <p className="text-[11px] text-muted-foreground">Suggested {d.days[0]}–{d.days[1]} days</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why this fits you</p>
          <ul className="mt-2 space-y-1 text-sm">{r.reasons.slice(0, featured ? 4 : 3).map((x) => <li key={x}>• {x}</li>)}</ul>
        </div>
        {featured && <p className="text-sm text-muted-foreground">Try: {d.activities.slice(0, 3).join(" · ")}</p>}
        <div className="mt-auto"><ExplainPanel r={r} /></div>
      </div>
    </article>
  );
}

export function SimpleCard({ d, w }: { d: Destination; w?: WeatherNow }) {
  return (
    <Link to="/destination/$id" params={{ id: d.id }} className="group relative block aspect-[3/4] overflow-hidden rounded-[28px] shadow-soft">
      <img src={destImage(d)} alt={d.name} loading="lazy" width={1280} height={960} className="size-full object-cover transition duration-700 group-hover:scale-105" />
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
