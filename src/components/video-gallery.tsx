"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { links, reels } from "@/config/content";
import { gsap } from "@/lib/animation";

export function VideoGallery({ nativeVideoUrl, captionsUrl }: { nativeVideoUrl?: string; captionsUrl?: string }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) { dialog.current?.close(); return; }
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let tween: gsap.core.Tween | undefined;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) tween = gsap.fromTo(dialog.current, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .4 });
    return () => { document.body.style.overflow = previous; tween?.kill(); };
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return <><div className="visuals-grid"><div className="main-film" data-reveal><button className="film-poster" onClick={() => setOpen(true)} ref={trigger} aria-label="Play official THE NORTH MOB film"><Image src="/assets/group_close_face_hand.jpeg" alt="Official film poster, supplied THE NORTH MOB photograph" fill sizes="(max-width: 800px) 100vw, 66vw" priority /><span className="play-circle" aria-hidden="true">▷</span><span className="poster-caption"><span>THE NORTH MOB</span><small>Official film / Play</small></span></button><div className="photo-strip">{["group_wide", "group_close_both_hands", "group_close_glasses"].map((name, i) => <div className="strip-photo" key={name}><Image src={`/assets/${name}.jpeg`} alt={`THE NORTH MOB supplied photograph ${i + 1}`} fill sizes="(max-width: 800px) 30vw, 21vw" /></div>)}</div></div><aside className="reel-list" data-reveal><h2 className="eyebrow">From the collective / Reels</h2>{reels.map((reel, i) => <a className="reel" href={reel.url} target="_blank" rel="noreferrer" key={reel.url}><div className="reel-image"><Image src={reel.image} alt="" fill sizes="120px" /></div><div><h3>THE NORTH MOB</h3><p className="eyebrow">Instagram reel 0{i + 1}</p><span className="text-link">Watch on Instagram ↗</span></div></a>)}<a className="button" href={links.youtube} target="_blank" rel="noreferrer">View all videos <span>↗</span></a></aside></div><dialog ref={dialog} className="video-dialog" aria-labelledby="video-title" onCancel={(event) => { event.preventDefault(); close(); }} onClose={() => { setOpen(false); trigger.current?.focus(); }} onClick={(event) => { if (event.target === dialog.current) close(); }}>
    <div className="video-dialog-inner"><button className="close-button" autoFocus onClick={close} aria-label="Close video">×</button><h2 id="video-title" className="eyebrow">THE NORTH MOB / Official film</h2>{open && (nativeVideoUrl ? <video className="native-video" controls playsInline preload="metadata" poster="/assets/group_close_face_hand.jpeg" onError={() => { /* Browser controls and fallback link remain available. */ }}><source src={nativeVideoUrl} />{captionsUrl && <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />}Your browser does not support this video.</video> : <iframe title="THE NORTH MOB official YouTube film" src="https://www.youtube-nocookie.com/embed/on_eg9HLysA?rel=0&playsinline=1" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />)}<p className="source-note">{nativeVideoUrl ? "Use the player controls to begin playback." : "Playing connects to YouTube. YouTube controls and provider restrictions may apply."} <a href="https://youtu.be/on_eg9HLysA" target="_blank" rel="noreferrer">If playback is unavailable, watch on YouTube ↗</a></p></div>
  </dialog></>;
}
