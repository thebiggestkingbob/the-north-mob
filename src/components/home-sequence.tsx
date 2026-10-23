"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/animation";

/** Native document scrolling; sticky scenes provide a stage, never wheel interception. */
export function HomeSequence() {
  const marker = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const root = marker.current?.closest(".home-experience");
    if (!root) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const opening = root.querySelector(".home-cinema-scene");
      const film = root.querySelector(".home-film-aperture");
      const photo = root.querySelector(".hero-photo-surface");
      const movement = root.querySelector(".home-movement-scene");
      const release = root.querySelector(".home-release-scene");
      gsap.fromTo(film, { clipPath: "inset(7% 0% 7% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power3.out", clearProps: "clipPath" });
      const openingTimeline = gsap.timeline({ scrollTrigger: { trigger: opening, start: "top top", end: "bottom top", scrub: 1 } });
      openingTimeline.to(film, { scale: .78, y: -70, ease: "none" }, 0).to(photo, { scale: 1.13, yPercent: 6, ease: "none" }, 0).to(root.querySelector(".home-opening-copy"), { opacity: 0, y: -35, ease: "none" }, 0);
      const editorial = gsap.timeline({ scrollTrigger: { trigger: movement, start: "top bottom", end: "bottom top", scrub: 1 } });
      editorial.fromTo(root.querySelector(".home-editorial-photo"), { yPercent: 14, rotation: -5 }, { yPercent: -14, rotation: 3, ease: "none" }, 0)
        .fromTo(root.querySelector(".home-statement span:first-child"), { xPercent: -10 }, { xPercent: 6, ease: "none" }, 0)
        .fromTo(root.querySelector(".home-statement span:last-child"), { xPercent: 10 }, { xPercent: -6, ease: "none" }, 0);
      gsap.fromTo(root.querySelector(".home-release-art"), { yPercent: 12, rotation: 5 }, { yPercent: -7, rotation: -3, ease: "none", scrollTrigger: { trigger: release, start: "top bottom", end: "bottom bottom", scrub: 1 } });
    });
    return () => media.revert();
  }, { dependencies: [], revertOnUpdate: true });
  return <span ref={marker} hidden />;
}
