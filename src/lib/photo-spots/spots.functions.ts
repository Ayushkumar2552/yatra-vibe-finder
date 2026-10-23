import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { verifiedUser } from '@/lib/auth/session.server';
import { fetchPhotoSpots } from './provider';
export const findPhotoSpots = createServerFn({method:'POST'})
 .inputValidator(z.object({lat:z.number().finite().min(-90).max(90),lon:z.number().finite().min(-180).max(180),radius:z.union([z.literal(2),z.literal(5),z.literal(10)])}))
 .handler(async ({data}) => {
   setResponseHeader('Cache-Control','private, no-store');
   if (!(await verifiedUser())) throw new Error('Please log in to find nearby photo spots.');
   // Approximate coordinates only; no location history is persisted.
   const point = {lat:Number(data.lat.toFixed(3)),lon:Number(data.lon.toFixed(3))};
   try { return { ...(await fetchPhotoSpots(point,data.radius,12000)), browserFallback:false as const }; }
   catch { return {spots:[],checkedAt:'',browserFallback:true as const}; }
 });
