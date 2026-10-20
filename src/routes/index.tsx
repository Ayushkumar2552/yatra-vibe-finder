import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { Hero } from "@/components/Hero";
import { parsePrompt } from "@/lib/engine/parsePrompt";
import { CATEGORY_IMAGE } from "@/lib/images";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "YatraAI — India, picked for your mood" },
    { name: "description", content: "Explainable AI travel recommender for India: budget, weather and vibe-aware destination picks." },
    { property: "og:title", content: "YatraAI — India, picked for your mood" },
    { property: "og:description", content: "Find the Indian destination that fits your budget, crew and vibe — with transparent reasoning." },
  ] }),
  component: Home,
});

const PROMPTS = ["Beach escape under ₹20k", "Cool mountains this weekend", "3-day heritage trip", "Peaceful spiritual break", "Road trip from Pune"];
const CATS = [
  { key: "beach", label: "Beaches" }, { key: "mountain", label: "Mountains" }, { key: "heritage", label: "Heritage & Spiritual" },
  { key: "desert", label: "Desert" }, { key: "nature", label: "Nature" }, { key: "roadtrip", label: "Road Trips" },
] as const;

function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const go = (text: string) => {
    const p = parsePrompt(text);
    nav({ to: "/planner", search: { ...p, from: p.from } });
  };
  return (
    <>
      <Hero />
      <section className="relative z-10 mx-auto -mt-10 max-w-4xl px-5">
        <form onSubmit={(e) => { e.preventDefault(); go(q); }} className="flex items-center gap-3 rounded-full border bg-card p-2 pl-6 shadow-soft">
          <Search className="size-5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Where should I go in India?" className="flex-1 bg-transparent py-3 text-base outline-none" />
          <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Ask</button>
        </form>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {PROMPTS.map((p) => <button key={p} onClick={() => go(p)} className="rounded-full border bg-card px-4 py-2 text-sm hover:bg-muted">{p}</button>)}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Your words are parsed by simple keyword rules — then you confirm details in the planner.</p>
      </section>
      <section className="mx-auto mt-24 max-w-[1400px] px-5 md:px-8">
        <div className="flex items-end justify-between"><h2 className="text-4xl font-bold md:text-5xl">Start with a feeling.</h2>
          <Link to="/explore" className="hidden items-center gap-1 font-semibold md:flex">Explore all <ArrowRight className="size-4" /></Link></div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATS.map((c) => (
            <Link key={c.key} to="/explore" search={{ category: c.key }} className="group relative aspect-[3/4] overflow-hidden rounded-[28px]">
              <img src={CATEGORY_IMAGE[c.key]} alt={c.label} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 card-scrim" />
              <p className="absolute bottom-4 left-4 text-lg font-bold text-on-media">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
