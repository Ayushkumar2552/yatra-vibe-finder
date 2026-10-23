import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PlannerForm } from "@/components/PlannerForm";
import { RecommendationCard } from "@/components/DestinationCard";
import { CATEGORY_META, DESTINATIONS, type Category } from "@/data/destinations";
import { useQuery } from "@tanstack/react-query";
import { runPlanner } from "@/lib/engine/planner.functions";
import { useAuth, PlannerLoginGate } from "@/components/AuthProvider";
import type { PlannerSearch } from "@/lib/planner-params";
import { inr } from "@/lib/engine/estimate";
import { toPreferences, validatePlannerSearch } from "@/lib/planner-params";
import { weatherMode } from "@/lib/weather/provider";
import { useWeather } from "@/lib/weather/useWeather";

export const Route = createFileRoute("/planner")({
  validateSearch: validatePlannerSearch,
  head: () => ({ meta: [
    { title: "AI Trip Planner — YatraAI" },
    { name: "description", content: "Rank Indian destinations by budget, weather, distance and vibe with explainable rules." },
    { property: "og:title", content: "AI Trip Planner — YatraAI" },
    { property: "og:description", content: "Weighted, rule-based destination ranking you can inspect." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Planner,
});

function Planner() {
  const search = Route.useSearch();
  const { user } = useAuth();
  const prefs = toPreferences(search, new Date().getMonth() + 1);
  if (!user) return <PlannerLoginGate />;
  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8">
      <h1 className="text-5xl font-bold md:text-6xl">Find the trip that fits you.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Tell us your budget, interests and dates. Compare places that fit, understand why they match, and see the trade-offs before you decide.</p>
      <div className="mt-8"><PlannerForm key={JSON.stringify(search)} initial={search} /></div>
      {search.run && prefs && <Results prefs={prefs} search={search} />}
      {search.run && !prefs && <p role="alert" className="mt-6">Please enter valid trip details above to get recommendations.</p>}
    </div>
  );
}

function Results({ prefs, search }: { prefs: NonNullable<ReturnType<typeof toPreferences>>; search: PlannerSearch }) {
  const { user } = useAuth();
  const applicableWeather = prefs.useWeather && (prefs.travelDate ? weatherMode(prefs.travelDate) !== 'out-of-range' : prefs.month === new Date().getMonth() + 1);
  const { weather, isLive, isLoading } = useWeather(applicableWeather ? DESTINATIONS : [], prefs.travelDate);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [cat, setCat] = useState<Category | "all">("all");
  const [sort, setSort] = useState<"match" | "budget" | "weather">("match");
  const ranked = useQuery({ queryKey: ['recommendations', user?.id, search, weather], queryFn: () => runPlanner({ data: { search: { ...search }, weather } }), enabled: !!user && (!applicableWeather || !isLoading), retry: false, staleTime: 60000 });
  const recs = ranked.data ?? [];
  const feasible = recs.filter(r => r.eligible);
  const candidates = showAlternatives ? recs : feasible;
  const list = candidates.filter((r) => cat === "all" || r.dest.categories.includes(cat))
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || (sort === "budget" ? a.estimate.total - b.estimate.total : sort === "weather" ? (b.suitability ?? -1) - (a.suitability ?? -1) : b.match - a.match));
  if ((applicableWeather && isLoading) || ranked.isLoading) return <div className="flex items-center gap-2 py-20"><Loader2 className="size-5 animate-spin" /> Ranking destinations…</div>;
  if (ranked.isError) return <p role="alert" className="py-10">Unable to create recommendations. Check your sign-in and <button className="underline" onClick={() => void ranked.refetch()}>try again</button>.</p>;
  const top = list.slice(0, 3), rest = list.slice(3, 24);
  return (
    <section className="mt-16 animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold">Your top picks from {prefs.origin.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Budget {inr(prefs.budget)} · {prefs.travelers} travellers · {prefs.days} days · Weather: {!prefs.useWeather ? "Not scored" : isLive ? prefs.travelDate && weatherMode(prefs.travelDate) === "forecast" ? "Departure forecast" : "Current conditions" : "Not available for your dates"} · All costs are estimates.</p>
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
      <div className="mt-6 rounded-2xl border bg-card p-4 text-sm">
        <p>{feasible.length} destinations meet the basic budget, interest and transport checks. Scores measure preference fit, not a probability or guarantee. Costs and travel times are estimates.</p>
        {!feasible.length && <p className="mt-2 font-semibold">No destination meets all basic constraints. Adjust your budget, interests, transport or trip length, or inspect alternatives below.</p>}
        <label className="mt-3 flex items-center gap-2"><input type="checkbox" checked={showAlternatives} onChange={e => setShowAlternatives(e.target.checked)} /> Show alternatives that require changing my preferences</label>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">{top.map((r, i) => <RecommendationCard key={r.dest.id} r={r} featured rank={i + 1} />)}</div>
      {rest.length > 0 && <><h3 className="mt-16 text-2xl font-bold">More matches</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{rest.map((r) => <RecommendationCard key={r.dest.id} r={r} />)}</div></>}
    </section>
  );
}
