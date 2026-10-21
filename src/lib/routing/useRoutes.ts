import { useQuery } from "@tanstack/react-query";
import type { Destination } from "@/data/destinations";
import type { RouteInfo } from "@/lib/engine/estimate";
import { fetchRoutes } from "./routing.functions";

/**
 * Real OSRM road routes from an origin to a set of destinations.
 * Cached 30 minutes per origin+destination set. Missing entries mean the
 * route is unavailable or not applicable — never fabricated.
 */
export function useRoutes(origin: { lat: number; lon: number } | null, dests: Destination[]) {
  const q = useQuery({
    queryKey: ["routes", origin ? `${origin.lat},${origin.lon}` : "none", dests.map((d) => d.id).join(",")],
    queryFn: () => fetchRoutes({ data: { origin: origin!, dests: dests.map((d) => ({ id: d.id, lat: d.lat, lon: d.lon })) } }),
    enabled: !!origin,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
  const map: Record<string, RouteInfo> = q.data?.results ?? {};
  return { routes: map, isLoading: q.isLoading, isError: q.isError };
}
