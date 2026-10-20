import type { Destination } from "@/data/destinations";

export type Transport = "train" | "bus" | "car" | "flight" | "any";
export type Tier = "budget" | "mid" | "luxury";

export const haversineKm = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const R = 6371, toR = (x: number) => (x * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat), dLon = toR(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Road/rail distance ≈ straight line × 1.3 (demo heuristic). Island destinations need flight/ferry. */
export const travelKm = (o: { lat: number; lon: number }, d: Destination) => Math.round(haversineKm(o, d) * 1.3);
const ISLANDS = ["andaman", "lakshadweep"];

export function effectiveTransport(t: Transport, km: number, dest: Destination): Exclude<Transport, "any"> {
  if (ISLANDS.includes(dest.id)) return "flight";
  if (t !== "any") return t;
  return km > 1200 ? "flight" : km > 350 ? "train" : "car";
}

/** One-way travel hours, demo heuristic. */
export function travelHours(km: number, mode: Exclude<Transport, "any">) {
  const speed = { train: 55, bus: 45, car: 55, flight: 600 }[mode];
  return +(km / speed + (mode === "flight" ? 3 : 0)).toFixed(1);
}

/** Round-trip intercity cost for the whole group (INR, estimated). */
export function intercityCost(km: number, mode: Exclude<Transport, "any">, travelers: number) {
  if (km < 20) return 0;
  const perPerson = { train: 1.1 * km, bus: 1.4 * km, flight: 2500 + 3.2 * km, car: 0 }[mode];
  const car = mode === "car" ? 9 * km * Math.ceil(travelers / 4) : 0;
  return Math.round((perPerson * travelers + car) * 2);
}

export interface Breakdown { stay: number; food: number; local: number; activities: number; intercity: number; total: number; tier: Tier; mode: Exclude<Transport, "any">; km: number; hours: number }

export function estimate(dest: Destination, o: { lat: number; lon: number }, travelers: number, days: number, transport: Transport, tier: Tier): Breakdown {
  const km = travelKm(o, dest);
  const mode = effectiveTransport(transport, km, dest);
  const daily = dest.daily[tier] * travelers * days;
  // couples/groups share rooms: stay scales sub-linearly
  const share = travelers > 1 ? 0.75 : 1;
  const stay = Math.round(daily * 0.45 * share);
  const food = Math.round(daily * 0.25);
  const local = Math.round(daily * 0.15);
  const activities = Math.round(daily * 0.15);
  const intercity = intercityCost(km, mode, travelers);
  return { stay, food, local, activities, intercity, total: stay + food + local + activities + intercity, tier, mode, km, hours: travelHours(km, mode) };
}

/** Picks the most comfortable tier that fits the budget (or "budget" if none fit). */
export function bestFit(dest: Destination, o: { lat: number; lon: number }, travelers: number, days: number, transport: Transport, budget: number) {
  for (const t of ["luxury", "mid"] as Tier[]) {
    const e = estimate(dest, o, travelers, days, transport, t);
    if (e.total <= budget) return e;
  }
  return estimate(dest, o, travelers, days, transport, "budget");
}

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
