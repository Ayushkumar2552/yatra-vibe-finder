import { useQuery } from "@tanstack/react-query";
import type { Destination } from "@/data/destinations";
import { fetchResilientWeather } from "./provider";
import { fetchLiveWeather } from "./weather.functions";
import { UNAVAILABLE_WEATHER, type WeatherNow } from "./types";

/**
 * Real weather for each destination via Open-Meteo.
 * No mock fallback: when the API fails or the date is out of forecast range,
 * entries are source "unavailable" and the UI must label them as such.
 * Cached 12 minutes per point set + date.
 */
export function useWeather(dests: Destination[], date?: string) {
  const q = useQuery({
    queryKey: ["weather", dests.map((d) => d.id).join(","), date ?? "now"],
    queryFn: () => {
      const points = dests.map(d => ({ id: d.id, lat: d.lat, lon: d.lon }));
      return fetchResilientWeather(points, date, () => fetchLiveWeather({ data: { points, date } }));
    },
    staleTime: 12 * 60 * 1000,
    refetchInterval: 12 * 60 * 1000,
    enabled: dests.length > 0,
    retry: 1,
    retryDelay: 2000,
  });
  const map: Record<string, WeatherNow> = {};
  for (const d of dests) map[d.id] = q.data?.results[d.id] ?? { ...UNAVAILABLE_WEATHER };
  const anyLive = !!q.data?.live;
  return { weather: map, isLive: anyLive, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch, isFetching: q.isFetching, error: q.error };
}
