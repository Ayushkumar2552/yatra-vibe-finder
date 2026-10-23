import { describe, expect, it } from 'vitest';
import { DESTINATIONS, getDestination, ORIGIN_CITIES } from '@/data/destinations';
import { recommend, scoreDestination, type Preferences } from '@/lib/engine/recommend';
import { UNAVAILABLE_WEATHER } from '@/lib/weather/types';
import { toPreferences, validatePlannerSearch } from '@/lib/planner-params';
import { estimate } from '@/lib/engine/estimate';
const prefs: Preferences = { origin: ORIGIN_CITIES[0], budget: 60000, travelers: 2, days: 5, vibes: ['beach'], climate: 'any', month: new Date().getMonth() + 1, transport: 'any', group: 'couple', useWeather: false };
const goa = getDestination('goa')!;
const storm = { ...UNAVAILABLE_WEATHER, source: 'live' as const, feelsLike: 40, temp: 40, condition: 'Thunderstorm', precipitation: 20 };
describe('recommendation accuracy and explanations', () => {
  it('honours weather-off for both factors and rules', () => {
    const a = scoreDestination(goa, prefs, UNAVAILABLE_WEATHER), b = scoreDestination(goa, prefs, storm);
    expect(a.match).toBe(b.match); expect(b.factors.weather).toBeNull(); expect(b.rules.some(r => r.id === 'R4')).toBe(false);
  });
  it('does not use today’s weather for another month', () => {
    const p = { ...prefs, useWeather: true, month: prefs.month % 12 + 1 };
    expect(scoreDestination(goa, p, storm).factors.weather).toBeNull();
  });
  it('counts every selected interest and excludes unselected ones', () => {
    const selected = ['beach', 'mountain', 'desert', 'spiritual'] as Preferences['vibes'];
    const r = scoreDestination(goa, { ...prefs, vibes: selected }, UNAVAILABLE_WEATHER);
    expect(r.factors.vibe).toBe(selected.filter(c => goa.categories.includes(c)).length / selected.length);
    expect(scoreDestination(goa, { ...prefs, vibes: [] }, UNAVAILABLE_WEATHER).factors.vibe).toBeNull();
  });
  it('flags island transport changes and budgets honestly', () => {
    const island = scoreDestination(getDestination('andaman')!, { ...prefs, transport: 'train' }, UNAVAILABLE_WEATHER);
    expect(island.eligible).toBe(false); expect(island.constraints.join(' ')).toContain('train alone');
    expect(scoreDestination(goa, { ...prefs, budget: 2000 }, UNAVAILABLE_WEATHER).eligible).toBe(false);
  });
  it('scores remain auditable after weights are redistributed', () => {
    const r = scoreDestination(goa, prefs, UNAVAILABLE_WEATHER);
    expect(Object.values(r.effectiveWeights).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    const score = Object.entries(r.factors).reduce((n, [k, v]) => n + (v ?? 0) * r.effectiveWeights[k as keyof typeof r.factors] * 100, 0);
    expect(r.match).toBe(Math.round(score)); expect(r.rules.every(rule => rule.effect === 0)).toBe(true);
    expect(r.description).toContain(goa.highlights[0]); expect(r.reasons.join(' ')).toContain('travellers');
  });
  it('ranks feasible trips first and handles missing weather maps', () => {
    const ranked = recommend(DESTINATIONS, prefs, {});
    expect(ranked.some(r => r.eligible)).toBe(true);
    const firstAlternative = ranked.findIndex(r => !r.eligible);
    if (firstAlternative >= 0) expect(ranked.slice(firstAlternative).every(r => !r.eligible)).toBe(true);
    expect(ranked.every(r => Number.isFinite(r.match))).toBe(true);
  });
  it('never treats driving hours as flight hours', () => {
    const e = estimate(goa, prefs.origin, 2, 5, 'flight', 'mid', { km: 2000, hours: 40, source: 'osrm' });
    expect(e.hours).not.toBe(40); expect(e.intercitySource).toBe('estimate');
  });
  it('validates URL inputs and deduplicates interests', () => {
    expect(toPreferences({ from: ORIGIN_CITIES[0].name, travelers: -3 }, 10)).toBeNull();
    const s = validatePlannerSearch({ from: ORIGIN_CITIES[0].name, vibes: 'beach,beach,fake', travelDate: '2027-02-10', month: 10 });
    const p = toPreferences(s, 10)!; expect(p.vibes).toEqual(['beach']); expect(p.month).toBe(2);
    expect(validatePlannerSearch({ budget: 'Infinity' }).budget).toBeUndefined();
  });
});
