import type { Destination } from "@/data/destinations";

export type Transport = "train" | "bus" | "car" | "flight" | "any";
export type Tier = "budget" | "mid" | "luxury";

/** Real road route from OSRM, or an explicit non-applicable/unavailable state. */
export interface RouteInfo {
  km: number; // one-way road distance
  hours: number; // one-way driving duration
  source: "osrm" | "unavailable" | "not-applicable";
}

export const haversineKm = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const R = 6371, toR = (x: number) => (x * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat), dLon = toR(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Straight line × 1.3 — internal heuristic ONLY, never labelled as road distance in the UI. */
export const travelKm = (o: { lat: number; lon: number }, d: Destination) => Math.round(haversineKm(o, d) * 1.3);
const ISLANDS = ["andaman", "lakshadweep"];
export const isIsland = (d: Destination) => ISLANDS.includes(d.id);

export function effectiveTransport(t: Transport, km: number, dest: Destination): Exclude<Transport, "any"> {
  if (isIsland(dest)) return "flight";
  if (t !== "any") return t;
  return km > 1200 ? "flight" : km > 350 ? "train" : "car";
}

/** One-way travel hours, demo heuristic. */
export function travelHours(km: number, mode: Exclude<Transport, "any">) {
  const speed = { train: 55, bus: 45, car: 55, flight: 600 }[mode];
  return +(km / speed + (mode === "flight" ? 3 : 0)).toFixed(1);
}

/** Round-trip intercity cost for the whole group (INR, ESTIMATED — no live fare provider). */
export function intercityCost(km: number, mode: Exclude<Transport, "any">, travelers: number) {
  if (km < 20) return 0;
  const perPerson = { train: 1.1 * km, bus: 1.4 * km, flight: 2500 + 3.2 * km, car: 0 }[mode];
  const car = mode === "car" ? 9 * km * Math.ceil(travelers / 4) : 0;
  return Math.round((perPerson * travelers + car) * 2);
}

export interface Breakdown {
  stay: number; food: number; local: number; activities: number; intercity: number; total: number;
  tier: Tier; mode: Exclude<Transport, "any">; km: number; hours: number;
  /** "route" = real OSRM road distance; "estimate" = internal heuristic; "not-applicable" = island (air/ferry). */
  intercitySource: "route" | "estimate" | "not-applicable";
}

const mid = (r: [number, number]) => (r[0] + r[1]) / 2;

/**
 * Estimated trip cost. Stay/food/local/activities come from destination-specific
 * ranges (ESTIMATED). Distance/duration use the real OSRM route when provided.
 */
export function estimate(dest: Destination, o: { lat: number; lon: number }, travelers: number, days: number, transport: Transport, tier: Tier, route?: RouteInfo): Breakdown {
  const island = isIsland(dest);
  const heuristicKm = travelKm(o, dest);
  const mode = effectiveTransport(transport, route?.source === "osrm" ? route.km : heuristicKm, dest);
  const km = route?.source === "osrm" ? route.km : heuristicKm;
  const hours = route?.source === "osrm" ? route.hours : travelHours(km, mode);
  const intercitySource: Breakdown["intercitySource"] = island ? "not-applicable" : route?.source === "osrm" ? "route" : "estimate";

  const food = Math.round(mid(dest.costs.food) * travelers * days);
  const local = Math.round(mid(dest.costs.local) * travelers * days);
  const activities = Math.round(mid(dest.costs.activities) * travelers * days);
  // stay = remainder of the daily tier after the known components
  const dailyStay = Math.max(300, dest.daily[tier] - mid(dest.costs.food) - mid(dest.costs.local) - mid(dest.costs.activities));
  // couples/groups share rooms: stay scales sub-linearly
  const share = travelers > 1 ? 0.75 : 1;
  const stay = Math.round(dailyStay * travelers * days * share);
  const intercity = intercityCost(km, mode, travelers);
  return { stay, food, local, activities, intercity, total: stay + food + local + activities + intercity, tier, mode, km, hours, intercitySource };
}

/** Picks the most comfortable tier that fits the budget (or "budget" if none fit). */
export function bestFit(dest: Destination, o: { lat: number; lon: number }, travelers: number, days: number, transport: Transport, budget: number, route?: RouteInfo) {
  for (const t of ["luxury", "mid"] as Tier[]) {
    const e = estimate(dest, o, travelers, days, transport, t, route);
    if (e.total <= budget) return e;
  }
  return estimate(dest, o, travelers, days, transport, "budget", route);
}

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
