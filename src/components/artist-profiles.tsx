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
  useEffect(() => {
    if (!artist) { dialog.current?.close(); origin.current?.focus(); return; }
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let tween: gsap.core.Tween | undefined;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) tween = gsap.fromTo(dialog.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: .4 });
    return () => { document.body.style.overflow = previous; tween?.kill(); };
  }, [artist]);
  const close = () => {
    if (historyEntry.current) { historyEntry.current = false; history.back(); }
    else { const url = new URL(location.href); url.searchParams.delete("artist"); history.replaceState(history.state, "", url); setSelected(null); }
  };
  return <><div className="artist-grid">{artists.map((item) => <button className="artist-card" key={item.slug} data-reveal onClick={(event) => { origin.current = event.currentTarget; history.pushState(history.state, "", `?artist=${item.slug}`); historyEntry.current = true; setSelected(item.slug); }} aria-label={`Open ${item.name} profile`}>
    <div className="artist-image"><Image src={item.portrait} alt={`${item.name}, supplied artist portrait`} fill sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 24vw" style={{ objectPosition: item.position }} /></div><div className="artist-info"><h2>{item.name}</h2><p className="eyebrow">{item.tagline}</p><span className="circle-plus" aria-hidden="true">+</span></div>
  </button>)}</div><dialog ref={dialog} className="artist-dialog" aria-labelledby="artist-title" onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === dialog.current) close(); }}>
    {artist && <div className="artist-detail"><button className="close-button" autoFocus onClick={close} aria-label="Close artist profile">×</button><div className="detail-image"><Image src={artist.portrait} alt={artist.name} fill sizes="(max-width: 700px) 90vw, 45vw" style={{ objectPosition: artist.position }} /></div><div className="detail-copy"><p className="eyebrow">The North Mob / The artist</p><h2 id="artist-title">{artist.name}</h2><p className="artist-quote">{artist.tagline}</p><p className="source-note">Artist’s supplied Spotify self-description.</p>{artist.bio && <p>{artist.bio}</p>}<button className="button" onClick={close}>Back to the Mob <span>←</span></button></div></div>}
  </dialog></>;
}
