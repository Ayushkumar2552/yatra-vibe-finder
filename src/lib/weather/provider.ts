import { UNAVAILABLE_WEATHER, wmoCondition, type WeatherNow } from './types';
export interface WeatherPoint { id: string; lat: number; lon: number }
export interface WeatherResult { live: boolean; results: Record<string, WeatherNow>; error?: string }
export function weatherMode(date?: string, now = new Date()): 'current' | 'forecast' | 'out-of-range' {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  if (!date || date === today) return 'current';
  const days = (Date.parse(date) - Date.parse(today)) / 86400000;
  return Number.isFinite(days) && days > 0 && days < 16 ? 'forecast' : 'out-of-range';
}
const finite = (values: unknown[]) => values.every(v => typeof v === 'number' && Number.isFinite(v));
export function parseReading(value: unknown, mode: 'current' | 'forecast'): WeatherNow {
  const data = value as { current?: Record<string, unknown>; daily?: Record<string, unknown[]> } | null;
  if (mode === 'current') {
    const c = data?.current;
    if (!c || typeof c.time !== 'string' || !finite([c.temperature_2m, c.apparent_temperature, c.relative_humidity_2m, c.precipitation, c.weather_code, c.wind_speed_10m])) return { ...UNAVAILABLE_WEATHER };
    return { temp: Math.round(c.temperature_2m as number), feelsLike: Math.round(c.apparent_temperature as number), condition: wmoCondition(c.weather_code as number), humidity: c.relative_humidity_2m as number, precipitation: c.precipitation as number, wind: Math.round(c.wind_speed_10m as number), updatedAt: c.time, source: 'live' };
  }
  const d = data?.daily;
  if (!d || typeof d.time?.[0] !== 'string' || !finite([d.temperature_2m_max?.[0], d.temperature_2m_min?.[0], d.weather_code?.[0], d.precipitation_sum?.[0], d.wind_speed_10m_max?.[0]])) return { ...UNAVAILABLE_WEATHER };
  const temp = Math.round(((d.temperature_2m_max[0] as number) + (d.temperature_2m_min[0] as number)) / 2);
  return { temp, lowTemp: d.temperature_2m_min[0] as number, feelsLike: temp, condition: wmoCondition(d.weather_code[0] as number), humidity: 0, precipitation: d.precipitation_sum[0] as number, wind: Math.round(d.wind_speed_10m_max[0] as number), updatedAt: d.time[0] as string, source: 'forecast' };
}
/** Public, keyless provider; one multi-location request instead of 48 simultaneous requests. */
export async function fetchProviderWeather(points: WeatherPoint[], date?: string): Promise<WeatherResult> {
  const results: Record<string, WeatherNow> = Object.fromEntries(points.map(p => [p.id, { ...UNAVAILABLE_WEATHER }]));
  const mode = weatherMode(date);
  if (!points.length || mode === 'out-of-range') return { live: false, results };
  const params = new URLSearchParams({ latitude: points.map(p => p.lat).join(','), longitude: points.map(p => p.lon).join(','), timezone: 'Asia/Kolkata' });
  if (mode === 'current') params.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m');
  else { params.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max'); params.set('start_date', date!); params.set('end_date', date!); }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal });
    if (!response.ok) throw new Error(response.status === 429 ? 'Weather provider is busy. Please retry shortly.' : `Weather provider returned HTTP ${response.status}.`);
    const payload: unknown = await response.json();
    const rows = Array.isArray(payload) ? payload : [payload];
    points.forEach((point, index) => { results[point.id] = parseReading(rows[index], mode); });
    return { live: Object.values(results).some(w => w.source !== 'unavailable'), results };
  } finally { clearTimeout(timeout); }
}
/** Try the public provider from the visitor's network, then the site's server. */
export async function fetchResilientWeather(points: WeatherPoint[], date: string | undefined, fallback: () => Promise<WeatherResult>): Promise<WeatherResult> {
  let primary: WeatherResult | undefined;
  try {
    primary = await fetchProviderWeather(points, date);
    if (weatherMode(date) === 'out-of-range' || Object.values(primary.results).every(w => w.source !== 'unavailable')) return primary;
  } catch { /* The independent server transport can still succeed. */ }
  try {
    const secondary = await fallback();
    const results = { ...secondary.results, ...primary?.results };
    for (const point of points) if (secondary.results[point.id] && secondary.results[point.id].source !== 'unavailable') results[point.id] = secondary.results[point.id];
    if (Object.values(results).some(w => w.source !== 'unavailable')) return { live: true, results };
    throw new Error(secondary.error || 'Weather is temporarily unavailable. Please retry.');
  } catch (error) {
    if (primary?.live) return primary;
    throw error;
  }
}
