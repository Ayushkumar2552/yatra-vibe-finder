import type { TripReminder } from './reminders';
import { changeReminder, listReminders } from './storage.functions';
type Outbox = Record<string, TripReminder | null>;
export function createReminderSync(userId: string, report: (message: string) => void) {
  const key = `yatra-alarm-outbox:${userId}`;
  let running = false;
  let stopped = false;
  const read = (): Outbox => {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid alarm sync storage.');
    return value as Outbox;
  };
  const write = (value: Outbox) => localStorage.setItem(key, JSON.stringify(value));
  const flush = async () => {
    if (running || stopped) return;
    running = true;
    try {
      for (;;) {
        if (stopped) return;
        const entry = Object.entries(read())[0];
        if (!entry) return;
        const [destinationId, trip] = entry;
        await changeReminder({ data: { destinationId, trip } });
        const current = read();
        // A newer local edit must not be removed by an older network response.
        if (JSON.stringify(current[destinationId]) === JSON.stringify(trip)) { delete current[destinationId]; write(current); }
        if (!stopped) report('Alarms synced to your account. Keep the site open for alerts.');
      }
    } catch { if (!stopped) report('Alarm changes are saved on this device. Cloud sync will retry while this page is open.'); }
    finally { running = false; }
  };
  return {
    async load() {
      const remote = await listReminders();
      const merged = new Map(remote.map(t => [t.destinationId, t]));
      for (const [id, trip] of Object.entries(read())) { if (trip) merged.set(id, trip); else merged.delete(id); }
      return [...merged.values()];
    },
    stage(previous: TripReminder[], next: TripReminder[]) {
      const outbox = read();
      const before = new Map(previous.map(t => [t.destinationId, t]));
      const after = new Map(next.map(t => [t.destinationId, t]));
      for (const id of new Set([...before.keys(), ...after.keys()])) {
        if (JSON.stringify(before.get(id)) !== JSON.stringify(after.get(id))) outbox[id] = after.get(id) ?? null;
      }
      write(outbox);
    },
    flush,
    stop() { stopped = true; },
  };
}
