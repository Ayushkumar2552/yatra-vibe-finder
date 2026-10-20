import { createFileRoute } from "@tanstack/react-router";
import { SimpleCard } from "@/components/DestinationCard";
import { DESTINATIONS } from "@/data/destinations";
import { weatherSuitability } from "@/lib/engine/recommend";
import { useWeather } from "@/lib/weather/useWeather";

export const Route = createFileRoute("/weather")({
  head: () => ({ meta: [
    { title: "Weather-aware picks — YatraAI" }, { name: "description", content: "Indian destinations ranked by how pleasant the weather is right now." },
    { property: "og:title", content: "Weather-aware picks — YatraAI" }, { property: "og:description", content: "Where the weather is best in India right now." },
  ] }),
  component: WeatherPage,
});

function WeatherPage() {
  const { weather, isLive, isLoading } = useWeather(DESTINATIONS, new Date().getMonth() + 1);
  const ranked = [...DESTINATIONS].sort((a, b) => weatherSuitability(weather[b.id]) - weatherSuitability(weather[a.id]));
  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8">
      <h1 className="text-5xl font-bold">Where the weather is kind.</h1>
      <p className="mt-3 text-muted-foreground">{isLoading ? "Checking weather…" : isLive ? "Live conditions from the weather provider." : "Demo/Estimated weather — add a weather API key for live data."}</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{ranked.slice(0, 16).map((d) => <SimpleCard key={d.id} d={d} w={weather[d.id]} />)}</div>
    </div>
  );
}
