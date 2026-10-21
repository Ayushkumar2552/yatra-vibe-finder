import type { Destination, Zone } from "@/data/destinations";
import type { WeatherNow } from "./types";

/**
 * TEST-ONLY deterministic weather model. Used by unit tests so engine behaviour
 * can be verified without network access. Never imported by production UI —
 * the app shows "unavailable" instead of invented weather.
 */

/** Typical monthly mean temperatures (°C, Jan..Dec) per climate zone — demo model. */
const ZONE_TEMPS: Record<Zone, number[]> = {
  coastal: [26, 27, 28, 30, 30, 28, 27, 27, 27, 28, 27, 26],
  hill: [6, 8, 12, 16, 19, 20, 19, 19, 18, 15, 11, 8],
  southhill: [16, 18, 20, 21, 20, 18, 17, 17, 18, 18, 17, 16],
  alpine: [-6, -4, 1, 6, 11, 15, 17, 17, 13, 7, 1, -4],
  plains: [15, 19, 25, 31, 34, 33, 30, 29, 29, 27, 21, 16],
  desert: [16, 20, 26, 32, 36, 35, 32, 31, 31, 28, 22, 17],
  northeast: [11, 13, 17, 19, 20, 21, 22, 22, 21, 19, 15, 12],
};
const RAIN: Record<Zone, number[]> = {
  coastal: [6, 7, 8, 9], hill: [7, 8], southhill: [6, 7, 8], alpine: [], plains: [7, 8], desert: [], northeast: [5, 6, 7, 8, 9],
};

/** Deterministic demo weather for a destination in a given month (1-12). Tests only. */
export function mockWeather(dest: Destination, month: number): WeatherNow {
  const base = ZONE_TEMPS[dest.zone][month - 1];
  const offset = ((dest.id.length * 7) % 5) - 2;
  const temp = base + offset * 0.6;
  let condition = "Clear";
  if (RAIN[dest.zone].includes(month)) condition = "Rain";
  else if (temp <= 0) condition = "Snow";
  else if (dest.zone === "plains" && [12, 1].includes(month)) condition = "Fog";
  else if (dest.zone === "northeast" || dest.zone === "southhill") condition = "Clouds";
  const humidity = dest.zone === "coastal" ? 75 : dest.zone === "desert" ? 25 : 55;
  const feelsLike = temp + (humidity > 70 && temp > 25 ? 3 : temp < 5 ? -3 : 0);
  return {
    temp: Math.round(temp), feelsLike: Math.round(feelsLike), condition, humidity,
    precipitation: condition === "Rain" ? 8 : 0, wind: 10,
    updatedAt: "test", source: "live",
  };
}
