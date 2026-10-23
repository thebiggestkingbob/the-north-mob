"use client";
import { useEffect, useRef, useState } from "react";

/** The supplied portrait film is silent. Desktop retains the approved photograph. */
export function CinemaHero() {
  const video = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = matchMedia("(max-width: 750px) and (prefers-reduced-motion: no-preference)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let intersecting = true;
    let disposed = false;
    const update = () => {
      if (!motion.matches || connection?.saveData || document.hidden || !intersecting) { element.pause(); setVisible(false); return; }
      if (!element.getAttribute("src")) element.src = "/assets/mob-ties/mob-ties-video-01.mp4";
      void element.play().then(() => { if (!disposed && motion.matches && !document.hidden && intersecting) setVisible(true); }).catch(() => { if (!disposed) setVisible(false); });
    };
    const observer = new IntersectionObserver(entries => { intersecting = entries[0].isIntersecting; update(); });
    observer.observe(element);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { disposed = true; observer.disconnect(); motion.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); element.pause(); };
  }, []);
  return <video ref={video} className={`cinema-film ${visible ? "is-visible" : ""}`} muted loop playsInline preload="none" aria-hidden="true" onError={() => setVisible(false)} />;
}
