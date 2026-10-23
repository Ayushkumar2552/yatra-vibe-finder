/**
 * YatraAI recommendation engine — transparent, rule-based (NOT generative AI).
 *
 * Step 1  FACTOR SCORING: seven weighted factors, each 0..1.
 *           match_base = Σ weight_i × factor_i  (weights renormalised when a
 *           factor has no real data, e.g. weather unavailable)
 * Step 2  FORWARD-CHAINING RULES: a working memory of facts is built from the
 *           inputs. IF/THEN rules fire repeatedly until no new fact is added.
 *           Each fired rule may add a new fact and a ± adjustment.
 * Step 3  Rank feasible options first by weighted fit; rules explain, not double-count.
 */
import type { Category, Destination } from "@/data/destinations";
import { UNAVAILABLE_WEATHER } from "@/lib/weather/types";
import { weatherMode } from "@/lib/weather/provider";
import type { WeatherNow } from "@/lib/weather/types";
import { bestFit, inr, isIsland, haversineKm, type Breakdown, type RouteInfo, type Transport } from "./estimate";

export type Climate = "any" | "cool" | "mild" | "warm" | "snow";
export type Group = "solo" | "couple" | "family" | "friends";

export interface Preferences {
  origin: { name: string; lat: number; lon: number };
  budget: number; travelers: number; days: number;
  vibes: Category[]; climate: Climate; month: number;
  transport: Transport; group: Group; useWeather: boolean; travelDate?: string;
}

export const WEIGHTS = { budget: 0.25, vibe: 0.2, weather: 0.1, climate: 0.1, season: 0.1, distance: 0.15, duration: 0.05, group: 0.05 } as const;
export type Factor = keyof typeof WEIGHTS;
export const FACTOR_LABEL: Record<Factor, string> = {
  climate: "Climate preference", budget: "Budget fit", vibe: "Vibe match", weather: "Weather suitability", season: "Seasonality",
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
  if (!w || w.source === "unavailable") return 0;
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
  description: string; cautions: string[]; eligible: boolean; constraints: string[]; effectiveWeights: Record<Factor, number>; budgetRange: [number, number]; planningTotal: number; weatherContext: string; reasons: string[]; route?: RouteInfo; budgetConfidence: "medium" | "low";
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
  { id: "R4", adds: "monsoon_beach", effect: -10, text: "IF rainy AND beach THEN rainy_beach: check outdoor conditions (−10)", when: (f) => f.p.useWeather && f.w.source !== "unavailable" && (f.w.condition === "Rain" || f.w.condition === "Thunderstorm" || f.w.precipitation > 10) && f.d.categories.includes("beach") },
  { id: "R5", adds: "snowbound", effect: -12, text: "IF alpine AND Dec–Feb AND no adventure/snow preference THEN snowbound (−12)", when: (f) => f.d.zone === "alpine" && [12, 1, 2].includes(f.p.month) && !f.p.vibes.includes("adventure") && f.p.climate !== "snow" },
  { id: "R6", adds: "long_haul", effect: -8, text: "IF one-way travel > days × 4h THEN long_haul (−8)", when: (f) => f.e.hours > f.p.days * 4 },
  { id: "R7", adds: "suggest_flight", effect: 0, text: "IF long_haul AND not flying THEN suggest_flight (info)", when: (f) => f.set.has("long_haul") && f.e.mode !== "flight" },
  { id: "R8", adds: "weekend_friendly", effect: 5, text: "IF distance < 350 km AND days ≤ 3 THEN weekend_friendly (+5)", when: (f) => f.e.km < 350 && f.p.days <= 3 },
  { id: "R9", adds: "altitude_caution", effect: -5, text: "IF family AND high altitude THEN altitude_caution (−5)", when: (f) => f.p.group === "family" && (f.d.zone === "alpine" || (f.d.altitude ?? 0) > 2500) },
  { id: "R10", adds: "strong_vibe", effect: 4, text: "IF ≥ 2 vibes matched THEN strong_vibe (+4)", when: (f) => f.vibeHits >= 2 },
  { id: "R11", adds: "great_value_timing", effect: 2, text: "IF comfortable_budget AND peak_season THEN great_value_timing (+2)", when: (f) => f.set.has("comfortable_budget") && f.set.has("peak_season") },
  { id: "R12", adds: "heat_warning", effect: -12, text: "IF desert/plains AND Apr–Jun THEN heat_warning (−12)", when: (f) => (f.d.zone === "desert" || f.d.zone === "plains") && [4, 5, 6].includes(f.p.month) },
  { id: "R13", adds: "climate_match", effect: 3, text: "IF weather suitability ≥ 80 THEN climate_match (+3)", when: (f) => f.p.useWeather && f.w.source !== "unavailable" && f.suit >= 80 },
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
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const requested = p.travelDate ?? today;
  const readingDate = w.updatedAt.slice(0, 10);
  const applicable = readingDate === requested && (p.travelDate
    ? weatherMode(p.travelDate) === (w.source === "forecast" ? "forecast" : "current")
    : w.source === "live" && p.month === Number(today.slice(5, 7)));
  const hasWeather = p.useWeather && applicable && w.source !== "unavailable";
  const scoredWeather = hasWeather ? w : UNAVAILABLE_WEATHER;
  const planningTotal = Math.round(e.total * 1.15);
  const budgetRange: [number, number] = [Math.round(e.total * 0.85), Math.round(e.total * 1.25)];
  const suit = hasWeather ? weatherSuitability(w, p.climate) : null;
  const near = (m: number) => d.bestMonths.includes(((m + 10) % 12) + 1) || d.bestMonths.includes((m % 12) + 1);

  const factors: Record<Factor, number | null> = {
    budget: Math.min(1, (p.budget / Math.max(1, planningTotal)) ** 2),
    vibe: p.vibes.length === 0 ? null : vibeHits / p.vibes.length,
    climate: climateFit(d, p),
    weather: hasWeather ? suit! / 100 : null, // no real reading → excluded, weight redistributed
    season: d.bestMonths.includes(p.month) ? 1 : near(p.month) ? 0.6 : 0.2,
    distance: e.hours <= p.days * 2.5 ? 1 : Math.max(0, 1 - (e.hours - p.days * 2.5) / (p.days * 6)),
    duration: p.days < d.days[0] ? p.days / d.days[0] : p.days > d.days[1] + 2 ? 0.8 : 1,
    group: groupFit(p.group, d),
  };
  const avail = (Object.keys(WEIGHTS) as Factor[]).filter((k) => factors[k] !== null);
  const wSum = avail.reduce((s, k) => s + WEIGHTS[k], 0);
  const base = avail.reduce((s, k) => s + (WEIGHTS[k] / wSum) * factors[k]!, 0);
  const facts: Facts = { set: new Set(), p, d, e, w: scoredWeather, suit: suit ?? 50, budgetRatio, vibeHits };
  const rules = forwardChain(facts);
  // Weighted factors already account for budget/season/vibes. Do not add the
  // same evidence again through rule bonuses, which saturated scores at 99%.
  const match = Math.max(0, Math.min(100, Math.round(base * 100)));
  const effectiveWeights = Object.fromEntries((Object.keys(WEIGHTS) as Factor[]).map(k => [k, factors[k] === null ? 0 : WEIGHTS[k] / wSum])) as Record<Factor, number>;
  const constraints: string[] = [];
  if (e.total > p.budget) constraints.push(`Estimated total exceeds your budget by ${inr(e.total - p.budget)}.`);
  if (isIsland(d) && !['any', 'flight'].includes(p.transport)) constraints.push(`${p.transport} alone cannot reach this island; air/sea connections are required.`);
  if (p.vibes.length && vibeHits === 0) constraints.push('Does not match any of your selected interests.');
  if (e.hours * 2 >= p.days * 24) constraints.push('Estimated return travel consumes the entire trip duration.');
  if (haversineKm(p.origin, d) < 25) constraints.push('Very close to your starting location; better treated as a local outing.');
  const cautions = [...constraints];
  if (planningTotal > p.budget && e.total <= p.budget) cautions.push(`Budget is tight: allow about ${inr(planningTotal)} including a 15% contingency.`);
  if (p.days < d.days[0]) cautions.push(`A short visit: ${d.days[0]}–${d.days[1]} days are suggested for this destination.`);
  if (e.hours * 2 > p.days * 8) cautions.push('Travel takes a large share of this trip; consider more days or a faster mode.');
  if (!d.bestMonths.includes(p.month)) cautions.push('Outside the listed best months; check local conditions before booking.');
  if (facts.set.has("altitude_caution")) cautions.push("High-altitude destination: allow time to acclimatise and plan a comfortable pace.");
  if (p.climate === 'snow') cautions.push('Snow is never guaranteed; verify local forecasts and access near departure.');
  if (hasWeather && ['Rain', 'Thunderstorm', 'Snow'].includes(w.condition)) cautions.push(`${w.source === 'forecast' ? 'Forecast' : 'Current conditions'}: ${w.condition}; outdoor plans may need changes.`);
  if (p.transport !== 'any') cautions.push(`${p.transport} fares, services and connections are estimates, not verified bookings.`);
  const weatherContext = !p.useWeather ? 'Weather scoring is off.' : hasWeather ? (w.source === 'forecast' ? 'Departure-day forecast included; not a forecast for the whole stay.' : 'Current conditions included; they may change before your trip.') : 'No applicable trip-date weather: weather is excluded from the score.';
  const description = describeDestination(d);

  const reasons: string[] = [];
  if (vibeHits) reasons.push(`Matches ${vibeHits} of ${p.vibes.length} interests: ${p.vibes.filter((v) => d.categories.includes(v)).join(" & ")}.`);
  if (budgetRatio >= 1) reasons.push(`Estimated ${inr(e.total)} for all ${p.travelers} travellers over ${p.days} days, leaving ${inr(p.budget - e.total)} of your budget (${e.tier} stays).`);
  else reasons.push(`About ${Math.round((1 / budgetRatio - 1) * 100)}% over budget even at budget tier`);
  if (factors.season === 1) reasons.push("Your selected month is among its listed best months.");
  if (suit !== null && suit >= 75) reasons.push(`${w.source === "forecast" ? "Departure-day forecast" : "Current weather"}: ${w.condition}, about ${w.temp}°C; favourable for your climate preference.`);
  if (facts.set.has("weekend_friendly")) reasons.push(`Only ~${e.km} km away — easy short trip`);
  if (facts.set.has("suggest_flight")) reasons.push("Far for a short trip — consider flying");
  if (factors.climate !== null && factors.climate >= 0.8) reasons.push(`Its climate zone is a strong seasonal heuristic match for your ${p.climate} preference.`);
  if (p.days >= d.days[0] && p.days <= d.days[1]) reasons.push(`Your ${p.days}-day plan fits its suggested ${d.days[0]}–${d.days[1]} day visit.`);
  if (factors.group === 1) reasons.push(`Its ${d.categories.slice(0, 2).join(' and ')} activities suit a ${p.group} trip.`);

  return { description, cautions, constraints, eligible: constraints.length === 0, effectiveWeights, budgetRange, planningTotal, weatherContext, dest: d, match, factors, rules: rules.map(r => ({ ...r, effect: 0, text: r.text.replace(/\s*\((?:[+−-]\d+|info)\)/g, "") })), estimate: e, weather: w, suitability: suit, reasons, route, budgetConfidence: e.intercitySource === "route" ? "medium" : "low" };
}

export function recommend(dests: Destination[], p: Preferences, weather: Record<string, WeatherNow>, routes?: Record<string, RouteInfo>) {
  return dests.map((d) => scoreDestination(d, p, weather[d.id] ?? UNAVAILABLE_WEATHER, routes?.[d.id])).sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.match - a.match || a.estimate.total - b.estimate.total || a.dest.id.localeCompare(b.dest.id));
}

/** Qualitative zone/season heuristic, not a fabricated temperature forecast. */
export function climateFit(d: Destination, p: Preferences): number | null {
  if (p.climate === 'any') return null;
  const winter = [11, 12, 1, 2].includes(p.month);
  const hill = ['hill', 'southhill', 'alpine', 'northeast'].includes(d.zone);
  if (p.climate === 'snow') return d.zone === 'alpine' && winter ? 0.9 : d.zone === 'hill' && winter ? 0.5 : 0.05;
  if (p.climate === 'cool') return hill ? 0.9 : winter && ['plains', 'desert'].includes(d.zone) ? 0.7 : 0.2;
  if (p.climate === 'warm') return d.zone === 'coastal' ? 0.95 : !hill && !winter ? 0.8 : 0.3;
  return d.zone === 'southhill' ? 0.9 : hill && !winter ? 0.8 : !hill && winter ? 0.8 : 0.4;
}
export function describeDestination(d: Destination): string {
  const character: Record<string, string> = { coastal: 'a coastal escape', hill: 'a hill destination', southhill: 'a southern hill retreat', alpine: 'a high-mountain destination', plains: 'a plains destination', desert: 'a desert-region getaway', northeast: 'a northeastern getaway' };
  return `${d.name}, ${d.state}, is ${character[d.zone] ?? 'an Indian destination'} known in this guide for ${d.highlights.slice(0, 3).join(', ')}. Build your visit around ${d.activities.slice(0, 3).join(', ')}. Allow roughly ${d.days[0]}–${d.days[1]} days to explore.`;
}
