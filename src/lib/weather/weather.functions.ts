import { createServerFn } from "@tanstack/react-start";
import { UNAVAILABLE_WEATHER, wmoCondition, type WeatherNow } from "./types";

export interface WeatherPoint { id: string; lat: number; lon: number }

interface OpenMeteoCurrent {
  current?: {
    temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number;
    precipitation: number; weather_code: number; wind_speed_10m: number; time: string;
  };
}
interface OpenMeteoDaily {
  daily?: {
    time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[];
    precipitation_sum: number[]; wind_speed_10m_max: number[];
  };
}

const MAX_FORECAST_DAYS = 16;

async function fetchCurrent(lat: number, lon: number): Promise<WeatherNow | null> {
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`;
  const r = await fetch(u);
  if (!r.ok) return null;
  const j = (await r.json()) as OpenMeteoCurrent;
  const c = j.current;
  if (!c) return null;
  return {
    temp: Math.round(c.temperature_2m), feelsLike: Math.round(c.apparent_temperature),
    condition: wmoCondition(c.weather_code), humidity: c.relative_humidity_2m,
    precipitation: c.precipitation, wind: Math.round(c.wind_speed_10m),
    updatedAt: c.time, source: "live",
  };
}

async function fetchForecast(lat: number, lon: number, date: string): Promise<WeatherNow | null> {
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
    `&start_date=${date}&end_date=${date}&timezone=auto`;
  const r = await fetch(u);
  if (!r.ok) return null;
  const j = (await r.json()) as OpenMeteoDaily;
  const d = j.daily;
  if (!d || !d.time.length) return null;
  const hi = d.temperature_2m_max[0], lo = d.temperature_2m_min[0];
  return {
    temp: Math.round((hi + lo) / 2), feelsLike: Math.round((hi + lo) / 2),
    condition: wmoCondition(d.weather_code[0]), humidity: 0,
    precipitation: d.precipitation_sum[0], wind: Math.round(d.wind_speed_10m_max[0]),
    updatedAt: d.time[0], source: "forecast",
  };
}

/**
 * Real weather from Open-Meteo (no API key required).
 * - No date (or today): current conditions, source "live".
 * - Date within the 16-day forecast range: daily forecast, source "forecast".
 * - Date beyond the range or any failure: source "unavailable" — never fabricated.
 */
export const fetchLiveWeather = createServerFn({ method: "POST" })
  .inputValidator((d: { points: WeatherPoint[]; date?: string }) => d)
  .handler(async ({ data }) => {
    const results: Record<string, WeatherNow> = {};
    const today = new Date().toISOString().slice(0, 10);
    let mode: "current" | "forecast" | "out-of-range" = "current";
    if (data.date && data.date > today) {
      const daysOut = (Date.parse(data.date) - Date.parse(today)) / 86400000;
      mode = daysOut <= MAX_FORECAST_DAYS ? "forecast" : "out-of-range";
    }
    if (mode === "out-of-range") {
      for (const p of data.points) results[p.id] = { ...UNAVAILABLE_WEATHER };
      return { live: false, results };
    }
    await Promise.all(
      data.points.slice(0, 60).map(async (p) => {
        try {
          const w = mode === "forecast" ? await fetchForecast(p.lat, p.lon, data.date!) : await fetchCurrent(p.lat, p.lon);
          results[p.id] = w ?? { ...UNAVAILABLE_WEATHER };
        } catch {
          results[p.id] = { ...UNAVAILABLE_WEATHER };
        }
      }),
    );
    return { live: Object.values(results).some((w) => w.source !== "unavailable"), results };
  });
