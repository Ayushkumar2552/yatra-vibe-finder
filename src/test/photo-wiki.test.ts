import {expect,it} from 'vitest';
import {parseWiki,wikiKind,safePhoto,fetchWikiSpots} from '@/lib/photo-spots/wiki';
const point={lat:18.922,lon:72.835};
it('adds mountain places and excludes unrelated institutions',()=>{expect(wikiKind('Snow Peak','Mountain in India')).toBe('Mountain');expect(wikiKind('Hill School','School in India')).toBeUndefined();});
it('uses the exact article photo and filters by actual distance',()=>{const s=parseWiki({query:{pages:{1:{pageid:1,title:'Gateway of India',description:'Landmark monument in Mumbai',coordinates:[point],thumbnail:{source:'https://upload.wikimedia.org/wikipedia/commons/a/ab/Test.jpg'},pageimage:'Test.jpg'},2:{pageid:2,title:'Far Peak',description:'Mountain in India',coordinates:[{lat:30,lon:80}]}}}},point,5);expect(s).toHaveLength(1);expect(s[0].image).toContain('Test.jpg');expect(s[0].photoPage).toContain('File:Test.jpg');expect(s[0].sourceUrl).toContain('curid=1');});
it('does not accept arbitrary image hosts',()=>{expect(safePhoto('https://example.com/a.jpg')).toBeUndefined();expect(safePhoto('javascript:alert(1)')).toBeUndefined();});
it('handles a valid empty response but rejects an API error',()=>{expect(parseWiki({batchcomplete:''},point,5)).toEqual([]);expect(()=>parseWiki({error:{}},point,5)).toThrow();});
it.skipIf(!process.env.PHOTO_LIVE)('loads actual Mumbai landmarks with photos',async()=>{const s=await fetchWikiSpots(point,5,15000);expect(s.find(p=>p.name==='Gateway of India')?.image).toBeTruthy();console.log('Verified live places:',s.slice(0,4).map(p=>p.name));},20000);
