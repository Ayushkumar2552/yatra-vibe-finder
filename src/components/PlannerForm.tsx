import { useNavigate } from "@tanstack/react-router";
import { LocateFixed, Sparkles } from "lucide-react";
import { useState } from "react";
import { CATEGORY_META, ORIGIN_CITIES, type Category } from "@/data/destinations";
import { MONTHS, type PlannerSearch } from "@/lib/planner-params";

export function PlannerForm({ initial }: { initial: PlannerSearch }) {
  const nav = useNavigate();
  const [s, setS] = useState<PlannerSearch>({ budget: 30000, travelers: 2, days: 4, climate: "any", transport: "any", group: "couple", month: new Date().getMonth() + 1, ...initial });
  const [geo, setGeo] = useState<string>("");
  const vibes = (s.vibes ?? "").split(",").filter(Boolean);
  const set = (p: Partial<PlannerSearch>) => setS((x) => ({ ...x, ...p }));
  const toggleVibe = (c: Category) => set({ vibes: (vibes.includes(c) ? vibes.filter((v) => v !== c) : [...vibes, c]).join(",") });
  const locate = () => {
    if (!navigator.geolocation) return setGeo("Geolocation unavailable — pick a city.");
    setGeo("Asking permission…");
    navigator.geolocation.getCurrentPosition(
      (p) => { set({ from: "My location", lat: +p.coords.latitude.toFixed(3), lon: +p.coords.longitude.toFixed(3) }); setGeo("Using your location."); },
      () => setGeo("Permission denied — please pick a city."),
    );
  };
  const field = "w-full rounded-2xl border bg-card px-4 py-3 text-sm";
  const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";
  return (
    <form className="grid gap-6 rounded-[32px] border bg-card p-6 shadow-soft md:p-8"
      onSubmit={(e) => { e.preventDefault(); if (!s.from) return setGeo("Choose a start city or use your location."); nav({ to: "/planner", search: { ...s, run: true } }); }}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <span className={label}>Starting from</span>
          <select className={field} value={s.lat !== undefined && s.from === "My location" ? "My location" : s.from ?? ""}
            onChange={(e) => set({ from: e.target.value, lat: undefined, lon: undefined })}>
            <option value="">Select city…</option>
            {s.from === "My location" && <option>My location</option>}
            {ORIGIN_CITIES.map((c) => <option key={c.name}>{c.name}</option>)}
          </select>
          <button type="button" onClick={locate} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent"><LocateFixed className="size-3" /> Use my location</button>
          {geo && <p className="mt-1 text-xs text-muted-foreground">{geo}</p>}
        </div>
        <label><span className={label}>Total budget (₹)</span><input type="number" min={2000} step={1000} className={field} value={s.budget} onChange={(e) => set({ budget: +e.target.value })} /></label>
        <label><span className={label}>Travel month</span>
          <select className={field} value={s.month} onChange={(e) => set({ month: +e.target.value })}>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></label>
        <label><span className={label}>Travellers</span><input type="number" min={1} max={20} className={field} value={s.travelers} onChange={(e) => set({ travelers: +e.target.value })} /></label>
        <label><span className={label}>Days</span><input type="number" min={1} max={21} className={field} value={s.days} onChange={(e) => set({ days: +e.target.value })} /></label>
        <label><span className={label}>Group</span>
          <select className={field} value={s.group} onChange={(e) => set({ group: e.target.value as PlannerSearch["group"] })}>
            <option value="solo">Solo</option><option value="couple">Couple</option><option value="family">Family</option><option value="friends">Friends</option></select></label>
        <label><span className={label}>Climate</span>
          <select className={field} value={s.climate} onChange={(e) => set({ climate: e.target.value as PlannerSearch["climate"] })}>
            <option value="any">No preference</option><option value="cool">Cool</option><option value="mild">Mild</option><option value="warm">Warm</option><option value="snow">Snowy</option></select></label>
        <label><span className={label}>Transport</span>
          <select className={field} value={s.transport} onChange={(e) => set({ transport: e.target.value as PlannerSearch["transport"] })}>
            <option value="any">Best option</option><option value="train">Train</option><option value="bus">Bus</option><option value="car">Car</option><option value="flight">Flight</option></select></label>
        <label className="flex items-center gap-3 self-end rounded-2xl border px-4 py-3 text-sm">
          <input type="checkbox" checked={!!s.live} onChange={(e) => set({ live: e.target.checked || undefined })} /> Use current weather
        </label>
      </div>
      <div>
        <span className={label}>Vibe</span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
            <button type="button" key={c} onClick={() => toggleVibe(c)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${vibes.includes(c) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>{CATEGORY_META[c].label}</button>
          ))}
        </div>
      </div>
      <button className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 font-semibold text-accent-foreground transition hover:scale-[1.01]"><Sparkles className="size-4" /> Find my destinations</button>
    </form>
  );
}
