import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Heart, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Explore", to: "/explore", search: {} },
  { label: "Beaches", to: "/explore", search: { category: "beach" } },
  { label: "Mountains", to: "/explore", search: { category: "mountain" } },
  { label: "Heritage", to: "/explore", search: { category: "heritage" } },
  { label: "Road Trips", to: "/explore", search: { category: "roadtrip" } },
  { label: "AI Planner", to: "/planner", search: {} },
  { label: "Weather", to: "/weather", search: {} },
] as const;

export function SiteNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const overMedia = path === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  const light = overMedia && !scrolled && !open;

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500",
      light ? "text-on-media" : "bg-background/90 text-foreground backdrop-blur-xl border-b")}>
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-5 md:h-20 md:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className={cn("grid size-8 place-items-center rounded-full", light ? "bg-on-media text-foreground" : "bg-primary text-primary-foreground")}>
            <Compass className="size-4" />
          </span>
          Yatra<span className="text-accent">AI</span>
        </Link>
        <ul className="hidden flex-1 items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.label}>
              <Link to={l.to} search={l.search as never} className="rounded-full px-3 py-2 text-sm font-medium opacity-85 transition hover:opacity-100 hover:bg-foreground/5">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/saved" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium sm:flex hover:bg-foreground/5">
            <Heart className="size-4" /> Saved Trips
          </Link>
          <Link to="/planner" className={cn("rounded-full px-5 py-2.5 text-sm font-semibold transition hover:scale-[1.03]",
            light ? "bg-on-media text-foreground" : "bg-primary text-primary-foreground")}>
            Plan my trip
          </Link>
          <button className="rounded-full p-2 lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <ul className="grid gap-1 border-t bg-background px-5 py-4 lg:hidden">
          {[...LINKS, { label: "Saved Trips", to: "/saved", search: {} }, { label: "How it works", to: "/about", search: {} }].map((l) => (
            <li key={l.label}><Link to={l.to} search={l.search as never} className="block rounded-xl px-3 py-3 font-medium hover:bg-muted">{l.label}</Link></li>
          ))}
        </ul>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-secondary/50">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-display text-2xl font-bold">Yatra<span className="text-accent">AI</span></p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">An explainable, rule-based travel recommender for India. Budgets are estimates, not booking quotes.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <Link to="/explore">Explore</Link><Link to="/planner">AI Planner</Link><Link to="/weather">Weather</Link>
          <Link to="/saved">Saved</Link><Link to="/about">How it works</Link>
        </div>
      </div>
    </footer>
  );
}
