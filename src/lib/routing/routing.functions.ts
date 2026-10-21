import { createServerFn } from "@tanstack/react-start";
import { haversineKm, type RouteInfo } from "@/lib/engine/estimate";

export type { RouteInfo };

interface OsrmRoute { routes?: { distance: number; duration: number }[] }

/** Island destinations have no road route. */
export const ISLANDS = ["andaman", "lakshadweep"];

/**
 * Real road routes from the public OSRM demo server (no API key).
 * Islands return "not-applicable"; destinations beyond 1500 km straight-line
 * are skipped (flying is the practical option) and marked "unavailable".
 * Any OSRM failure returns "unavailable" — never a fabricated distance.
 */
export const fetchRoutes = createServerFn({ method: "POST" })
  .inputValidator((d: { origin: { lat: number; lon: number }; dests: { id: string; lat: number; lon: number }[] }) => d)
  .handler(async ({ data }) => {
    const results: Record<string, RouteInfo> = {};
    const todo = data.dests.filter((x) => {
      if (ISLANDS.includes(x.id)) { results[x.id] = { km: 0, hours: 0, source: "not-applicable" }; return false; }
      if (haversineKm(data.origin, x) > 1500) { results[x.id] = { km: 0, hours: 0, source: "unavailable" }; return false; }
      return true;
    }).slice(0, 40);
    // small batches to be polite to the public OSRM server
    for (let i = 0; i < todo.length; i += 6) {
      await Promise.all(todo.slice(i, i + 6).map(async (x) => {
        try {
          const u = `https://router.project-osrm.org/route/v1/driving/${data.origin.lon},${data.origin.lat};${x.lon},${x.lat}?overview=false`;
          const r = await fetch(u, { headers: { "User-Agent": "YatraAI/1.0" } });
          if (!r.ok) { results[x.id] = { km: 0, hours: 0, source: "unavailable" }; return; }
          const j = (await r.json()) as OsrmRoute;
          const route = j.routes?.[0];
          results[x.id] = route
            ? { km: Math.round(route.distance / 1000), hours: +(route.duration / 3600).toFixed(1), source: "osrm" }
            : { km: 0, hours: 0, source: "unavailable" };
        } catch {
          results[x.id] = { km: 0, hours: 0, source: "unavailable" };
        }
      }));
    }
    return { results };
  });
