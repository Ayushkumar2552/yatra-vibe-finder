import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TripPreparation } from '@/components/TripPreparation';
import { TripReminders } from '@/components/TripReminders';
import { getDestination } from '@/data/destinations';
import { UNAVAILABLE_WEATHER } from '@/lib/weather/types';
import { readTrips } from '@/lib/trips/reminders';
vi.mock('@/components/AuthProvider', () => ({ useAuth: () => ({user:{id:'test-user'}}) }));
vi.mock('@/lib/weather/useWeather', () => ({ useWeather: () => ({ weather: { goa: UNAVAILABLE_WEATHER }, isLoading: false, isFetching: false, refetch: vi.fn() }) }));
describe('trip preparation controls', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-21T06:00:00Z')); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });
  it('shows unavailable weather honestly and validates departure', () => {
    render(<TripReminders><TripPreparation destination={getDestination('goa')!} /></TripReminders>);
    expect(screen.getByText(/Weather is unavailable right now/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save departure alarm' }));
    expect(screen.getByText('Choose a leave-home time in the future.')).toBeInTheDocument();
    expect(readTrips('test-user')).toEqual([]);
  });
  it('saves and cancels a reminder', () => {
    render(<TripReminders><TripPreparation destination={getDestination('goa')!} /></TripReminders>);
    fireEvent.change(screen.getByLabelText(/Leave-home time/), { target: { value: '2026-10-24T12:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save departure alarm' }));
    expect(readTrips('test-user')).toHaveLength(1);
    expect(readTrips('test-user')[0].items).toContain('Phone charger & power bank');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel this destination’s alarm' }));
    expect(readTrips('test-user')).toEqual([]);
  });
});
