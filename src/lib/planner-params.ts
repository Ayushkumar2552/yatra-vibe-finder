import { CATEGORY_META, ORIGIN_CITIES, type Category } from "@/data/destinations";
import type { Climate, Group, Preferences } from "@/lib/engine/recommend";
import type { Transport } from "@/lib/engine/estimate";

export interface PlannerSearch {
  travelDate?: string; from?: string; lat?: number; lon?: number; budget?: number; travelers?: number; days?: number;
  vibes?: string; climate?: Climate; month?: number; transport?: Transport; group?: Group; live?: boolean; run?: boolean;
}

const num = (v: unknown) => (v === undefined || v === "" || !Number.isFinite(Number(v)) ? undefined : Number(v));

export function validatePlannerSearch(s: Record<string, unknown>): PlannerSearch {
  return {
    travelDate: typeof s.travelDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s.travelDate) && Number.isFinite(Date.parse(s.travelDate)) && new Date(s.travelDate).toISOString().slice(0, 10) === s.travelDate ? s.travelDate : undefined,
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
  if (lat === undefined || lon === undefined || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  if (s.budget !== undefined && (!Number.isFinite(s.budget) || s.budget < 2000)) return null;
  if (s.travelers !== undefined && (!Number.isInteger(s.travelers) || s.travelers < 1 || s.travelers > 20)) return null;
  if (s.days !== undefined && (!Number.isInteger(s.days) || s.days < 1 || s.days > 21)) return null;
  if (s.month !== undefined && (!Number.isInteger(s.month) || s.month < 1 || s.month > 12)) return null;
  if (s.travelDate && (!/^\d{4}-\d{2}-\d{2}$/.test(s.travelDate) || !Number.isFinite(Date.parse(s.travelDate)))) return null;
  return {
    origin: { name: s.from, lat, lon },
    budget: s.budget ?? 30000, travelers: s.travelers ?? 2, days: s.days ?? 4,
    vibes: [...new Set(s.vibes ? s.vibes.split(",").filter(v => Object.prototype.hasOwnProperty.call(CATEGORY_META, v)) : [])] as Category[],
    climate: s.climate ?? "any", month: s.travelDate ? Number(s.travelDate.slice(5, 7)) : s.month ?? defaultMonth, travelDate: s.travelDate,
    transport: s.transport ?? "any", group: s.group ?? (s.travelers === 1 ? "solo" : "couple"), useWeather: !!s.live,
  };
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
