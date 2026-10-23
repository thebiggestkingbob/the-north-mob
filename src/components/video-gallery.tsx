"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { links, reels } from "@/config/content";
import { useClientReady } from "@/lib/use-client-ready";
import { gsap } from "@/lib/animation";

type Film = "official" | "mob-ties";
export function VideoGallery({ nativeVideoUrl, captionsUrl }: { nativeVideoUrl?: string; captionsUrl?: string }) {
  const interactive = useClientReady();
  const [selected, setSelected] = useState<Film | null>(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!selected) { dialog.current?.close(); return; }
    window.dispatchEvent(new Event("northmob:video-open"));
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let tween: gsap.core.Tween | undefined;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) tween = gsap.fromTo(dialog.current, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .4 });
    return () => { document.body.style.overflow = previous; tween?.kill(); };
  }, [selected]);
  const close = () => { setSelected(null); trigger.current?.focus(); };
  const open = (film: Film, button: HTMLButtonElement) => { trigger.current = button; setSelected(film); };
  const matches = (title: string) => title.toLowerCase().includes(query.toLowerCase());
  const officialVisible = filter !== "Reels" && matches("THE NORTH MOB Official film");
  const mobTiesVisible = filter !== "Reels" && matches("Mob Ties film");
  const visibleReels = filter === "Films" ? [] : reels.filter((_, index) => matches(`THE NORTH MOB Instagram reel ${String(index + 1).padStart(2, "0")}`));
  const source = selected === "mob-ties" ? "/assets/mob-ties/mob-ties-video-01.mp4" : nativeVideoUrl;
  const title = selected === "mob-ties" ? "MOB TIES / Film" : "THE NORTH MOB / Official film";
  return <section className="visual-library" id="films" aria-label="Films and reels"><div className="visual-library-tools"><div className="visual-library-filters" aria-label="Filter moving image">{["All", "Films", "Reels"].map(value => <button key={value} type="button" disabled={!interactive} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}<a href="#photo-archive" className="cinematic-link">Photography ↓</a></div><label>Search films and reels<input type="search" disabled={!interactive} value={query} onChange={event => setQuery(event.target.value)} placeholder="Film or reel title" /></label></div><div className="visuals-grid">
    {officialVisible && <div className="main-film" data-reveal><button className="film-poster" disabled={!interactive} onClick={event => open("official", event.currentTarget)} aria-label="Play official THE NORTH MOB film"><Image src="/assets/group_close_face_hand.jpeg" alt="Official film poster, supplied THE NORTH MOB photograph" fill sizes="100vw" priority /><span className="play-circle" aria-hidden="true">▷</span><span className="poster-caption"><span>THE NORTH MOB</span><small>01 / Official film</small></span></button></div>}
    {mobTiesVisible && <section className="visual-film-secondary"><div className="visual-film-copy"><p className="eyebrow">02 / FILM</p><h2>MOB<br />TIES</h2><p>THE NORTH MOB.<br />Silent film.</p><a className="cinematic-link" href="#photo-archive">Explore the photographs <span aria-hidden="true">↓</span></a></div><button className="film-poster" disabled={!interactive} onClick={event => open("mob-ties", event.currentTarget)} aria-label="Play Mob Ties film"><Image src="/assets/mob-ties/hero-film-poster.webp" alt="Still from the supplied Mob Ties film" fill sizes="(max-width: 750px) 75vw, 40vw" /><span className="play-circle" aria-hidden="true">▷</span><span className="poster-caption"><small>MOB TIES / Play</small></span></button></section>}
    {visibleReels.length > 0 && <aside className="reel-list"><h2 className="eyebrow">From the collective / Reels</h2>{visibleReels.map(reel => { const number = reels.indexOf(reel) + 1; return <a className="reel" href={reel.url} target="_blank" rel="noreferrer" key={reel.url}><div className="reel-image"><Image src={reel.image} alt="" fill sizes="(max-width: 750px) 100px, 30vw" /></div><div><h3>THE NORTH MOB</h3><p className="eyebrow">Instagram reel {String(number).padStart(2, "0")}</p><span className="text-link">Watch on Instagram ↗</span></div></a>; })}<a className="cinematic-link" href={links.youtube} target="_blank" rel="noreferrer">View all videos <span>↗</span></a></aside>}
    {!officialVisible && !mobTiesVisible && visibleReels.length === 0 && <p role="status">No films or reels match your search.</p>}
    </div><dialog ref={dialog} className="video-dialog" aria-labelledby="video-title" onCancel={event => { event.preventDefault(); close(); }} onClose={() => { setSelected(null); trigger.current?.focus(); }} onClick={event => { if (event.target === dialog.current) close(); }}><div className="video-dialog-inner"><button className="close-button" autoFocus onClick={close} aria-label="Close video">×</button><h2 id="video-title" className="eyebrow">{title}</h2>{selected && (source ? <video className={`native-video ${selected === "mob-ties" ? "is-portrait" : ""}`} controls playsInline preload="metadata" autoPlay={selected === "mob-ties"} muted={selected === "mob-ties"} poster={selected === "mob-ties" ? "/assets/mob-ties/hero-film-poster.webp" : "/assets/group_close_face_hand.jpeg"}><source src={source} type={selected === "mob-ties" ? "video/mp4" : undefined} />{selected === "official" && captionsUrl && <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />}Your browser does not support this video.</video> : <iframe title="THE NORTH MOB official YouTube film" src="https://www.youtube-nocookie.com/embed/on_eg9HLysA?rel=0&playsinline=1" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />)}<p className="source-note">{selected === "mob-ties" ? "Silent Mob Ties film. Use the player controls to pause or resume." : source ? "Use the player controls to begin playback." : "Playing connects to YouTube. YouTube controls and provider restrictions may apply."} {selected === "official" && <a href="https://youtu.be/on_eg9HLysA" target="_blank" rel="noreferrer">If playback is unavailable, watch on YouTube ↗</a>}</p></div></dialog></section>;
}
