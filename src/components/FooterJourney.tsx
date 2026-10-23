import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
const scenes = [
  { id:'float', title:'Slow down. Drift a little.', line:'Make room for the moments that ask nothing of you.' },
  { id:'coast', title:'There’s more to discover.', line:'Clear waters. New perspectives. A place that feels like you.' },
  { id:'sunset', title:'Follow the feeling.', line:'Your next favourite memory starts with a little curiosity.' },
];
export function FooterJourney() {
  const [active,setActive]=useState(0),[playing,setPlaying]=useState(true),[visible,setVisible]=useState(false),[tabVisible,setTabVisible]=useState(true),[blocked,setBlocked]=useState(false),[failed,setFailed]=useState(false);
  const host=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null);
  const scene=scenes[active];
  useEffect(()=>{
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduce=()=>{if(motion.matches)setPlaying(false);};reduce();motion.addEventListener('change',reduce);
    const visibility=()=>setTabVisible(!document.hidden);visibility();document.addEventListener('visibilitychange',visibility);
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.15});if(host.current)observer.observe(host.current);
    return ()=>{observer.disconnect();motion.removeEventListener('change',reduce);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  useEffect(()=>{
    const el=video.current;if(!el)return;
    if(playing&&visible&&tabVisible&&!failed){let cancelled=false;void el.play().catch(()=>{if(!cancelled)setBlocked(true);});return()=>{cancelled=true;el.pause();};}
    el.pause();
    return undefined;
  },[active,playing,visible,tabVisible,failed]);
  useEffect(()=>{if(!playing||!visible||!tabVisible||blocked||failed)return;const timer=window.setInterval(()=>{setFailed(false);setActive(i=>(i+1)%scenes.length);},8000);return()=>window.clearInterval(timer);},[playing,visible,tabVisible,blocked,failed]);
  const select=(index:number)=>{setFailed(false);setBlocked(false);setActive(index);};
  const toggle=()=>{if(playing&&!blocked){setPlaying(false);return;}setPlaying(true);setBlocked(false);void video.current?.play().catch(()=>setBlocked(true));};
  return <section ref={host} aria-label="Travel inspiration video slideshow" className="relative isolate w-full overflow-hidden bg-black text-white">
    <div className="relative aspect-video max-h-[75svh] min-h-[320px] w-full">
      <video key={scene.id} ref={video} src={visible?`/videos/footer/${scene.id}.mp4`:undefined} poster={`/videos/footer/${scene.id}.jpg`} muted playsInline loop preload="none" onPlaying={()=>setBlocked(false)} onError={()=>setFailed(true)} aria-label={`${scene.id} travel video`} className="absolute inset-0 size-full object-contain"/>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/>
      <div className="absolute inset-x-0 bottom-20 mx-auto max-w-[1400px] px-5 md:bottom-24 md:px-8"><p className="mb-3 text-xs font-semibold tracking-[.2em] text-white/80">LET YOUR NEXT CHAPTER BEGIN</p><h2 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">{scene.title}</h2><p className="mt-3 hidden max-w-xl text-base text-white/85 sm:block">{scene.line}</p></div>
      <div className="absolute inset-x-0 bottom-5 mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-5 md:px-8"><Link to="/explore" className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-semibold text-foreground">Explore more <ArrowUpRight className="size-4"/></Link><div className="flex items-center gap-1 sm:gap-3">{scenes.map((s,i)=><button key={s.id} className="grid min-h-10 min-w-7 place-items-center" aria-label={`Show ${s.id} video`} aria-pressed={active===i} onClick={()=>select(i)}><span className={`h-1.5 rounded-full bg-white ${active===i?'w-6':'w-2 opacity-50'}`}/></button>)}<button className="grid size-10 place-items-center rounded-full border border-white/50 bg-black/30" aria-label={playing&&!blocked?'Pause travel videos':'Play travel videos'} onClick={toggle}>{playing&&!blocked?<Pause className="size-4"/>:<Play className="size-4"/>}</button></div></div>
      {(blocked||failed)&&<p role="status" className="absolute left-5 top-4 rounded-lg bg-black/70 px-3 py-2 text-xs">{failed?'This video could not load. Choose another scene.':'Tap play to start the video.'}</p>}
    </div>
  </section>;
}
