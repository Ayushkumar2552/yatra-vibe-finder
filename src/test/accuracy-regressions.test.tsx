import { parsePrompt } from '@/lib/engine/parsePrompt';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeatherChip, weatherSourceLabel, fmtHours } from '@/components/DestinationCard';
import { buildItinerary } from '@/lib/engine/itinerary';
import { scoreDestination, type Preferences } from '@/lib/engine/recommend';
import { DESTINATIONS, ORIGIN_CITIES } from '@/data/destinations';
import { UNAVAILABLE_WEATHER } from '@/lib/weather/types';
const d = DESTINATIONS[0];
const p: Preferences = {origin: ORIGIN_CITIES[0], budget: 60000, travelers: 2, days: 4, vibes: [], climate: 'any', month: 10, transport:'any', group:'couple', useWeather:true, travelDate:'2026-10-24'};
afterEach(() => vi.useRealTimers());
describe('information accuracy regressions', () => {
 it('parses explicit rupee budgets without inflating them and recognises nights', () => {
  expect(parsePrompt('budget 500')).toMatchObject({budget:500});
  expect(parsePrompt('under ₹25,000 for 3 nights')).toMatchObject({budget:25000,days:4});
  expect(parsePrompt('budget 1 lakh')).toMatchObject({budget:100000});
  expect(parsePrompt('20k for 5 days')).toMatchObject({budget:20000,days:5});
 });
 it('excludes a forecast for the wrong day but accepts the matching departure day', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-22T12:00:00Z'));
  const forecast = {...UNAVAILABLE_WEATHER, source:'forecast' as const, temp:25, feelsLike:25, condition:'Clear', updatedAt:'2026-10-23'};
  expect(scoreDestination(d,p,forecast).factors.weather).toBeNull();
  expect(scoreDestination(d,p,{...forecast,updatedAt:p.travelDate!}).factors.weather).not.toBeNull();
 });
 it('labels daily midpoint without inventing apparent temperature or update age', () => {
  const forecast={...UNAVAILABLE_WEATHER, source:'forecast' as const,temp:25,feelsLike:25,updatedAt:'2026-10-24'};
  render(<WeatherChip w={forecast}/>);
  expect(screen.getByText(/high\/low midpoint/)).toBeTruthy();
  expect(screen.queryByText(/feels/)).toBeNull();
  expect(weatherSourceLabel(forecast)).toContain('Forecast for 2026-10-24');
  expect(weatherSourceLabel(forecast)).not.toContain('ago');
 });
 it('interprets provider timestamps in India time on any device', () => {
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-22T06:40:00Z'));
  expect(weatherSourceLabel({...UNAVAILABLE_WEATHER,source:'live',updatedAt:'2026-10-22T12:00'})).toContain('10 min ago');
 });
 it('does not display 60 minute hour remainders', () => expect(fmtHours(1.999)).toBe('2 hr 0 min'));
 it('includes departure in a one-day itinerary', () => {
  const plan=buildItinerary(d,1); expect(plan).toHaveLength(1);expect(plan[0].items.join(' ')).toContain('Return home');
 });
});
