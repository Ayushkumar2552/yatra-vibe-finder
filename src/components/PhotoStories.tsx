import { ArrowDown, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
const stories = [
  { image: 'selfie-friends', line: 'Your people. Your glow.', alt: 'Two young women taking a beach selfie at sunset' },
  { image: 'mountain-friends', line: 'Go for the view.', alt: 'Male friends capturing mountain travel photos' },
  { image: 'timeless-memories', line: 'Some moments stay.', alt: 'An older couple taking a lakeside holiday selfie' },
];
export function PhotoStories() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduce = () => { if (motion.matches) setPlaying(false); };
    const visibility = () => setVisible(!document.hidden);
    reduce(); visibility();
    motion.addEventListener('change', reduce);
    document.addEventListener('visibilitychange', visibility);
    return () => { motion.removeEventListener('change', reduce); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (!playing || !visible) return;
    const timer = window.setInterval(() => setActive(i => (i + 1) % stories.length), 8000);
    return () => window.clearInterval(timer);
  }, [playing, visible]);
  return <section aria-label="Photo Spots slideshow" aria-roledescription="carousel" className="relative h-[92svh] min-h-[600px] w-full overflow-hidden bg-overlay">
    {stories.map((story, index) => <div key={story.image} aria-hidden={active !== index} data-active={active === index} className={`absolute inset-0 transition-opacity duration-[1600ms] motion-reduce:transition-none ${active === index ? 'opacity-100' : 'opacity-0'}`}>
      <img src={`/images/photo-stories/${story.image}.png`} alt={story.alt} width={1122} height={1402} className="absolute inset-0 size-full object-cover object-[50%_38%]" loading={index === 0 ? 'eager' : 'lazy'}/>
    </div>)}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/20"/>
    <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-28 pt-28 md:px-8 md:pb-32">
      <p className="text-lg font-medium text-white/90">{stories[active].line}</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-bold leading-[0.95] text-white sm:text-7xl md:text-8xl">Find your next<br/>favourite frame.</h1>
      <p className="mt-6 max-w-xl text-base text-white/85 md:text-lg">Beautiful backdrops. Your favourite people. Discover photo spots near you and make the moment yours.</p>
      <a href="#photo-spot-finder" className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-background px-6 py-3 font-semibold text-foreground">Explore photo spots <ArrowDown className="size-4"/></a>
    </div>
    <div className="absolute bottom-6 left-5 right-5 z-10 flex items-center justify-between gap-4 text-white md:left-8 md:right-8"><p className="max-w-[45%] text-[10px] text-white/70">AI-created travel inspiration</p><div className="flex items-center gap-3"><div className="flex gap-2">{stories.map((story,index)=><button key={story.image} onClick={()=>setActive(index)} aria-label={`Show photo ${index+1}`} aria-pressed={active===index} className="flex min-h-10 items-center px-1"><span className={`block h-1.5 rounded-full bg-white transition-all ${active===index?'w-8 opacity-100':'w-3 opacity-50'}`}/></button>)}</div><button onClick={()=>setPlaying(!playing)} aria-label={playing?'Pause slideshow':'Play slideshow'} className="grid size-10 place-items-center rounded-full border border-white/40 bg-black/20">{playing?<Pause className="size-4"/>:<Play className="size-4"/>}</button></div></div>
  </section>;
}
