/**
 * Weather data types. Every reading is one of:
 * - "live": real current conditions from Open-Meteo
 * - "forecast": real forecast from Open-Meteo for a future date (≤16 days out)
 * - "unavailable": no real data — UI must say so, never invent numbers
 */
export interface WeatherNow {
  temp: number;
  lowTemp?: number; // Forecast minimum when available.
  feelsLike: number;
  condition: string; // Clear, Rain, Snow, Clouds, Fog, Drizzle, Thunderstorm
  humidity: number;
  precipitation: number; // mm
  wind: number; // km/h
  updatedAt: string; // ISO timestamp from the provider
  source: "live" | "forecast" | "unavailable";
}

export const UNAVAILABLE_WEATHER: WeatherNow = {
  temp: 0, feelsLike: 0, condition: "Unavailable", humidity: 0,
  precipitation: 0, wind: 0, updatedAt: "", source: "unavailable",
};

/** WMO weather interpretation codes → simple condition labels. */
export function wmoCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Clouds";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "Rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "Snow";
  if (code >= 95) return "Thunderstorm";
  return "Clouds";
}
