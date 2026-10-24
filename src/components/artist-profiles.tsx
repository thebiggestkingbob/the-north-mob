"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PublicArtist } from "@/lib/studio/artists";
import { gsap } from "@/lib/animation";

export function ArtistProfiles({ artists }: { artists: PublicArtist[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const historyEntry = useRef(false);
  const artist = artists.find((item) => item.slug === selected);
  useEffect(() => {
    const sync = () => { setSelected(new URLSearchParams(location.search).get("artist")); };
    sync(); window.addEventListener("popstate", sync);
    return () => { window.removeEventListener("popstate", sync); };
  }, []);
  const open = !!artist;
  useEffect(() => {
    if (!open) { dialog.current?.close(); origin.current?.focus(); return; }
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let tween: gsap.core.Tween | undefined;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) tween = gsap.fromTo(dialog.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: .4 });
    return () => { document.body.style.overflow = previous; tween?.kill(); };
  }, [open]);
  const close = () => {
    if (historyEntry.current) { historyEntry.current = false; history.back(); }
    else { const url = new URL(location.href); url.searchParams.delete("artist"); history.replaceState(history.state, "", url); setSelected(null); }
  };
  const browse = (direction: number) => { const index = artists.findIndex(item => item.slug === selected); const next = artists[(index + direction + artists.length) % artists.length]; if (!next) return; const url = new URL(location.href); url.searchParams.set("artist", next.slug); history.replaceState(history.state, "", url); setSelected(next.slug); if (dialog.current) dialog.current.scrollTop = 0; };
  return <><div className="artist-grid">{artists.map((item) => <button className="artist-card" key={item.slug} data-reveal onClick={(event) => { origin.current = event.currentTarget; history.pushState(history.state, "", `?artist=${item.slug}`); historyEntry.current = true; setSelected(item.slug); }} aria-label={`Open ${item.name} profile`}>
    <div className="artist-image"><Image src={item.portrait} alt={`${item.name}, supplied artist portrait`} fill sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 24vw" style={{ objectPosition: item.position }} /></div><div className="artist-info"><h2>{item.name}</h2><span className="circle-plus" aria-hidden="true">+</span></div>
  </button>)}</div><dialog ref={dialog} className="artist-dialog" aria-labelledby="artist-title" onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === dialog.current) close(); }}>
    {artist && <><nav className="artist-view-controls" aria-label="Browse the Mob"><button className="button" onClick={()=>browse(-1)}>← Previous artist</button><button className="button" onClick={()=>browse(1)}>Next artist →</button><button className="button" autoFocus aria-label="Close artist profile" onClick={close}>Close ×</button></nav><div className="artist-detail"><div className="detail-image"><Image src={artist.portrait} alt={artist.name} fill sizes="(max-width: 700px) 90vw, 45vw" style={{ objectPosition: artist.position }} /></div><div className="detail-copy"><p className="eyebrow">The North Mob / The artist</p><h2 id="artist-title">{artist.name}</h2><button className="button" onClick={close}>Back to the Mob </button></div></div></>}
  </dialog></>;
}
