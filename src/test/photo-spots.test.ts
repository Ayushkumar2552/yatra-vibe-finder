import { describe,expect,it,vi } from 'vitest';
import {distanceKm,parseSpots,rankSpots,overpassQuery} from '@/lib/photo-spots/spots';
const origin={lat:18.922,lon:72.835};
const node=(id:number,tags:Record<string,string>,lat=18.923)=>({type:'node',id,lat,lon:72.835,tags});
describe('photo spot recommendations',()=>{
 it('uses real coordinates and rejects restricted, unnamed and distant places',()=>{const spots=parseSpots({elements:[node(1,{name:'Lookout',tourism:'viewpoint'}),node(2,{name:'Private',leisure:'park',access:'private'}),node(3,{tourism:'viewpoint'}),node(4,{name:'Far away',natural:'beach'},20),node(5,{name:'No photos',tourism:'artwork',photography:'no'})]},origin,5);expect(spots.map(s=>s.name)).toEqual(['Lookout']);expect(spots[0].distance).toBeCloseTo(.111,2);});
 it('handles way centres, deduplicates and filters styles',()=>{const spots=parseSpots({elements:[node(1,{name:'Garden',leisure:'garden'}),{type:'way',id:2,center:{lat:18.923,lon:72.835},tags:{name:'Garden',leisure:'garden'}},node(3,{name:'Artwork',tourism:'artwork'})]},origin,5);expect(spots).toHaveLength(2);expect(rankSpots(spots,'nature')[0].name).toBe('Garden');expect(rankSpots(spots,'scenic')).toEqual([]);});
 it('distinguishes empty maps from incomplete/error responses',()=>{expect(parseSpots({elements:[]},origin,5)).toEqual([]);expect(()=>parseSpots({remark:'timeout',elements:[]},origin,5)).toThrow();expect(()=>parseSpots({},origin,5)).toThrow();});
 it('builds bounded queries and measures straight-line distance',()=>{expect(overpassQuery(origin,2)).toContain('around:2000,18.922,72.835');expect(overpassQuery(origin,2)).toContain('out center tags 400');expect(distanceKm(origin,origin)).toBe(0);});
});
vi.mock('@tanstack/react-start',()=>({createServerFn:()=>({inputValidator:()=>({handler:(fn:unknown)=>fn})})}));
vi.mock('@tanstack/react-start/server',()=>({getRequestHeaders:()=>new Headers(),setResponseHeader:vi.fn()}));
import {findPhotoSpots} from '@/lib/photo-spots/spots.functions';
it('blocks anonymous direct server requests before fetching locations',async()=>{const fetch=vi.spyOn(globalThis,'fetch');await expect((findPhotoSpots as any)({data:{...origin,radius:5}})).rejects.toThrow('Please log in');expect(fetch).not.toHaveBeenCalled();fetch.mockRestore();});
