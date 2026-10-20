import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PlannerForm } from "@/components/PlannerForm";
import { RecommendationCard } from "@/components/DestinationCard";
import { CATEGORY_META, DESTINATIONS, type Category } from "@/data/destinations";
import { recommend } from "@/lib/engine/recommend";
import { inr } from "@/lib/engine/estimate";
import { toPreferences, validatePlannerSearch } from "@/lib/planner-params";
import { useWeather } from "@/lib/weather/useWeather";

export const Route = createFileRoute("/planner")({
  validateSearch: validatePlannerSearch,
  head: () => ({ meta: [
    { title: "AI Trip Planner — YatraAI" },
    { name: "description", content: "Rank Indian destinations by budget, weather, distance and vibe with explainable rules." },
    { property: "og:title", content: "AI Trip Planner — YatraAI" },
    { property: "og:description", content: "Weighted, rule-based destination ranking you can inspect." },
  ] }),
  component: Planner,
});

function Planner() {
  const search = Route.useSearch();
  const prefs = toPreferences(search, new Date().getMonth() + 1);
  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8">
      <h1 className="text-5xl font-bold md:text-6xl">Find the trip that fits you.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Fill in a few details. Ranking is a transparent weighted score plus IF/THEN rules — not generative AI.</p>
      <div className="mt-8"><PlannerForm key={JSON.stringify(search)} initial={search} /></div>
      {search.run && prefs && <Results prefs={prefs} />}
    </div>
  );
}

function Results({ prefs }: { prefs: NonNullable<ReturnType<typeof toPreferences>> }) {
  const { weather, isLive, isLoading } = useWeather(DESTINATIONS, prefs.month);
  const [cat, setCat] = useState<Category | "all">("all");
  const [sort, setSort] = useState<"match" | "budget" | "weather">("match");
  const recs = useMemo(() => recommend(DESTINATIONS, prefs, weather), [prefs, weather]);
  const list = recs.filter((r) => cat === "all" || r.dest.categories.includes(cat))
    .sort((a, b) => sort === "budget" ? a.estimate.total - b.estimate.total : sort === "weather" ? b.suitability - a.suitability : b.match - a.match);
  if (isLoading) return <div className="flex items-center gap-2 py-20"><Loader2 className="size-5 animate-spin" /> Ranking destinations…</div>;
  const top = list.slice(0, 3), rest = list.slice(3, 24);
  return (
    <section className="mt-16 animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold">Your top picks from {prefs.origin.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Budget {inr(prefs.budget)} · {prefs.travelers} travellers · {prefs.days} days · Weather: {isLive ? "Live" : "Demo/Estimated (no API key)"} · All costs are estimates.</p>
        </div>
        <div className="flex gap-2">
          <select className="rounded-full border bg-card px-4 py-2 text-sm" value={cat} onChange={(e) => setCat(e.target.value as Category | "all")}>
            <option value="all">All categories</option>{(Object.keys(CATEGORY_META) as Category[]).map((c) => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
          </select>
          <select className="rounded-full border bg-card px-4 py-2 text-sm" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="match">Sort: Match</option><option value="budget">Sort: Lowest budget</option><option value="weather">Sort: Best weather</option>
          </select>
        </div>
      </div>
      {list.length === 0 && <p className="py-10 text-muted-foreground">No matches for this filter.</p>}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">{top.map((r, i) => <RecommendationCard key={r.dest.id} r={r} featured rank={i + 1} />)}</div>
      {rest.length > 0 && <><h3 className="mt-16 text-2xl font-bold">More matches</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{rest.map((r) => <RecommendationCard key={r.dest.id} r={r} />)}</div></>}
    </section>
  );
}
