"use client";
import Image from "next/image";
import { useSoundtrack } from "./soundtrack";
import { useEffect, useRef, useState } from "react";
import { h4bFeatures } from "@/config/h4b-features";

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1800, 1);
        node.textContent = `${(value * (1 - (1 - progress) ** 3)).toFixed(Number.isInteger(value)?0:1)}${suffix}`;
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: .5 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value, suffix]);
  return <span aria-label={`${value}${suffix}`} ref={ref}>{value}{suffix}</span>;
}
export function MusicMilestones() {
  return <dl className="h4b-milestones" aria-label="Music milestones"><div><dt>Reported first-month streams</dt><dd><CountUp value={6} suffix="M+" /></dd></div><div><dt>Spotify monthly listeners</dt><dd><CountUp value={100} suffix="k+" /></dd></div><div><dt>Total YouTube streams</dt><dd><CountUp value={1.5} suffix="M+" /></dd></div><div><dt>Shazams</dt><dd><CountUp value={30} suffix="k+" /></dd></div></dl>;
}
export function MusicPlatforms() {
 return <nav className="music-platforms" aria-label="Listen on streaming platforms"><a href="https://open.spotify.com/artist/0iZ4kkTa0bDsMz9Qgrr0zx?si=5ujaCM30Swmp9xFoWnA4yg" target="_blank" rel="noreferrer"><svg role="img" aria-label="Spotify logo" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><circle cx="12" cy="12" r="12"/><g fill="none" stroke="var(--black)" strokeWidth="1.5" strokeLinecap="round"><path d="M5 8c5-2 10-1 14 1M6 12c4-1.5 8-1 12 1M7 16c3-1 6-.5 9 1"/></g></svg>Spotify ↗</a><a href="https://music.apple.com/us/artist/the-northmob/6775437164" target="_blank" rel="noreferrer"><svg role="img" aria-label="Apple Music logo" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M9 5v12.2a3.5 2.7 0 1 1-2-2.4V5l14-3v13.2a3.5 2.7 0 1 1-2-2.4V6L9 8Z"/></svg>Apple Music ↗</a></nav>;
}
export function FeaturedArtists({ tracks }: { tracks: { id: string; title: string }[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null), rail = useRef<HTMLDivElement>(null);
  const origin = useRef<HTMLButtonElement | null>(null);
  const sound = useSoundtrack(), activeIndex = useRef(0);
  const open = selected !== null;
  useEffect(() => {
    if (!open) return;
    const node = dialog.current, previous = document.body.style.overflow;
    node?.showModal(); document.body.style.overflow = "hidden";
    return () => { node?.close(); document.body.style.overflow = previous; origin.current?.focus({ preventScroll: true }); };
  }, [open]);
  useEffect(() => { if(selected!==null&&rail.current)rail.current.scrollTo({left:selected*rail.current.clientWidth,behavior:"instant"}); },[selected]);
  const close = () => setSelected(null);
  const browse=(direction:number)=>{const next=(activeIndex.current+direction+h4bFeatures.length)%h4bFeatures.length;activeIndex.current=next;rail.current?.scrollTo({left:next*rail.current.clientWidth,behavior:"instant"});};
  return <section className="h4b-features" aria-labelledby="h4b-features-title"><h2 id="h4b-features-title" className="eyebrow">Featured artists</h2><div className="h4b-feature-rail" role="region" aria-label="H4B featured artist photographs" tabIndex={0}><ul>{h4bFeatures.map((artist,index) => <li key={artist.name}><button className="h4b-feature-button" aria-label={`Explore ${artist.name} on H4B`} onClick={event => { origin.current = event.currentTarget; activeIndex.current=index; setSelected(index); }}><figure><Image src={artist.image} alt={`${artist.name} — supplied H4B featured artist card`} width={artist.width} height={artist.height} sizes="(max-width: 600px) 66vw, (max-width: 1000px) 29vw, 16vw" /><figcaption>{artist.name}</figcaption></figure></button></li>)}</ul></div><dialog ref={dialog} className="h4b-artist-dialog" aria-label="H4B featured artists" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
    <div className="artist-view-controls"><button className="button" onClick={()=>browse(-1)}>← Previous artist</button><button className="button" onClick={()=>browse(1)}>Next artist →</button><button className="button" autoFocus onClick={close} aria-label="Close featured artist">Close ×</button></div>
    {open && <div ref={rail} className="featured-artist-slides" onScroll={event=>{activeIndex.current=Math.round(event.currentTarget.scrollLeft/event.currentTarget.clientWidth);}} role="region" aria-label="Swipe featured artists" tabIndex={0} onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();browse(event.key==="ArrowRight"?1:-1);}}}>{h4bFeatures.map(artist=><article className="h4b-artist-content" key={artist.name} aria-label={artist.name}><Image src={artist.image} alt={`${artist.name} H4B card`} width={artist.width} height={artist.height} sizes="(max-width: 700px) 85vw, 40vw" /><div><p className="eyebrow">HERE 4 BUSINESS / Featured artist</p><h2>{artist.name}</h2><p className="eyebrow">Appears on</p><ul>{tracks.filter(track => (artist.trackIds as readonly string[]).includes(track.id)).map(track => {const playable=sound.tracks.find(item=>item.id===track.id), playing=!!playable?.uri&&sound.currentUri===playable.uri&&sound.status==="playing";return <li key={track.id}><button className={`button ${playing?"is-playing":""}`} disabled={!playable?.uri} onClick={()=>playing?sound.pause():sound.play(playable?.uri)}>{playing?"Pause":"Play"} {track.title} {playing?"Ⅱ":"▷"}</button>{!playable?.uri&&<p className="source-note">Spotify track playback is temporarily unavailable.</p>}</li>;})}</ul></div></article>)}</div>}
  </dialog></section>;
}
