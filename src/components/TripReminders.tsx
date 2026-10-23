import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createReminderSync } from '@/lib/trips/cloud-sync';
import { BellRing } from 'lucide-react';
import { DESTINATIONS, getDestination } from '@/data/destinations';
import { ALARM_WINDOWS, dueWindow, markDelivered, packingAdvice, packingItems, readTrips, tripStorageKey, type TripReminder } from '@/lib/trips/reminders';
import { useAuth } from './AuthProvider';
import { authPath } from '@/lib/auth/identity';
import { useWeather } from '@/lib/weather/useWeather';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface ReminderContext { trips: TripReminder[]; openSetup: (id?: string) => void; cancel: (id: string) => boolean }
const Context = createContext<ReminderContext | null>(null);
export function useTripReminders() { const c = useContext(Context); if (!c) throw new Error('Missing reminders'); return c; }
export function TripReminders({ children }: { children: ReactNode }) { const { user } = useAuth(); return <Manager key={user?.id ?? 'guest'} userId={user?.id}>{children}</Manager>; }
const cloud = import.meta.env.VITE_AUTH_PROVIDER === 'supabase';
const button = 'rounded-full border px-4 py-2 text-sm font-semibold';
const primary = `${button} bg-primary text-primary-foreground`;
function Manager({ children, userId }: { children: ReactNode; userId?: string }) {
  const syncRef = useRef<ReturnType<typeof createReminderSync> | null>(null);
  const ready = useRef(!cloud);
  const [trips, setTrips] = useState<TripReminder[]>([]);
  const [setup, setSetup] = useState(false);
  const [destinationId, setDestinationId] = useState(DESTINATIONS[0].id);
  const [departure, setDeparture] = useState('');
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState<TripReminder | null>(null);
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const lastPing = useRef('');
  const commit = (next: TripReminder[]) => { if (!userId) return false; if (!ready.current) { setStatus('Account alarms are still loading. Please try again shortly.'); return false; } try { syncRef.current?.stage(readTrips(userId), next); localStorage.setItem(tripStorageKey(userId), JSON.stringify(next)); setTrips(next); void syncRef.current?.flush(); return true; } catch { setStatus('Could not save. Allow browser storage and try again.'); return false; } };
  const unlock = async () => { try { audio.current ??= new AudioContext(); await audio.current.resume(); setSound(audio.current.state === 'running'); } catch { setStatus('Sound is unavailable in this browser. Pop-up alerts still work.'); } };
  const ping = () => { try { const ctx = audio.current; if (ctx?.state !== 'running') return; for (let i = 0; i < 3; i++) { const o = ctx.createOscillator(), g = ctx.createGain(), at = ctx.currentTime + i * 0.65; o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.12, at + 0.02); g.gain.exponentialRampToValueAtTime(0.001, at + 0.4); o.start(at); o.stop(at + 0.4); } } catch { /* Pop-up remains available. */ } };
  const openSetup = (id?: string) => { if (!userId) { window.location.assign(authPath(window.location.pathname + window.location.search)); return; } const selected = id ?? trips[0]?.destinationId ?? DESTINATIONS[0].id; setDestinationId(selected); const existing = trips.find(t => t.destinationId === selected); setDeparture(existing ? localTime(existing.departure) : ''); setStatus(''); setSetup(true); };
  useEffect(() => {
    if (!userId) return;
    const check = () => { void syncRef.current?.flush(); if (!ready.current) return; const current = readTrips(userId); let changed = false; const next = current.map(t => { const due = dueWindow(t, Date.now()); if (!due) return t; changed = true; return markDelivered(t, due); }); if (changed) commit(next); else setTrips(current); };
    let cancelled = false;
    if (cloud) {
      const sync = createReminderSync(userId, setStatus); syncRef.current = sync;
      void sync.load().then(initial => {
        if (cancelled) return;
        localStorage.setItem(tripStorageKey(userId), JSON.stringify(initial));
        ready.current = true; setTrips(initial); check();
      }).catch(() => { if (!cancelled) setStatus('Could not load account alarms. Refresh the page to retry; no cloud changes were made.'); });
    } else check();
    try { const key = `yatra-alarm-welcome:${userId}`; if (!sessionStorage.getItem(key)) { setSetup(true); sessionStorage.setItem(key, '1'); } } catch { setSetup(true); }
    const timer = window.setInterval(check, 15000); window.addEventListener('focus', check); window.addEventListener('storage', check);
    return () => { cancelled = true; syncRef.current?.stop(); clearInterval(timer); window.removeEventListener('focus', check); window.removeEventListener('storage', check); void audio.current?.close(); };
  }, [userId]);
  const active = preview ?? trips.find(t => t.pending && Date.parse(t.departure) > Date.now() - 600000);
  useEffect(() => { if (!active) { lastPing.current = ''; return; } const key = `${active.destinationId}:${active.departure}:${active.pending}`; if (lastPing.current === key) return; lastPing.current = key; ping(); if ('Notification' in window && Notification.permission === 'granted') { try { new Notification('YatraAI · Before you leave', { body: `Your essentials for ${getDestination(active.destinationId)?.name}: charger, water, documents and weather-ready clothes.`, tag: key }); } catch { /* In-app fallback */ } } }, [active?.destinationId, active?.departure, active?.pending]);
  const dismiss = (snooze = false) => { if (!active) return; if (preview) { setPreview(null); return; } commit(readTrips(userId).map(t => t.destinationId === active.destinationId ? { ...t, pending: undefined, snoozeUntil: snooze ? Math.min(Date.now() + 300000, Date.parse(t.departure)) : undefined } : t)); };
  const d = getDestination(destinationId) ?? DESTINATIONS[0];
  const forecast = useWeather(setup ? [d] : [], departure.slice(0, 10) || undefined);
  const advice = packingAdvice(d, forecast.weather[d.id]);
  return <Context.Provider value={{ trips, openSetup, cancel: id => commit(readTrips(userId).filter(t => t.destinationId !== id)) }}>{children}
    <Dialog open={setup && !active} onOpenChange={setSetup}><DialogContent className="max-h-[85dvh] overflow-y-auto rounded-3xl sm:max-w-xl"><DialogHeader><DialogTitle className="flex items-center gap-2 text-2xl"><BellRing className="text-primary" /> Before you leave</DialogTitle><DialogDescription>A little heads-up for the things that are easy to forget. Choose when you leave home and we’ll bring your essentials to you.</DialogDescription></DialogHeader>
      <label className="grid gap-2 text-sm font-semibold">Where are you going?<select className="rounded-xl border bg-background p-3" value={destinationId} onChange={e => { setDestinationId(e.target.value); const old = trips.find(t => t.destinationId === e.target.value); setDeparture(old ? localTime(old.departure) : ''); }}>{DESTINATIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
      <label className="grid gap-2 text-sm font-semibold">Leave-home time<input type="datetime-local" className="rounded-xl border bg-background p-3" value={departure} onChange={e => setDeparture(e.target.value)} /><span className="text-xs font-normal text-muted-foreground">Your device’s local time. Alerts at 24h, 2h, 30m, 10m and departure.</span></label>
      <Advice advice={advice} loading={forecast.isLoading} />
      <div className="flex flex-wrap gap-2"><button className={primary} onClick={() => { const time = Date.parse(departure); if (!Number.isFinite(time) || time <= Date.now()) { setStatus('Choose a leave-home time in the future.'); return; } void unlock(); if (commit([...readTrips(userId).filter(t => t.destinationId !== d.id), { destinationId: d.id, departure: new Date(time).toISOString(), items: packingItems(d, forecast.weather[d.id]), sent: [] }])) setStatus(cloud ? 'Alarm saved on this device; syncing to your account. Keep the site open for alerts.' : 'Alarm saved. You can close this pop-up; keep the site open for your alarms.'); }}>Save departure alarm</button><button className={button} onClick={async () => { await unlock(); setPreview({ destinationId: d.id, departure: departure && Number.isFinite(Date.parse(departure)) ? new Date(departure).toISOString() : new Date().toISOString(), items: [], sent: [], pending: 'preview' }); }}>Test alarm</button><button className={button} onClick={async () => { await unlock(); setPreview({ destinationId: d.id, departure: new Date().toISOString(), items: [], sent: [], pending: 'leave' }); }}>I’m leaving now</button></div>
      {trips.some(t => t.destinationId === d.id) && <button className="text-left text-sm underline" onClick={() => { if (commit(readTrips(userId).filter(t => t.destinationId !== d.id))) setStatus('Alarm cancelled.'); }}>Cancel this destination’s alarm</button>}
      <button className="text-left text-sm underline" onClick={async () => { await unlock(); try { const permission = 'Notification' in window ? await Notification.requestPermission() : 'unsupported'; setStatus(permission === 'granted' ? 'Browser notifications enabled.' : 'Browser notifications are unavailable or not allowed. Pop-up alerts still work.'); } catch { setStatus('Pop-up alerts are available; browser notifications could not be enabled.'); } }}>Enable browser notifications & sound</button>
      <p role="status" className="text-sm">{status}</p><p className="text-xs text-muted-foreground">{sound ? 'Sound enabled for this session. ' : 'Tap Save or Test to enable sound. '}Keep this site open. Closed tabs cannot ring, and sleeping devices may delay alerts. {cloud ? 'Alarms sync to your account; offline changes retry while this page is open.' : 'Reminders are saved for your account in this browser.'}</p>
    </DialogContent></Dialog>
    {active && <Alarm key={`${active.destinationId}:${active.pending}`} trip={active} sound={sound} dismiss={dismiss} preview={!!preview} enable={unlock} />}
  </Context.Provider>;
}
function localTime(iso: string) { const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
function Advice({ advice, loading }: { advice: ReturnType<typeof packingAdvice>; loading?: boolean }) { return <div className="space-y-3"><div className="rounded-2xl bg-secondary p-4"><p className="mb-2 text-sm font-bold">Don’t leave these behind</p><div className="grid gap-2 text-sm sm:grid-cols-2">{advice.essential.map(item => <p key={item}>{item}</p>)}</div></div>{[...advice.destination, ...advice.weather].length > 0 && <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><p className="mb-2 text-sm font-bold">For your destination</p>{[...advice.destination, ...advice.weather].map(item => <p className="text-sm" key={item}>{item}</p>)}</div>}<p className="text-xs text-muted-foreground">{loading ? 'Refreshing weather advice…' : advice.weatherNote}</p></div>; }
function Alarm({ trip, sound, dismiss, preview, enable }: { trip: TripReminder; sound: boolean; dismiss: (snooze?: boolean) => void; preview: boolean; enable: () => Promise<void> }) { const d = getDestination(trip.destinationId) ?? DESTINATIONS[0]; const date = localTime(trip.departure).slice(0, 10); const weather = useWeather([d], date); useEffect(() => { void weather.refetch(); }, []); return <Dialog open onOpenChange={open => { if (!open) dismiss(); }}><DialogContent className="max-h-[85dvh] overflow-y-auto rounded-3xl sm:max-w-xl"><DialogHeader><DialogTitle className="text-2xl"><BellRing className="mb-3 size-9 text-primary" />{preview && trip.pending === 'preview' ? 'Your alarm preview' : ALARM_WINDOWS.find(w => w.key === trip.pending)?.label ?? 'A little reminder'}</DialogTitle><DialogDescription>Heading to {d.name}? Take a moment to grab your essentials.</DialogDescription></DialogHeader><Advice advice={packingAdvice(d, weather.weather[d.id])} loading={weather.isFetching} /><div className="flex flex-wrap gap-2"><button className={primary} onClick={() => dismiss()}>Dismiss</button>{!preview && Date.parse(trip.departure) > Date.now() && <button className={button} onClick={() => dismiss(true)}>Snooze 5 minutes</button>}{!sound && <button className={button} onClick={() => void enable()}>Enable sound</button>}</div><p className="text-xs text-muted-foreground">This reminder cannot detect what you’ve packed. Weather advice refreshes when the alarm opens.</p></DialogContent></Dialog>; }
