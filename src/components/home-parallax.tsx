"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/animation";

export function HomeParallax() {
  const rings = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const words = rings.current?.closest(".home-hero")?.querySelectorAll(".home-word");
      if (words?.length) gsap.from(words, { yPercent: 115, opacity: 0, stagger: .16, duration: 1.15, delay: .1, ease: "power4.out", clearProps: "all" });
    });
    return () => media.revert();
  }, { scope: rings });

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = rings.current?.closest<HTMLElement>(".home-hero");
      if (!hero) return;
      const photo = hero.querySelector(".hero-photo-surface");
      const breathe = hero.querySelector(".ring-breathe");
      const sweep = hero.querySelector(".ring-sweep");
      const ambient = [
        gsap.fromTo(photo, { scale: 1.015, xPercent: 0 }, { scale: 1.035, xPercent: .7, duration: 16, repeat: -1, yoyo: true, ease: "sine.inOut" }),
        gsap.fromTo(breathe, { scale: .97, opacity: .45 }, { scale: 1.045, opacity: .95, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" }),
        gsap.to(sweep, { rotation: 360, duration: 24, repeat: -1, ease: "none" }),
      ];
      gsap.to(rings.current, { y: 50, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 } });
      const ringX = gsap.quickTo(rings.current, "x", { duration: 1.1, ease: "power2.out" });
      const ringTilt = gsap.quickTo(rings.current, "rotationY", { duration: 1.1 });
      const photoX = gsap.quickTo(hero.querySelector(".home-logo-heading"), "x", { duration: 1.4, ease: "power2.out" });
      const move = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        const depth = event.clientX / innerWidth - .5;
        ringX(depth * 36); photoX(depth * -14);
        ringTilt((event.clientY / innerHeight - .5) * 7);
      };
      const reset = () => { ringX(0); photoX(0); ringTilt(0); };
      const visibility = () => { ambient.forEach(tween => { if (document.hidden) tween.pause(); else tween.resume(); }); };
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerleave", reset);
      document.addEventListener("visibilitychange", visibility);
      visibility();
      return () => {
        hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", reset);
        document.removeEventListener("visibilitychange", visibility);
      };
    });
    return () => media.revert();
  }, { scope: rings, dependencies: [], revertOnUpdate: true });

  return <>
    <div className="home-rings" ref={rings} aria-hidden="true"><div className="ring-breathe">
      <svg viewBox="0 0 1000 1000">{Array.from({ length: 12 }, (_, i) => <circle key={i} cx="500" cy="500" r={275 + i * 17} />)}</svg>
      <div className="ring-sweep"><svg viewBox="0 0 1000 1000"><path d="M 500 38 A 462 462 0 0 1 962 500" /></svg></div>
    </div></div>
  </>;
}
