import type { Destination } from "@/data/destinations";

export interface DayPlan { day: number; title: string; items: string[] }

/**
 * Rule-based itinerary: Day 1 = arrival + a light activity, middle days take
 * curated activities round-robin (morning / afternoon), last day = departure.
 */
export function buildItinerary(d: Destination, days: number): DayPlan[] {
  const acts = d.activities;
  const plan: DayPlan[] = [];
  let i = 0;
  const next = () => acts[i++ % acts.length];
  for (let day = 1; day <= days; day++) {
    if (day === 1) plan.push({ day, title: "Arrive & settle in", items: ["Check in and rest", next(), `Dinner near ${d.highlights[0]}`] });
    else if (day === days && days > 1) plan.push({ day, title: "Slow morning & depart", items: [`Last look at ${d.highlights[d.highlights.length - 1]}`, "Local souvenir shopping", "Head home"] });
    else plan.push({ day, title: day === 2 ? "Signature experiences" : "Explore deeper", items: [`Morning: ${next()}`, `Afternoon: ${next()}`, "Evening: free time / local food"] });
  }
  return plan;
}
