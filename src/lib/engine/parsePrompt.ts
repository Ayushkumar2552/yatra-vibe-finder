import { ORIGIN_CITIES, type Category } from "@/data/destinations";
import type { Climate } from "./recommend";

/** Tiny keyword-rule parser that turns a typed request into planner preferences (no LLM). */
export function parsePrompt(text: string) {
  const t = text.toLowerCase();
  const out: { vibes?: string; budget?: number; days?: number; from?: string; climate?: Climate; travelers?: number } = {};
  const map: [RegExp, Category][] = [
    [/beach|sea|coast|island/, "beach"], [/mountain|hill|himalaya|snow/, "mountain"],
    [/heritage|history|fort|palace/, "heritage"], [/spiritual|temple|peace|meditat/, "spiritual"],
    [/desert|dune/, "desert"], [/nature|forest|waterfall|green/, "nature"],
    [/adventure|trek|raft/, "adventure"], [/road ?trip|drive/, "roadtrip"], [/relax|chill|calm|peaceful/, "relax"],
    [/wildlife|safari|tiger/, "wildlife"],
  ];
  const vibes = map.filter(([r]) => r.test(t)).map(([, c]) => c);
  if (vibes.length) out.vibes = [...new Set(vibes)].join(",");
  const b = t.match(/₹?\s?(\d+(?:\.\d+)?)\s?(k|000|l|lakh)?/);
  const bm = t.match(/(?:under|below|budget|₹)\s*₹?\s?(\d+(?:\.\d+)?)\s?(k|l|lakh)?/);
  const m = bm ?? (b && b[2] ? b : null);
  if (m) {
    const n = parseFloat(m[1]);
    out.budget = m[2] === "k" ? n * 1000 : m[2] === "l" || m[2] === "lakh" ? n * 100000 : n < 1000 ? n * 1000 : n;
  }
  const dm = t.match(/(\d+)\s?-?\s?(day|night)/);
  if (dm) out.days = parseInt(dm[1]);
  else if (/weekend/.test(t)) out.days = 2;
  else if (/week/.test(t)) out.days = 7;
  const city = ORIGIN_CITIES.find((c) => t.includes(c.name.toLowerCase()));
  if (city) out.from = city.name;
  if (/cool|cold|chill/.test(t)) out.climate = "cool";
  if (/snow/.test(t)) out.climate = "snow";
  if (/warm|sun/.test(t)) out.climate = "warm";
  if (/couple|honeymoon/.test(t)) out.travelers = 2;
  return out;
}
