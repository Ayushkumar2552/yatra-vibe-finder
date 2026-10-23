import { z } from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { fetchProviderWeather } from './provider';
import { UNAVAILABLE_WEATHER } from './types';
export type { WeatherPoint } from './provider';
export const fetchLiveWeather = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    points: z.array(z.object({ id: z.string().min(1).max(100), lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) })).max(60),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, 'Invalid date').optional(),
  }))
  .handler(async ({ data }) => {
    try { return await fetchProviderWeather(data.points, data.date); }
    catch (error) {
      const message = error instanceof Error && error.message.startsWith('Weather provider') ? error.message : 'The server could not reach the weather provider.';
      return { live: false, results: Object.fromEntries(data.points.map(p => [p.id, { ...UNAVAILABLE_WEATHER }])), error: message };
    }
  });
