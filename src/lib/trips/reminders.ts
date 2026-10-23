import type { Destination } from '@/data/destinations';
import type { WeatherNow } from '@/lib/weather/types';
export interface TripReminder {
  destinationId: string; departure: string; items: string[]; sent: string[];
  snoozeUntil?: number; pending?: string;
}
export const TRIP_STORAGE_KEY = 'yatra-trip-reminders-v1';
export const tripStorageKey = (userId?: string) => userId ? `yatra-departure-alarms-v2:${userId}` : TRIP_STORAGE_KEY;
export const ALARM_WINDOWS = [
  { key: '24h', minutes: 1440, label: 'Your trip is coming up' },
  { key: '2h', minutes: 120, label: 'Time to get ready' },
  { key: '30m', minutes: 30, label: 'Leaving in 30 minutes or less' },
  { key: '10m', minutes: 10, label: 'Almost time to leave' },
  { key: 'leave', minutes: 0, label: 'Before you step out' },
] as const;
export interface PackingAdvice { essential: string[]; destination: string[]; weather: string[]; weatherNote: string }
export function packingAdvice(d: Destination, w?: WeatherNow): PackingAdvice {
  const essential = ['Phone charger & power bank', 'Water bottle', 'Photo ID & required travel documents', 'Tickets & booking confirmations (offline copy)', 'Personal medicines & prescriptions', 'Wallet, keys & payment backup'];
  const destination: string[] = [];
  if (d.categories.includes('beach')) destination.push('Sunscreen, hat & beach footwear');
  if (['hill', 'southhill', 'alpine'].includes(d.zone)) destination.push('Warm layer & comfortable walking shoes');
  if (d.categories.includes('adventure') || d.categories.includes('wildlife')) destination.push('Sturdy shoes & a small daypack');
  const weather: string[] = [];
  const available = !!w && w.source !== 'unavailable';
  if (available) {
    if (w.precipitation > 0 || ['Rain','Drizzle','Thunderstorm','Snow'].includes(w.condition)) weather.push('Umbrella or raincoat & a waterproof bag');
    if (w.temp <= 15 || (w.lowTemp !== undefined && w.lowTemp <= 15)) weather.push('Warm jacket, extra socks & warm clothes');
    if (w.temp >= 30) weather.push('Sunscreen, a hat & extra drinking water');
  }
  return { essential, destination, weather, weatherNote: available ? `${w.source === 'forecast' ? 'Departure-day forecast' : 'Current conditions'} for ${d.name}: ${w.condition}, ${w.temp}°C${w.lowTemp !== undefined ? `, low ${w.lowTemp}°C` : ''}.` : 'Weather could not be checked. These are basic and destination essentials; check the forecast before leaving.' };
}
export function packingItems(d: Destination, w?: WeatherNow): string[] {
  const advice = packingAdvice(d, w);
  return [...new Set([...advice.essential, ...advice.destination, ...advice.weather])];
}
export function dueWindow(trip: TripReminder, now: number): string | null {
  const remaining = Date.parse(trip.departure) - now;
  // A brief grace period catches the leave-home alarm after a sleeping tab wakes.
  if (!Number.isFinite(remaining) || remaining < -10 * 60000 || remaining > 24 * 3600000) return null;
  if (trip.snoozeUntil && now < trip.snoozeUntil && remaining > 0) return null;
  if (trip.snoozeUntil && now >= trip.snoozeUntil) return 'snooze';
  const window = [...ALARM_WINDOWS].reverse().find(w => remaining <= w.minutes * 60000);
  if (!window || trip.sent.includes(window.key)) return null;
  return window.key;
}
export function markDelivered(trip: TripReminder, window: string): TripReminder {
  const index = ALARM_WINDOWS.findIndex(w => w.key === window);
  return { ...trip, snoozeUntil: undefined, pending: window, sent: [...new Set([...trip.sent, ...ALARM_WINDOWS.slice(0, index + 1).map(w => w.key)])] };
}
export function readTrips(userId?: string): TripReminder[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(tripStorageKey(userId)) || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((t): t is TripReminder => t && typeof t.destinationId === 'string' && typeof t.departure === 'string' && Number.isFinite(Date.parse(t.departure)) && Array.isArray(t.items) && t.items.every((i: unknown) => typeof i === 'string') && Array.isArray(t.sent) && t.sent.every((i: unknown) => typeof i === 'string') && (t.snoozeUntil === undefined || Number.isFinite(t.snoozeUntil)) && (t.pending === undefined || typeof t.pending === 'string'));
  } catch { return []; }
}
