import { useQuery } from "@tanstack/react-query";
import type { Destination } from "@/data/destinations";
import { fetchLiveWeather } from "./weather.functions";
import { mockWeather, type WeatherNow } from "./mock";

/** Returns weather for each destination: live when WEATHER_API_KEY works, otherwise demo. */
export function useWeather(dests: Destination[], month: number) {
  const q = useQuery({
    queryKey: ["weather", dests.map((d) => d.id).join(",")],
    queryFn: () => fetchLiveWeather({ data: { points: dests.map((d) => ({ id: d.id, lat: d.lat, lon: d.lon })) } }),
    staleTime: 10 * 60 * 1000,
    retry: 0,
  });
  const map: Record<string, WeatherNow> = {};
  for (const d of dests) {
    const live = q.data?.results[d.id];
    map[d.id] = live ? { ...live, source: "live" } : mockWeather(d, month);
  }
  return { weather: map, isLive: !!q.data?.live, isLoading: q.isLoading, isError: q.isError };
}
