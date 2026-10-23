import { beforeEach, expect, it, vi } from 'vitest';
const api = vi.hoisted(() => ({ changeReminder: vi.fn(), listReminders: vi.fn() }));
vi.mock('@/lib/trips/storage.functions', () => api);
import { createReminderSync } from '@/lib/trips/cloud-sync';
const trip = { destinationId: 'goa', departure: '2026-12-01T12:00:00.000Z', items: ['Charger'], sent: [] };
beforeEach(() => { localStorage.clear(); vi.resetAllMocks(); api.listReminders.mockResolvedValue([]); api.changeReminder.mockResolvedValue(undefined); });
it('retains a failed write and retries after reload without losing the local alarm', async () => {
 const sync = createReminderSync('a', vi.fn()); sync.stage([], [trip]); api.changeReminder.mockRejectedValueOnce(new Error('offline')); await sync.flush();
 const reopened = createReminderSync('a', vi.fn()); expect(await reopened.load()).toEqual([trip]); await reopened.flush(); expect(JSON.parse(localStorage.getItem('yatra-alarm-outbox:a')!)).toEqual({});
});
it('keeps account data separate and replays pending deletions over remote records', async () => {
 api.listReminders.mockResolvedValue([trip]); const a = createReminderSync('a', vi.fn()); a.stage([trip], []);
 expect(await a.load()).toEqual([]); expect(await createReminderSync('b', vi.fn()).load()).toEqual([trip]);
});
it('does not erase an edit made while the previous write is in flight', async () => {
 let release!: () => void; api.changeReminder.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
 const sync = createReminderSync('a', vi.fn()); sync.stage([], [trip]); const flushing = sync.flush();
 const newer = { ...trip, items: ['Umbrella'] }; sync.stage([trip], [newer]); release(); await flushing;
 expect(api.changeReminder).toHaveBeenLastCalledWith({ data: { destinationId: 'goa', trip: newer } });
});
