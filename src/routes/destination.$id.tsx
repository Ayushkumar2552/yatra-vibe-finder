import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Badges, SaveButton, WeatherChip } from "@/components/DestinationCard";
import { getDestination, ORIGIN_CITIES } from "@/data/destinations";
import { estimate, inr, type Tier } from "@/lib/engine/estimate";
import { buildItinerary } from "@/lib/engine/itinerary";
import { weatherSuitability } from "@/lib/engine/recommend";
import { DestinationGallery } from "@/components/DestinationGallery";
import { MONTHS } from "@/lib/planner-params";
import { useWeather } from "@/lib/weather/useWeather";

import { TripPreparation } from "@/components/TripPreparation";

export const Route = createFileRoute("/destination/$id")({
  loader: ({ params }) => { const d = getDestination(params.id); if (!d) throw notFound(); return d; },
  head: ({ loaderData }) => ({ meta: [
    { title: loaderData ? `${loaderData.name}, ${loaderData.state} — YatraAI` : "Destination — YatraAI" },
    { name: "description", content: loaderData ? `Estimated budget, weather, best time and itinerary for ${loaderData.name}.` : "Destination details" },
    { property: "og:title", content: loaderData ? `${loaderData.name} — YatraAI` : "YatraAI" },
    { property: "og:description", content: "Estimated budget, weather and a day-wise itinerary." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    ...(loaderData?.image.startsWith("https://") ? [{ property: "og:image", content: loaderData.image }, { name: "twitter:image", content: loaderData.image }] : []),
  ] }),
  component: Detail,
});

function Detail() {
  const d = Route.useLoaderData();
  const [from, setFrom] = useState("Delhi");
  const [travelers, setT] = useState(2);
  const [days, setDays] = useState(d.days[1]);
  const [tier, setTier] = useState<Tier>("mid");
  const { weather } = useWeather([d]);
  const w = weather[d.id];
  const city = ORIGIN_CITIES.find((c) => c.name === from) ?? ORIGIN_CITIES[0];
  if (!city) return null;
  const e = estimate(d, city, travelers, days, "any", tier);
  const rows = [["Stay", e.stay], ["Food", e.food], ["Local transport", e.local], ["Activities", e.activities], [`Intercity (${e.mode}, ~${e.km} km one-way ×2)`, e.intercity]] as const;
  const inp = "rounded-full border bg-card px-4 py-2 text-sm";
  return (
    <div>
      <section className="relative h-[60svh] min-h-[420px] overflow-hidden">
        <DestinationGallery images={d.images} labels={d.imageLabels} name={d.name} hero />
        <div className="absolute inset-0 media-scrim" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] space-y-3 px-5 pb-10 text-on-media md:px-8">
          <Badges d={d} onMedia />
          <h1 className="text-5xl font-bold md:text-7xl">{d.name}</h1>
          <div className="flex flex-wrap items-center gap-3"><span>{d.state}</span>{w && <WeatherChip w={w} suit={weatherSuitability(w)} onMedia />}<SaveButton id={d.id} onMedia /></div>
        </div>
      </section>
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-12 md:px-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-10">
          <TripPreparation key={d.id} destination={d} />
          <div><h2 className="text-3xl font-bold">Highlights</h2><ul className="mt-3 flex flex-wrap gap-2">{d.highlights.map((h) => <li key={h} className="rounded-full bg-secondary px-4 py-2 text-sm">{h}</li>)}</ul>
            <p className="mt-4 text-sm text-muted-foreground">Best months: {d.bestMonths.map((m) => MONTHS[m - 1]).join(", ")} · Suggested {d.days[0]}–{d.days[1]} days</p></div>
          <div><h2 className="text-3xl font-bold">Suggested itinerary</h2><p className="mt-2 text-sm text-muted-foreground">Activity ideas, not a timed route. Check travel times, opening hours, permits and availability before booking.</p>
            <ol className="mt-4 space-y-3">{buildItinerary(d, days).map((p) => (
              <li key={p.day} className="rounded-3xl border bg-card p-5"><p className="text-xs font-semibold uppercase text-accent">Day {p.day}</p><p className="font-display text-lg font-bold">{p.title}</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">{p.items.map((x) => <li key={x}>• {x}</li>)}</ul></li>))}</ol></div>
        </div>
        <aside className="h-fit space-y-4 rounded-[28px] border bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <h2 className="text-2xl font-bold">Budget breakdown <span className="text-sm font-medium text-warning">Estimated</span></h2>
          <div className="flex flex-wrap gap-2">
            <select className={inp} value={from} onChange={(x) => setFrom(x.target.value)}>{ORIGIN_CITIES.map((c) => <option key={c.name}>{c.name}</option>)}</select>
            <input className={`${inp} w-20`} type="number" min={1} value={travelers} onChange={(x) => setT(Math.max(1, +x.target.value))} aria-label="Travellers" />
            <input className={`${inp} w-20`} type="number" min={1} value={days} onChange={(x) => setDays(Math.max(1, +x.target.value))} aria-label="Days" />
            <select className={inp} value={tier} onChange={(x) => setTier(x.target.value as Tier)}><option value="budget">Budget</option><option value="mid">Mid</option><option value="luxury">Luxury</option></select>
          </div>
          <dl className="space-y-2 text-sm">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold">{inr(v)}</dd></div>)}</dl>
          <div className="flex justify-between border-t pt-3 font-display text-xl font-bold"><span>Total</span><span>{inr(e.total)}</span></div>
          <p className="text-xs text-muted-foreground">Demo heuristics for {travelers} travellers, {days} days. Not a live booking quote.</p>
        </aside>
      </div>
    </div>
  );
}
