import { distanceKm, profiles, type Point, type PhotoSpot } from './spots';
export function wikiKind(title: string, description: string) {
 const text=`${title} ${description}`.toLowerCase();
 if (/\b(school|university|hospital|railway station|company|district|constituency)\b/.test(description.toLowerCase())) return undefined;
 if (/\bhill station\b/.test(description.toLowerCase())) return undefined;
 if (/\b(mountain|peak|hill|volcano|summit)\b/.test(text)) return 'Mountain';
 if (/\b(beach|seafront|waterfront|promenade)\b/.test(text)) return 'Beach';
 if (/\b(garden|botanical)\b/.test(text)) return 'Garden';
 if (/\b(park|waterfall|lake|forest)\b/.test(text)) return 'Park';
 if (/\b(viewpoint|lookout)\b/.test(text)) return 'Viewpoint';
 if (/\b(monument|memorial|fort|castle|palace|temple|mosque|cathedral|church|museum|historic|heritage|landmark)\b/.test(text)) return 'Landmark';
 if (/\b(sculpture|statue|mural|artwork)\b/.test(text)) return 'Artwork';
 return undefined;
}
export function safePhoto(url: unknown): string | undefined {try {const u=new URL(String(url));return u.protocol==='https:'&&['upload.wikimedia.org','thumb.wikimedia.org'].includes(u.hostname)?u.href:undefined;}catch{return undefined;}}
export function parseWiki(payload:any,point:Point,radius:number):PhotoSpot[] {
 if(!payload||payload.error||(!payload.query&&!Object.hasOwn(payload,'batchcomplete')))throw new Error('Place search unavailable');
 const spots:PhotoSpot[]=[];
 for(const page of Object.values(payload.query?.pages??{}) as any[]){
  if(typeof page.title!=='string'||!Number.isSafeInteger(page.pageid))continue;
  const coords=page.coordinates?.[0],kind=wikiKind(page.title,page.description??'');
  if(!kind||!coords||!Number.isFinite(coords.lat)||!Number.isFinite(coords.lon))continue;
  const distance=distanceKm(point,coords);if(distance>radius)continue;
  const profile=profiles[kind],image=safePhoto(page.thumbnail?.source);
  spots.push({id:`wiki/${page.pageid}`,name:page.title,lat:coords.lat,lon:coords.lon,kind,style:profile.style,distance,score:profile.priority+40*Math.max(0,1-distance/radius),reason:page.description?`${page.description}. A candidate for ${profile.style==='mountains'?'mountain scenery':profile.style+' photography'}.`:profile.reason,tip:profile.tip,light:profile.light,sourceUrl:`https://en.wikipedia.org/?curid=${page.pageid}`,image,photoPage:page.pageimage?`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(page.pageimage)}`:undefined,photoCredit:image?'Wikimedia Commons · see photo source for creator and licence':undefined});
 }
 return spots.sort((a,b)=>b.score-a.score);
}
export async function fetchWikiSpots(point:Point,radius:number,timeout=10000){
 const params=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'geosearch',ggscoord:`${point.lat}|${point.lon}`,ggsradius:String(Math.min(10000,radius*1000)),ggslimit:'50',prop:'coordinates|pageimages|description',piprop:'thumbnail|name',pilicense:'free',pithumbsize:'600'});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try {const response=await fetch(`https://en.wikipedia.org/w/api.php?${params}`,{signal:controller.signal});if(!response.ok)throw new Error('Place search unavailable');const spots=parseWiki(await response.json(),point,radius);
  const photographed=spots.filter(s=>s.image&&s.photoPage).slice(0,30);
  if(photographed.length){
   try {
    const files=photographed.map(s=>decodeURIComponent(s.photoPage!.split('/wiki/')[1]));
    const query=new URLSearchParams({action:'query',format:'json',origin:'*',titles:files.join('|'),prop:'imageinfo',iiprop:'extmetadata',iiextmetadatafilter:'Artist|LicenseShortName'});
    const credits=await fetch(`https://en.wikipedia.org/w/api.php?${query}`,{signal:controller.signal});
    if(credits.ok){const data=await credits.json();const rows=Object.values(data.query?.pages??{}) as any[];for(const spot of photographed){const title=decodeURIComponent(spot.photoPage!.split('/wiki/')[1]).replaceAll('_',' ');const info=rows.find(r=>r.title===title)?.imageinfo?.[0]?.extmetadata;const clean=(s:string)=>s.replace(/<[^>]*>/g,'').replace(/&[^;]+;/g,' ').trim().slice(0,180);if(info?.Artist?.value&&info?.LicenseShortName?.value)spot.photoCredit=`${clean(info.Artist.value)} · ${clean(info.LicenseShortName.value)} · Wikimedia Commons`;}}
   }catch{/* Keep a link to the original image and its licence when metadata is unavailable. */}
  }
  return spots;}finally{clearTimeout(timer);}
}
