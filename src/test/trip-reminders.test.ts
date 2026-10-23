import { describe, it, expect, beforeEach } from 'vitest';
import { dueWindow, markDelivered, tripStorageKey, packingItems, readTrips, TRIP_STORAGE_KEY, type TripReminder } from '@/lib/trips/reminders';
import { getDestination } from '@/data/destinations';
import { UNAVAILABLE_WEATHER } from '@/lib/weather/types';
const now = Date.parse('2026-10-21T06:00:00Z');
const trip = (hours: number, sent: string[] = []): TripReminder => ({ destinationId: 'goa', departure: new Date(now + hours * 3600000).toISOString(), items: ['ID'], sent });
describe('departure reminder windows', () => {
  it('waits until 24 hours before departure', () => { expect(dueWindow(trip(25), now)).toBeNull(); expect(dueWindow(trip(24), now)).toBe('24h'); });
  it('catches up only the urgent window and does not repeat it', () => { expect(dueWindow(trip(1), now)).toBe('2h'); expect(dueWindow(trip(1, ['2h']), now)).toBeNull(); });
  it('still sends the second reminder after the first', () => expect(dueWindow(trip(2, ['24h']), now)).toBe('2h'));
  it('rings at departure with a ten-minute wake-up grace', () => { expect(dueWindow(trip(0), now)).toBe('leave'); expect(dueWindow(trip(-1), now)).toBeNull(); expect(dueWindow({ ...trip(1), departure: 'bad' }, now)).toBeNull(); });
});
describe('packing and storage', () => {
  beforeEach(() => localStorage.clear());
  it('adds rain protection only for real available weather', () => {
    const d = getDestination('goa')!;
    expect(packingItems(d, { ...UNAVAILABLE_WEATHER, condition: 'Rain' })).not.toContain('Umbrella or raincoat & a waterproof bag');
    expect(packingItems(d, { ...UNAVAILABLE_WEATHER, source: 'live', temp: 25, condition: 'Rain' })).toContain('Umbrella or raincoat & a waterproof bag');
  });
  it('keeps destination and basic essentials without weather', () => { expect(packingItems(getDestination('goa')!)).toContain('Sunscreen, hat & beach footwear'); expect(packingItems(getDestination('goa')!)).toContain('Phone charger & power bank'); });
  it('recovers safely from corrupted storage', () => { localStorage.setItem(TRIP_STORAGE_KEY, 'bad json'); expect(readTrips()).toEqual([]); localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify([trip(5), { departure: 2 }])); expect(readTrips()).toEqual([trip(5)]); });
});

it('handles urgent windows, snooze, and delivery persistence', () => {
 expect(dueWindow(trip(.5), now)).toBe('30m'); expect(dueWindow(trip(.1), now)).toBe('10m');
 const delivered = markDelivered(trip(.1), '10m'); expect(delivered.pending).toBe('10m'); expect(dueWindow(delivered, now)).toBeNull();
 expect(dueWindow({...delivered, snoozeUntil:now+300000}, now)).toBeNull();
 expect(dueWindow({...trip(1), snoozeUntil:now-1}, now)).toBe('snooze');
 expect(dueWindow({...trip(0), snoozeUntil:now+300000}, now)).toBe('leave');
});
it('separates accounts and catches cold forecast lows', () => {
 localStorage.setItem(tripStorageKey('a'), JSON.stringify([trip(5)])); expect(readTrips('a')).toHaveLength(1); expect(readTrips('b')).toEqual([]);
 expect(packingItems(getDestination('goa')!, {...UNAVAILABLE_WEATHER, source:'forecast', temp:22,lowTemp:8})).toContain('Warm jacket, extra socks & warm clothes');
});
