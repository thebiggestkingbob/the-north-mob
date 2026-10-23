"use client";
import Image from "next/image";
import { useClientReady } from "@/lib/use-client-ready";
import { useEffect, useRef, useState } from "react";
const photos = [5, 9, 11, 13, 22, 26, 30, 31, 32].map(number => ({ number, title: `Mob Ties / Photograph ${String(number).padStart(2, "0")}`, src: `/assets/mob-ties/mob-ties-${String(number).padStart(2, "0")}.webp` }));
export function PhotoArchive() {
  const interactive = useClientReady();
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const touchStart = useRef<number | null>(null);
  const current = selected === null ? null : photos[selected];
  useEffect(() => {
    if (selected !== null) dialog.current?.showModal();
    else { dialog.current?.close(); trigger.current?.focus(); }
  }, [selected]);
  const move = (direction: number) => setSelected(index => index === null ? null : (index + direction + photos.length) % photos.length);
  return <section id="photo-archive" className="photo-archive" aria-labelledby="archive-title"><div className="archive-heading"><h2 id="archive-title">Photo archive</h2></div><div className="archive-grid">{photos.map(photo => <button key={photo.number} className="archive-photo" disabled={!interactive} onClick={event => { trigger.current = event.currentTarget; setSelected(photos.indexOf(photo)); }} aria-label={`View ${photo.title}`}><Image src={photo.src} alt={photo.title} width={1500} height={2000} sizes="(max-width: 750px) 45vw, 30vw" /><span className="eyebrow">{photo.title}</span></button>)}</div><dialog ref={dialog} className="photo-dialog" aria-label="Photo archive viewer" onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onKeyDown={event => { if (event.key === "ArrowRight") move(1); if (event.key === "ArrowLeft") move(-1); }} onTouchStart={event => { touchStart.current = event.changedTouches[0].clientX; }} onTouchEnd={event => { if (touchStart.current === null) return; const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 60) move(delta < 0 ? 1 : -1); touchStart.current = null; }}><button className="close-button" autoFocus aria-label="Close photograph" onClick={() => setSelected(null)}>×</button>{current && <><Image src={current.src} alt={current.title} width={1500} height={2000} sizes="90vw" /><div className="photo-navigation"><button onClick={() => move(-1)} aria-label="Previous photograph">←</button><p aria-live="polite">{current.title}</p><button onClick={() => move(1)} aria-label="Next photograph">→</button></div></>}</dialog></section>;
}
