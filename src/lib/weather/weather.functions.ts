import { createServerFn } from "@tanstack/react-start";

export interface LiveWeather { temp: number; feelsLike: number; condition: string; humidity: number }

/**
 * Live weather provider (OpenWeatherMap "current weather").
 * Set the secret WEATHER_API_KEY to enable. Without it, returns { live: false }
 * and the UI falls back to the clearly-labelled demo model.
 */
export const fetchLiveWeather = createServerFn({ method: "POST" })
  .inputValidator((d: { points: { id: string; lat: number; lon: number }[] }) => d)
  .handler(async ({ data }) => {
    const key = process.env.WEATHER_API_KEY;
    const results: Record<string, LiveWeather> = {};
    if (!key) return { live: false, results };
    await Promise.all(
      data.points.slice(0, 60).map(async (p) => {
        try {
          const r = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${p.lat}&lon=${p.lon}&units=metric&appid=${key}`,
          );
          if (!r.ok) return;
          const j = (await r.json()) as {
            main: { temp: number; feels_like: number; humidity: number };
            weather: { main: string }[];
          };
          results[p.id] = {
            temp: Math.round(j.main.temp),
            feelsLike: Math.round(j.main.feels_like),
            condition: j.weather[0]?.main ?? "Clear",
            humidity: j.main.humidity,
          };
        } catch {
          /* ignore single failures; demo fallback used */
        }
      }),
    );
    return { live: Object.keys(results).length > 0, results };
  });
