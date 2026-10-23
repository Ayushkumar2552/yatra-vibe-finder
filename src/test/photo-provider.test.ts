import {afterEach,expect,it,vi} from 'vitest';
vi.mock('@/lib/photo-spots/wiki',()=>({fetchWikiSpots:vi.fn().mockRejectedValue(new Error('unavailable'))}));
import {fetchPhotoSpots} from '@/lib/photo-spots/provider';
afterEach(()=>vi.unstubAllGlobals());
it('sends an approximate-point query and parses mapped places',async()=>{const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({elements:[{type:'node',id:1,lat:18.923,lon:72.835,tags:{name:'Mapped viewpoint',tourism:'viewpoint'}}]})});vi.stubGlobal('fetch',fetch);const result=await fetchPhotoSpots({lat:18.922,lon:72.835},5);expect(result.spots[0].name).toBe('Mapped viewpoint');expect(fetch.mock.calls[0][1].method).toBe('POST');expect(fetch.mock.calls[0][1].body.get('data')).toContain('around:5000,18.922,72.835');});
it('rejects provider failures instead of inventing spots',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false}));await expect(fetchPhotoSpots({lat:0,lon:0},2)).rejects.toThrow('unavailable');});
