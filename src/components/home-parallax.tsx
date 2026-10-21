"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/animation";

export function HomeParallax() {
  const rings = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = rings.current?.closest<HTMLElement>(".home-hero");
      if (!hero) return;
      gsap.to(rings.current, { y: 55, rotate: 8, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 } });
      const x = gsap.quickTo(rings.current, "x", { duration: .9 });
      const y = gsap.quickTo(rings.current, "rotationY", { duration: .9 });
      const move = (event: PointerEvent) => { if (event.pointerType === "touch") return; x((event.clientX / innerWidth - .5) * 20); y((event.clientY / innerHeight - .5) * 5); };
      const reset = () => { x(0); y(0); };
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerleave", reset);
      return () => { hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", reset); };
    });
    return () => media.revert();
  }, { scope: rings });
  return <div className="home-rings" ref={rings} aria-hidden="true"><svg viewBox="0 0 1000 1000">{Array.from({ length: 12 }, (_, i) => <circle key={i} cx="500" cy="500" r={275 + i * 17} />)}</svg></div>;
}
