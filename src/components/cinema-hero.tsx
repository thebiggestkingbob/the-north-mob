"use client";
import { useEffect, useRef, useState } from "react";

/** First-party silent footage. Its portrait frame remains intact on desktop and mobile. */
export function CinemaHero() {
  const video = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let intersecting = true, disposed = false;
    const update = () => {
      const permitted = motion.matches && !connection?.saveData;
      setAllowed(permitted);
      if (!permitted || paused || document.hidden || !intersecting) { element.pause(); return; }
      if (!element.getAttribute("src")) element.src = "/assets/mob-ties/mob-ties-video-01.mp4";
      void element.play().then(() => { if (!disposed && motion.matches && !document.hidden && intersecting) setVisible(true); }).catch(() => { if (!disposed) setVisible(false); });
    };
    const observer = new IntersectionObserver(entries => { intersecting = entries[0].isIntersecting; update(); });
    observer.observe(element);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { disposed = true; observer.disconnect(); motion.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); element.pause(); };
  }, [paused]);
  return <><video ref={video} className={`cinema-film ${visible ? "is-visible" : ""}`} muted loop playsInline preload="none" aria-hidden="true" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setVisible(false); setPlaying(false); }} />{allowed && <button className="home-film-control" onClick={() => { if (playing) setPaused(true); else { setPaused(false); void video.current?.play().then(() => setVisible(true)).catch(() => setVisible(false)); } }} aria-label={playing ? "Pause background film" : "Play background film"}>{playing ? "Pause film Ⅱ" : "Play film ▷"}</button>}</>;
}
