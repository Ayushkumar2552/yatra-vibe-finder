/**
 * YatraAI recommendation engine — transparent, rule-based (NOT generative AI).
 *
 * Step 1  FACTOR SCORING: seven weighted factors, each 0..1.
 *           match_base = Σ weight_i × factor_i  (weights renormalised when a
 *           factor has no real data, e.g. weather unavailable)
 * Step 2  FORWARD-CHAINING RULES: a working memory of facts is built from the
 *           inputs. IF/THEN rules fire repeatedly until no new fact is added.
 *           Each fired rule may add a new fact and a ± adjustment.
 * Step 3  FINAL: match% = clamp(base×100 + Σ adjustments, 5, 99), then sort.
 */
import type { Category, Destination } from "@/data/destinations";
import type { WeatherNow } from "@/lib/weather/types";
import { bestFit, type Breakdown, type RouteInfo, type Transport } from "./estimate";

export type Climate = "any" | "cool" | "mild" | "warm" | "snow";
export type Group = "solo" | "couple" | "family" | "friends";

export interface Preferences {
  origin: { name: string; lat: number; lon: number };
  budget: number; travelers: number; days: number;
  vibes: Category[]; climate: Climate; month: number;
  transport: Transport; group: Group; useWeather: boolean;
}

export const WEIGHTS = { budget: 0.25, vibe: 0.2, weather: 0.15, season: 0.15, distance: 0.15, duration: 0.05, group: 0.05 } as const;
export type Factor = keyof typeof WEIGHTS;
export const FACTOR_LABEL: Record<Factor, string> = {
  budget: "Budget fit", vibe: "Vibe match", weather: "Weather suitability", season: "Seasonality",
  distance: "Travel practicality", duration: "Trip length fit", group: "Group fit",
};

const CLIMATE_RANGE: Record<Climate, [number, number]> = {
  any: [15, 29], cool: [4, 20], mild: [16, 28], warm: [24, 34], snow: [-12, 6],
};

/**
 * Weather suitability 0..100, derived ONLY from a real weather response
 * (temperature vs preferred range, precipitation, wind, condition).
 */
export function weatherSuitability(w: WeatherNow, climate: Climate = "any") {
  const [lo, hi] = CLIMATE_RANGE[climate];
  const t = w.feelsLike;
  let s = t < lo ? 100 - (lo - t) * 6 : t > hi ? 100 - (t - hi) * 7 : 100;
  if (w.condition === "Rain" || w.condition === "Thunderstorm") s -= 25;
  if (w.condition === "Drizzle") s -= 10;
  if (w.condition === "Snow" && climate !== "snow") s -= 15;
  if (w.precipitation > 10) s -= 15;
  else if (w.precipitation > 3) s -= 7;
  if (w.wind > 50) s -= 15;
  else if (w.wind > 35) s -= 7;
  return Math.max(0, Math.min(100, Math.round(s)));
}

export interface FiredRule { id: string; text: string; effect: number }
export interface Recommendation {
  dest: Destination; match: number; factors: Record<Factor, number | null>;
  rules: FiredRule[]; estimate: Breakdown; weather: WeatherNow; suitability: number | null;
  reasons: string[]; route?: RouteInfo; budgetConfidence: "medium" | "low";
}

interface Facts {
  set: Set<string>;
  p: Preferences; d: Destination; e: Breakdown; w: WeatherNow; suit: number; budgetRatio: number; vibeHits: number;
}

interface Rule { id: string; text: string; when: (f: Facts) => boolean; adds: string; effect: number }

/** Knowledge base of IF/THEN rules. Order doesn't matter: the engine loops until fixpoint. */
export const RULES: Rule[] = [
  { id: "R1", adds: "comfortable_budget", effect: 3, text: "IF budget ≥ 1.3× estimate THEN comfortable_budget (+3)", when: (f) => f.budgetRatio >= 1.3 },
  { id: "R2", adds: "over_budget", effect: -8, text: "IF estimate exceeds budget THEN over_budget (−8)", when: (f) => f.budgetRatio < 1 },
  { id: "R3", adds: "peak_season", effect: 4, text: "IF travel month ∈ best months THEN peak_season (+4)", when: (f) => f.d.bestMonths.includes(f.p.month) },
  { id: "R4", adds: "monsoon_beach", effect: -10, text: "IF rainy AND beach THEN monsoon_beach: rough seas (−10)", when: (f) => (f.w.condition === "Rain" || f.w.condition === "Thunderstorm" || f.w.precipitation > 10) && f.d.categories.includes("beach") },
  { id: "R5", adds: "snowbound", effect: -12, text: "IF alpine AND Dec–Feb AND no adventure/snow preference THEN snowbound (−12)", when: (f) => f.d.zone === "alpine" && [12, 1, 2].includes(f.p.month) && !f.p.vibes.includes("adventure") && f.p.climate !== "snow" },
  { id: "R6", adds: "long_haul", effect: -8, text: "IF one-way travel > days × 4h THEN long_haul (−8)", when: (f) => f.e.hours > f.p.days * 4 },
  { id: "R7", adds: "suggest_flight", effect: 0, text: "IF long_haul AND not flying THEN suggest_flight (info)", when: (f) => f.set.has("long_haul") && f.e.mode !== "flight" },
  { id: "R8", adds: "weekend_friendly", effect: 5, text: "IF distance < 350 km AND days ≤ 3 THEN weekend_friendly (+5)", when: (f) => f.e.km < 350 && f.p.days <= 3 },
  { id: "R9", adds: "altitude_caution", effect: -5, text: "IF family AND high altitude THEN altitude_caution (−5)", when: (f) => f.p.group === "family" && (f.d.zone === "alpine" || (f.d.altitude ?? 0) > 2500) },
  { id: "R10", adds: "strong_vibe", effect: 4, text: "IF ≥ 2 vibes matched THEN strong_vibe (+4)", when: (f) => f.vibeHits >= 2 },
  { id: "R11", adds: "great_value_timing", effect: 2, text: "IF comfortable_budget AND peak_season THEN great_value_timing (+2)", when: (f) => f.set.has("comfortable_budget") && f.set.has("peak_season") },
  { id: "R12", adds: "heat_warning", effect: -12, text: "IF desert/plains AND Apr–Jun THEN heat_warning (−12)", when: (f) => (f.d.zone === "desert" || f.d.zone === "plains") && [4, 5, 6].includes(f.p.month) },
  { id: "R13", adds: "climate_match", effect: 3, text: "IF weather suitability ≥ 80 THEN climate_match (+3)", when: (f) => f.w.source !== "unavailable" && f.suit >= 80 },
  { id: "R14", adds: "romantic_pick", effect: 3, text: "IF couple AND (beach OR relax) THEN romantic_pick (+3)", when: (f) => f.p.group === "couple" && f.d.categories.some((c) => c === "beach" || c === "relax") },
  { id: "R15", adds: "too_short", effect: -6, text: "IF days < destination minimum THEN too_short (−6)", when: (f) => f.p.days < f.d.days[0] },
];

/** Forward chaining: fire rules whose conditions hold, add facts, repeat until no change. */
export function forwardChain(f: Facts): FiredRule[] {
  const fired: FiredRule[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const r of RULES) {
      if (f.set.has(r.adds)) continue;
      if (r.when(f)) {
        f.set.add(r.adds);
        fired.push({ id: r.id, text: r.text, effect: r.effect });
        changed = true;
      }
    }
  }
  return fired;
}

function groupFit(g: Group, d: Destination) {
  const c = d.categories;
  if (g === "couple" && c.some((x) => x === "beach" || x === "relax")) return 1;
  if (g === "friends" && c.some((x) => x === "adventure" || x === "roadtrip" || x === "beach")) return 1;
  if (g === "solo" && c.some((x) => x === "spiritual" || x === "heritage" || x === "adventure")) return 1;
  if (g === "family" && c.some((x) => x === "heritage" || x === "nature" || x === "relax" || x === "wildlife")) return d.zone === "alpine" ? 0.6 : 1;
  return 0.7;
}

export function scoreDestination(d: Destination, p: Preferences, w: WeatherNow, route?: RouteInfo): Recommendation {
  const e = bestFit(d, p.origin, p.travelers, p.days, p.transport, p.budget, route);
  const budgetRatio = p.budget / Math.max(1, e.total);
  const vibeHits = p.vibes.filter((v) => d.categories.includes(v)).length;
  const hasWeather = w.source !== "unavailable";
  const suit = hasWeather ? weatherSuitability(w, p.climate) : null;
  const near = (m: number) => d.bestMonths.includes(((m + 11) % 12) + 1) || d.bestMonths.includes((m % 12) + 1);

  const factors: Record<Factor, number | null> = {
    budget: budgetRatio >= 1 ? 1 : Math.max(0, budgetRatio ** 2),
    vibe: p.vibes.length === 0 ? 0.6 : Math.min(1, vibeHits / Math.min(2, p.vibes.length)),
    weather: hasWeather ? suit! / 100 : null, // no real reading → excluded, weight redistributed
    season: d.bestMonths.includes(p.month) ? 1 : near(p.month) ? 0.6 : 0.2,
    distance: e.hours <= p.days * 2.5 ? 1 : Math.max(0, 1 - (e.hours - p.days * 2.5) / (p.days * 6)),
    duration: p.days < d.days[0] ? p.days / d.days[0] : p.days > d.days[1] + 2 ? 0.8 : 1,
    group: groupFit(p.group, d),
  };
  const avail = (Object.keys(WEIGHTS) as Factor[]).filter((k) => factors[k] !== null);
  const wSum = avail.reduce((s, k) => s + WEIGHTS[k], 0);
  const base = avail.reduce((s, k) => s + (WEIGHTS[k] / wSum) * factors[k]!, 0);
  const facts: Facts = { set: new Set(), p, d, e, w, suit: suit ?? 50, budgetRatio, vibeHits };
  const rules = forwardChain(facts);
  const adj = rules.reduce((s, r) => s + r.effect, 0);
  const match = Math.max(5, Math.min(99, Math.round(base * 100 + adj)));

  const reasons: string[] = [];
  if (vibeHits) reasons.push(`Matches your ${p.vibes.filter((v) => d.categories.includes(v)).join(" & ")} vibe`);
  if (budgetRatio >= 1) reasons.push(`Fits your budget at a ${e.tier} comfort level`);
  else reasons.push(`About ${Math.round((1 / budgetRatio - 1) * 100)}% over budget even at budget tier`);
  if (factors.season === 1) reasons.push("You're travelling in its best season");
  if (suit !== null && suit >= 75) reasons.push(`Pleasant weather: ~${w.feelsLike}°C feels-like`);
  if (facts.set.has("weekend_friendly")) reasons.push(`Only ~${e.km} km away — easy short trip`);
  if (facts.set.has("suggest_flight")) reasons.push("Far for a short trip — consider flying");
  if (!hasWeather) reasons.push("Live weather unavailable — weather not scored");

  return { dest: d, match, factors, rules, estimate: e, weather: w, suitability: suit, reasons, route, budgetConfidence: e.intercitySource === "route" ? "medium" : "low" };
}

export function recommend(dests: Destination[], p: Preferences, weather: Record<string, WeatherNow>, routes?: Record<string, RouteInfo>) {
  return dests.map((d) => scoreDestination(d, p, weather[d.id], routes?.[d.id])).sort((a, b) => b.match - a.match);
}
