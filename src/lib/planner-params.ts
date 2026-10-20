import { ORIGIN_CITIES, type Category } from "@/data/destinations";
import type { Climate, Group, Preferences } from "@/lib/engine/recommend";
import type { Transport } from "@/lib/engine/estimate";

export interface PlannerSearch {
  from?: string; lat?: number; lon?: number; budget?: number; travelers?: number; days?: number;
  vibes?: string; climate?: Climate; month?: number; transport?: Transport; group?: Group; live?: boolean; run?: boolean;
}

const num = (v: unknown) => (v === undefined || v === "" || isNaN(Number(v)) ? undefined : Number(v));

export function validatePlannerSearch(s: Record<string, unknown>): PlannerSearch {
  return {
    from: typeof s.from === "string" ? s.from : undefined,
    lat: num(s.lat), lon: num(s.lon), budget: num(s.budget), travelers: num(s.travelers), days: num(s.days),
    vibes: typeof s.vibes === "string" ? s.vibes : undefined,
    climate: (["any", "cool", "mild", "warm", "snow"].includes(String(s.climate)) ? s.climate : undefined) as Climate | undefined,
    month: num(s.month),
    transport: (["train", "bus", "car", "flight", "any"].includes(String(s.transport)) ? s.transport : undefined) as Transport | undefined,
    group: (["solo", "couple", "family", "friends"].includes(String(s.group)) ? s.group : undefined) as Group | undefined,
    live: s.live === true || s.live === "true" ? true : undefined,
    run: s.run === true || s.run === "true" ? true : undefined,
  };
}

export function toPreferences(s: PlannerSearch, defaultMonth: number): Preferences | null {
  if (!s.from) return null;
  const city = ORIGIN_CITIES.find((c) => c.name === s.from);
  const lat = s.lat ?? city?.lat, lon = s.lon ?? city?.lon;
  if (lat === undefined || lon === undefined) return null;
  return {
    origin: { name: s.from, lat, lon },
    budget: s.budget ?? 30000, travelers: s.travelers ?? 2, days: s.days ?? 4,
    vibes: (s.vibes ? s.vibes.split(",").filter(Boolean) : []) as Category[],
    climate: s.climate ?? "any", month: s.month ?? defaultMonth,
    transport: s.transport ?? "any", group: s.group ?? (s.travelers === 1 ? "solo" : "couple"), useWeather: !!s.live,
  };
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
