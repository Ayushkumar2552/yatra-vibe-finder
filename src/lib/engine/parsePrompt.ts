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
  const amount = '(\\d[\\d,]*(?:\\.\\d+)?)\\s*(lakh|lac|k|l)?\\b';
  const explicit = t.match(new RegExp('(?:under|below|budget(?: of)?|₹|rs\\.?|inr)\\s*₹?\\s*' + amount));
  const scaled = t.match(/\b(\d+(?:\.\d+)?)\s*(lakh|lac|k)\b/);
  const m = explicit ?? scaled;
  if (m) {
    const n = Number(m[1].replaceAll(',', ''));
    out.budget = n * (m[2] === 'k' ? 1000 : ['l', 'lac', 'lakh'].includes(m[2]) ? 100000 : 1);
  }
  const dm = t.match(/(\d+)\s?-?\s?(day|night)/);
  if (dm) out.days = parseInt(dm[1]) + (dm[2] === "night" ? 1 : 0);
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
