"use client";
import Image from "next/image";
import Link from "next/link";
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
        node.textContent = `${Math.round(value * (1 - (1 - progress) ** 3))}${suffix}`;
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: .5 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value, suffix]);
  return <span aria-label={`${value}${suffix}`} ref={ref}>{value}{suffix}</span>;
}
export function MusicMilestones({ tracks, year }: { tracks: number; year: string | null }) {
  return <dl className="h4b-milestones" aria-label="H4B release snapshot"><div><dt>Reported first-month streams</dt><dd><CountUp value={6} suffix="M+" /></dd></div><div><dt>Tracks</dt><dd><CountUp value={tracks} /></dd></div><div><dt>Release year</dt><dd>{year && <CountUp value={Number(year)} />}</dd></div></dl>;
}
export function FeaturedArtists({ tracks }: { tracks: { id: string; title: string }[] }) {
  const [selected, setSelected] = useState<(typeof h4bFeatures)[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!selected) return;
    const node = dialog.current;
    const previous = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    if (node) node.scrollTop = 0;
    return () => { node?.close(); document.body.style.overflow = previous; origin.current?.focus({ preventScroll: true }); };
  }, [selected]);
  const close = () => setSelected(null);
  return <section className="h4b-features" aria-labelledby="h4b-features-title"><h2 id="h4b-features-title" className="eyebrow">Featured artists</h2><div className="h4b-feature-rail" role="region" aria-label="H4B featured artist photographs" tabIndex={0}><ul>{h4bFeatures.map(artist => <li key={artist.name}><button className="h4b-feature-button" aria-label={`Explore ${artist.name} on H4B`} onClick={event => { origin.current = event.currentTarget; setSelected(artist); }}><figure><Image src={artist.image} alt={`${artist.name} — supplied H4B featured artist card`} width={artist.width} height={artist.height} sizes="(max-width: 600px) 66vw, (max-width: 1000px) 29vw, 16vw" /><figcaption>{artist.name}</figcaption></figure></button></li>)}</ul></div><dialog ref={dialog} className="h4b-artist-dialog" aria-labelledby="featured-artist-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
    {selected && <div className="h4b-artist-content"><button className="close-button" autoFocus onClick={close} aria-label="Close featured artist">×</button><Image src={selected.image} alt={`${selected.name} H4B card`} width={selected.width} height={selected.height} sizes="(max-width: 700px) 85vw, 40vw" /><div><p className="eyebrow">HERE 4 BUSINESS / Featured artist</p><h2 id="featured-artist-title">{selected.name}</h2><p className="eyebrow">Appears on</p><ul>{tracks.filter(track => (selected.trackIds as readonly string[]).includes(track.id)).map(track => <li key={track.id}>{track.title}</li>)}</ul><Link href="/visuals" className="button" onClick={close}>Visuals <span aria-hidden="true">↗</span></Link></div></div>}
  </dialog></section>;
}
