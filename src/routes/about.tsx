import { createFileRoute } from "@tanstack/react-router";
import { FACTOR_LABEL, RULES, WEIGHTS, type Factor } from "@/lib/engine/recommend";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "How it works — YatraAI" }, { name: "description", content: "How YatraAI's explainable rule-based recommender ranks Indian destinations." },
    { property: "og:title", content: "How it works — YatraAI" }, { property: "og:description", content: "Weighted factors plus forward-chaining IF/THEN rules." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-5 pt-28">
      <h1 className="text-5xl font-bold">How the AI decides</h1>
      <p className="text-muted-foreground">YatraAI is a rule-based expert system, not generative AI. Each destination gets a weighted score, then IF/THEN rules fire by forward chaining until no new facts appear.</p>
      <div className="rounded-[28px] border bg-card p-6"><h2 className="text-2xl font-bold">1. Weighted factors</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">{(Object.keys(WEIGHTS) as Factor[]).map((k) => <li key={k} className="flex justify-between rounded-2xl bg-muted px-4 py-2 text-sm"><span>{FACTOR_LABEL[k]}</span><b>{WEIGHTS[k] * 100}%</b></li>)}</ul></div>
      <div className="rounded-[28px] border bg-card p-6"><h2 className="text-2xl font-bold">2. Rule base</h2>
        <ul className="mt-3 space-y-1 font-mono text-xs">{RULES.map((r) => <li key={r.id}>{r.id}: {r.text}</li>)}</ul>
        <p className="mt-3 text-sm text-muted-foreground">match% = clamp(base × 100 + Σ rule effects, 5, 99)</p></div>
      <div className="rounded-[28px] border bg-card p-6 text-sm"><h2 className="text-2xl font-bold">Developer notes</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Destination data: <code>src/data/destinations.ts</code></li>
          <li>Scoring + rules: <code>src/lib/engine/recommend.ts</code>; budget: <code>estimate.ts</code>; itinerary: <code>itinerary.ts</code></li>
          <li>Live weather: add secret <code>WEATHER_API_KEY</code> (OpenWeatherMap). Without it, weather is labelled Demo.</li>
          <li>Hero videos: put <code>beach.mp4</code>, <code>roadtrip.mp4</code>, <code>desert.mp4</code> in <code>public/videos/</code>.</li>
        </ul></div>
    </div>
  );
}
