import { overpassQuery, parseSpots, distanceKm, type Point, type PhotoSpot } from './spots';
import { fetchWikiSpots } from './wiki';
async function fetchMapSpots(point: Point, radius: number, timeout: number) {
 const controller = new AbortController(), timer=setTimeout(()=>controller.abort(),timeout);
 try {
  const response=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:overpassQuery(point,radius)}),signal:controller.signal});
  if(!response.ok)throw new Error('Map service unavailable');
  return parseSpots(await response.json(),point,radius);
 } finally {clearTimeout(timer);}
}
export function mergeSpots(wiki:PhotoSpot[],map:PhotoSpot[]) {
 const merged=[...wiki];
 for(const s of map){const match=merged.find(w=>w.name.toLowerCase()===s.name.toLowerCase()&&distanceKm(w,s)<.3);if(match){match.hours=s.hours;match.fee=s.fee;}else merged.push(s);}
 return merged.sort((a,b)=>b.score-a.score).slice(0,80);
}
export async function fetchPhotoSpots(point: Point, radius: number, timeout = 10000) {
 const [wiki,map]=await Promise.allSettled([fetchWikiSpots(point,radius,timeout),fetchMapSpots(point,radius,Math.min(timeout,6000))]);
 if(wiki.status==='rejected'&&map.status==='rejected')throw new Error('Place providers unavailable');
 const spots=mergeSpots(wiki.status==='fulfilled'?wiki.value:[],map.status==='fulfilled'?map.value:[]);
 return {spots,checkedAt:new Date().toISOString(),partial:wiki.status==='rejected'||map.status==='rejected'};
}
