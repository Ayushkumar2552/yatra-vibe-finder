import type { Destination } from '@/data/destinations';
import { useWeather } from '@/lib/weather/useWeather';
import { useTripReminders } from './TripReminders';

export function TripPreparation({ destination: d }: { destination: Destination }) {
  const { trips, openSetup, cancel } = useTripReminders();
  const saved = trips.find(t => t.destinationId === d.id);
  const { weather, isLoading, refetch, isFetching } = useWeather([d]);
  const current = weather[d.id];
  const inputClass = 'rounded-xl border bg-background px-4 py-2 text-sm';
  return <section className="space-y-6 rounded-3xl border bg-card p-6" aria-label="Weather and trip reminders">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Be ready for {d.name}</h2><button className={inputClass} disabled={isFetching} onClick={() => void refetch()}>{isFetching ? 'Refreshing…' : 'Refresh weather'}</button></div>
    {isLoading ? <p role="status">Checking current weather…</p> : current.source === 'unavailable' ? <p>Weather is unavailable right now. Try refreshing; essential reminders still work.</p> : <div className="rounded-2xl bg-secondary p-4">
      <p className="text-3xl font-bold">{current.temp}°C · {current.condition}</p>
      <p className="mt-2 text-sm">Feels like {current.feelsLike}°C · Humidity {current.humidity}% · Wind {current.wind} km/h · Precipitation {current.precipitation} mm</p>
      <p className="mt-2 text-xs text-muted-foreground">Current conditions · Open-Meteo · Updated {current.updatedAt.replace('T', ' ')} (destination time)</p>
      <a className="text-xs underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather data by Open-Meteo</a>
    </div>}
    <div><h3 className="text-xl font-bold">Before you leave</h3><p className="mt-2 text-sm text-muted-foreground">A timely alarm for your charger, documents and weather-ready essentials. No checklist needed.</p></div>
    <div className="flex flex-wrap gap-2"><button className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground" onClick={() => openSetup(d.id)}>{saved ? 'Manage departure alarm' : 'Set departure alarm'}</button>{saved && <button className={inputClass} onClick={() => cancel(d.id)}>Cancel alarm</button>}</div>
    {saved && <p className="text-sm">Leave-home time: {new Date(saved.departure).toLocaleString()}</p>}
    <p className="text-xs text-muted-foreground">Sign in to save an alarm. Keep the site open for scheduled pop-ups and sound.</p>
  </section>;
}
