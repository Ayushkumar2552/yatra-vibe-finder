import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/auth/session.server';
import type { TripReminder } from './reminders';
async function account() {
  setResponseHeader('Cache-Control', 'private, no-store');
  const db = supabaseServer();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) throw new Error('Please log in to save your trips.');
  return { db, userId: data.user.id };
}
const destinationId = z.string().min(1).max(100);
const trip = z.object({ destinationId, departure: z.string().datetime(), items: z.array(z.string().max(300)).max(100), sent: z.array(z.string().max(30)).max(30), snoozeUntil: z.number().finite().optional(), pending: z.string().max(30).optional() });
export const listSaved = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, userId } = await account();
  const { data, error } = await db.from('saved_destinations').select('destination_id').eq('user_id', userId);
  if (error) throw new Error('Could not load saved destinations.');
  return (data ?? []).map(row => row.destination_id as string);
});
export const changeSaved = createServerFn({ method: 'POST' }).inputValidator(z.object({ destinationId, saved: z.boolean() })).handler(async ({ data }) => {
  const { db, userId } = await account();
  const result = data.saved ? await db.from('saved_destinations').upsert({ user_id: userId, destination_id: data.destinationId }) : await db.from('saved_destinations').delete().eq('user_id', userId).eq('destination_id', data.destinationId);
  if (result.error) throw new Error('Could not save this change. Please try again.');
});
export const listReminders = createServerFn({ method: 'GET' }).handler(async (): Promise<TripReminder[]> => {
  const { db, userId } = await account();
  const { data, error } = await db.from('trip_reminders').select('destination_id,departure,items,sent,snooze_until,pending').eq('user_id', userId);
  if (error) throw new Error('Could not load departure alarms.');
  return (data ?? []).map(row => ({ destinationId: row.destination_id, departure: row.departure, items: row.items, sent: row.sent, snoozeUntil: row.snooze_until ? Date.parse(row.snooze_until) : undefined, pending: row.pending ?? undefined }));
});
export const changeReminder = createServerFn({ method: 'POST' }).inputValidator(z.object({ destinationId, trip: trip.nullable() }).refine(data => !data.trip || data.trip.destinationId === data.destinationId)).handler(async ({ data }) => {
  const { db, userId } = await account();
  const t = data.trip;
  const result = t ? await db.from('trip_reminders').upsert({ user_id: userId, destination_id: t.destinationId, departure: t.departure, items: t.items, sent: t.sent, snooze_until: t.snoozeUntil ? new Date(t.snoozeUntil).toISOString() : null, pending: t.pending ?? null }) : await db.from('trip_reminders').delete().eq('user_id', userId).eq('destination_id', data.destinationId);
  if (result.error) throw new Error('Could not sync this alarm.');
});
