import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { verifiedUser } from '@/lib/auth/session.server';
import { toPreferences, validatePlannerSearch } from '@/lib/planner-params';
import { DESTINATIONS } from '@/data/destinations';
import { recommend } from './recommend';
const weather = z.object({ temp: z.number().finite(), lowTemp: z.number().finite().optional(), feelsLike: z.number().finite(), condition: z.string().max(50), humidity: z.number().finite(), precipitation: z.number().finite(), wind: z.number().finite(), updatedAt: z.string().max(50), source: z.enum(['live','forecast','unavailable']) });
export const runPlanner = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ search: z.record(z.unknown()), weather: z.record(weather).refine(w => Object.keys(w).length <= 60) }))
  .handler(async ({ data }) => {
    setResponseHeader('Cache-Control', 'private, no-store');
    if (!(await verifiedUser())) throw new Error('Please log in to use the AI planner.');
    const preferences = toPreferences(validatePlannerSearch(data.search), new Date().getMonth() + 1);
    if (!preferences) throw new Error('Please enter valid trip details.');
    return recommend(DESTINATIONS, preferences, data.weather);
  });
