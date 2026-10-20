import { createFileRoute, Link } from "@tanstack/react-router";
import { SimpleCard } from "@/components/DestinationCard";
import { CATEGORY_META, DESTINATIONS, type Category } from "@/data/destinations";
import { useWeather } from "@/lib/weather/useWeather";

export const Route = createFileRoute("/explore")({
  validateSearch: (s: Record<string, unknown>): { category?: Category } => ({ category: s.category && s.category in CATEGORY_META ? (s.category as Category) : undefined }),
  head: () => ({ meta: [
    { title: "Explore India — YatraAI" }, { name: "description", content: "Browse 48 Indian destinations: beaches, mountains, heritage, desert and more." },
    { property: "og:title", content: "Explore India — YatraAI" }, { property: "og:description", content: "Beaches, mountains, heritage, desert and nature across India." },
  ] }),
  component: Explore,
});

function Explore() {
  const { category } = Route.useSearch();
  const list = DESTINATIONS.filter((d) => !category || d.categories.includes(category));
  const { weather } = useWeather(list, new Date().getMonth() + 1);
  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8">
      <h1 className="text-5xl font-bold">{category ? CATEGORY_META[category].label : "Explore India"}</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/explore" search={{}} className={`rounded-full border px-4 py-2 text-sm ${!category ? "bg-primary text-primary-foreground" : "bg-card"}`}>All</Link>
        {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
          <Link key={c} to="/explore" search={{ category: c }} className={`rounded-full border px-4 py-2 text-sm ${category === c ? "bg-primary text-primary-foreground" : "bg-card"}`}>{CATEGORY_META[c].label}</Link>
        ))}
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{list.map((d) => <SimpleCard key={d.id} d={d} w={weather[d.id]} />)}</div>
    </div>
  );
}
