import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchProviderWeather, fetchResilientWeather, parseReading, weatherMode } from '@/lib/weather/provider';
import { UNAVAILABLE_WEATHER } from '@/lib/weather/types';
const points = [{ id: 'goa', lat: 15.5, lon: 73.8 }, { id: 'manali', lat: 32.2, lon: 77.2 }];
const row = (temp: number) => ({ current: { temperature_2m: temp, apparent_temperature: temp, relative_humidity_2m: 60, precipitation: 0, weather_code: 0, wind_speed_10m: 5, time: '2026-10-21T12:00' } });
afterEach(() => vi.unstubAllGlobals());
describe('weather transport', () => {
  it('maps one batch response to the correct destinations', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify([row(28), row(12)]))); vi.stubGlobal('fetch', fetch);
    const result = await fetchProviderWeather(points);
    expect(fetch).toHaveBeenCalledTimes(1); expect(decodeURIComponent(fetch.mock.calls[0][0])).toContain('latitude=15.5,32.2');
    expect(result.results.goa.temp).toBe(28); expect(result.results.manali.temp).toBe(12);
  });
  it('uses browser data when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(row(28)))));
    const fallback = vi.fn().mockRejectedValue(new Error('server down'));
    expect((await fetchResilientWeather(points.slice(0, 1), undefined, fallback)).results.goa.source).toBe('live'); expect(fallback).not.toHaveBeenCalled();
  });
  it('uses server fallback when the browser request is blocked', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const fallback = vi.fn().mockResolvedValue({ live: true, results: { goa: parseReading(row(29), 'current') } });
    expect((await fetchResilientWeather(points.slice(0, 1), undefined, fallback)).results.goa.temp).toBe(29); expect(fallback).toHaveBeenCalledOnce();
  });
  it('rejects unavailable responses so query retries and error state work', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(fetchResilientWeather(points.slice(0, 1), undefined, async () => ({ live: false, results: { goa: UNAVAILABLE_WEATHER } }))).rejects.toThrow('unavailable');
  });
  it('rejects malformed readings rather than inventing zeros', () => expect(parseReading({ current: { temperature_2m: null } }, 'current').source).toBe('unavailable'));
  it('uses India date and excludes day 16 and past dates', () => {
    const now = new Date('2026-10-20T20:00:00Z');
    expect(weatherMode('2026-10-21', now)).toBe('current'); expect(weatherMode('2026-10-20', now)).toBe('out-of-range'); expect(weatherMode('2026-11-05', now)).toBe('forecast'); expect(weatherMode('2026-11-06', now)).toBe('out-of-range');
  });
});
