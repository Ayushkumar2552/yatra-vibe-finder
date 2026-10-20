import { createFileRoute, Link } from "@tanstack/react-router";
import { SimpleCard } from "@/components/DestinationCard";
import { DESTINATIONS } from "@/data/destinations";
import { useSaved } from "@/lib/saved";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [
    { title: "Saved Trips — YatraAI" }, { name: "description", content: "Your saved Indian destinations." },
    { property: "og:title", content: "Saved Trips — YatraAI" }, { property: "og:description", content: "Destinations you've saved on YatraAI." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Saved,
});

function Saved() {
  const { ids } = useSaved();
  const list = DESTINATIONS.filter((d) => ids.includes(d.id));
  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8">
      <h1 className="text-5xl font-bold">Saved trips</h1>
      {list.length === 0 ? <p className="mt-6 text-muted-foreground">Nothing saved yet. Tap the heart on any destination. <Link to="/explore" className="font-semibold text-accent">Explore →</Link></p>
        : <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{list.map((d) => <SimpleCard key={d.id} d={d} />)}</div>}
    </div>
  );
}
