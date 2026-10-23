export interface Point { lat: number; lon: number }
export type PhotoStyle = 'all' | 'mountains' | 'scenic' | 'nature' | 'heritage' | 'street';
export interface PhotoSpot extends Point { id: string; name: string; kind: string; style: PhotoStyle; distance: number; reason: string; tip: string; light: string; hours?: string; fee?: string; score: number; image?: string; photoPage?: string; photoCredit?: string; sourceUrl?: string }
export const profiles: Record<string, { style: PhotoStyle; reason: string; tip: string; light: string; priority: number }> = {
  Mountain: { style: 'mountains', reason: 'A mapped peak or hill offers mountain scenery; it is not a verified accessible photo viewpoint.', tip: 'Photograph the mountain from an established public viewpoint. A summit pin is not a safe route or an invitation to climb.', light: 'Clear daylight helps reveal layers and ridgelines. Check local weather and trail access.', priority: 28 },
  Viewpoint: { style: 'scenic', reason: 'Mapped as a viewpoint: a promising starting point for a wide landscape frame.', tip: 'Try a wide shot with a person or foreground detail for scale. Stay on the designated viewing area.', light: 'Try softer light near sunrise or sunset, if access allows.', priority: 30 },
  Beach: { style: 'scenic', reason: 'A mapped beach offers an open horizon and shoreline compositions.', tip: 'Keep the horizon level and use the shoreline as a leading line. Stay clear of surf and restricted areas.', light: 'Early or late daylight often gives softer light; the sun’s direction depends on the coast.', priority: 26 },
  Park: { style: 'nature', reason: 'A mapped park is a candidate for green backgrounds and relaxed outdoor portraits.', tip: 'Look for open shade and a clean background. A longer lens can separate your subject from foliage.', light: 'Open shade can work well for portraits during daylight.', priority: 20 },
  Garden: { style: 'nature', reason: 'A mapped garden offers potential for greenery, textures and close-up compositions.', tip: 'Frame your subject through foliage without entering planted or restricted areas.', light: 'Soft daylight works well; verify opening hours before visiting.', priority: 24 },
  Landmark: { style: 'heritage', reason: 'A mapped historic landmark can add architectural detail and a sense of place.', tip: 'Try symmetry or frame the building through an archway. Check local photography rules.', light: 'Side lighting can reveal textures; timing depends on the building’s orientation.', priority: 24 },
  Artwork: { style: 'street', reason: 'Mapped public artwork can provide a distinctive focal point for a street-style photo.', tip: 'Use a simple composition that keeps the artwork visible; respect people and photography restrictions.', light: 'Even daylight usually keeps colours and details readable.', priority: 22 },
};
export function distanceKm(a: Point, b: Point) { const rad = Math.PI / 180, x = Math.sin((b.lat-a.lat)*rad/2)**2 + Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin((b.lon-a.lon)*rad/2)**2; return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1,x))); }
export function spotKind(t: Record<string,string>): string | undefined { if (['peak','hill','volcano'].includes(t.natural)) return 'Mountain'; if (t.tourism === 'viewpoint') return 'Viewpoint'; if (t.natural === 'beach') return 'Beach'; if (t.leisure === 'garden') return 'Garden'; if (t.leisure === 'park') return 'Park'; if (t.tourism === 'artwork') return 'Artwork'; if (['castle','monument','memorial','ruins','archaeological_site'].includes(t.historic)) return 'Landmark'; return undefined; }
export function parseSpots(payload: unknown, point: Point, radius: number): PhotoSpot[] {
  const p = payload as { elements?: unknown[]; remark?: string } | null;
  if (!p || !Array.isArray(p.elements) || p.remark) throw new Error('The map provider could not complete this search. Please retry.');
  const spots: PhotoSpot[] = [];
  for (const value of p.elements) {
    const e = value as {type?:string;id?:number;lat?:number;lon?:number;center?:Point;tags?:Record<string,string>} | null;
    if (!e || !['node','way','relation'].includes(e.type ?? '') || !Number.isSafeInteger(e.id) || !e.tags) continue;
    const t = e.tags, kind = spotKind(t), name = t['name:en'] || t.name;
    if (!kind || typeof name !== 'string' || ['private','no','customers','permit'].includes(t.access) || ['private','no'].includes(t.foot) || t.photography === 'no' || t.disused === 'yes' || t.abandoned === 'yes') continue;
    const coords = e.type === 'node' ? {lat:e.lat!,lon:e.lon!} : e.center;
    if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lon) || Math.abs(coords.lat)>90 || Math.abs(coords.lon)>180) continue;
    const distance = distanceKm(point, coords);
    if (distance > radius) continue;
    if (spots.some(s => s.name.toLowerCase() === name.toLowerCase() && distanceKm(s,coords) < .15)) continue;
    const profile = profiles[kind];
    spots.push({ id:`${e.type}/${e.id}`,name:name.slice(0,160),...coords,kind,style:profile.style,distance,reason:profile.reason,tip:profile.tip,light:profile.light,hours:typeof t.opening_hours === 'string' ? t.opening_hours.slice(0,180) : undefined,fee: t.fee === 'yes' ? 'Entry fee listed' : t.fee === 'no' ? 'No entry fee listed' : undefined,score:profile.priority + 40 * Math.max(0,1-distance/radius) });
  }
  return spots.sort((a,b)=>b.score-a.score || a.distance-b.distance).slice(0,80);
}
export function rankSpots(spots: PhotoSpot[], style: PhotoStyle) { return spots.filter(s=>style==='all'||s.style===style).sort((a,b)=>b.score-a.score || a.distance-b.distance).slice(0,12); }
export function overpassQuery(p: Point, radius: number) { const around = `(around:${radius*1000},${p.lat.toFixed(3)},${p.lon.toFixed(3)})`; return `[out:json][timeout:20];(nwr${around}[tourism~"^(viewpoint|artwork)$"];nwr${around}[leisure~"^(park|garden)$"];nwr${around}[natural~"^(beach|peak|hill|volcano)$"];nwr${around}[historic~"^(castle|monument|memorial|ruins|archaeological_site)$"];);out center tags 400;`; }
