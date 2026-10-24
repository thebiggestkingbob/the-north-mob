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
      const film = root.querySelector(".cinema-film");
      const movement = root.querySelector(".home-movement-scene");
      const release = root.querySelector(".home-release-scene");
      const openingTimeline = gsap.timeline({ scrollTrigger: { trigger: opening, start: "top top", end: "bottom top", scrub: 1 } });
      openingTimeline.to(film, { scale: 1.06, ease: "none" }, 0).to(root.querySelector(".home-opening-copy"), { opacity: 0, y: -35, ease: "none" }, 0);
      const editorial = gsap.timeline({ scrollTrigger: { trigger: movement, start: "top bottom", end: "bottom top", scrub: 1 } });
      editorial.fromTo(root.querySelector(".home-editorial-photo"), { yPercent: 14, rotation: -5 }, { yPercent: -14, rotation: 3, ease: "none" }, 0)
        .fromTo(root.querySelector(".home-statement span:first-child"), { xPercent: -10 }, { xPercent: 6, ease: "none" }, 0)
        .fromTo(root.querySelector(".home-statement span:last-child"), { xPercent: 10 }, { xPercent: -6, ease: "none" }, 0);
      gsap.fromTo(root.querySelector(".home-visuals-detail"), { yPercent: 16, rotation: 4 }, { yPercent: -12, rotation: -3, ease: "none", scrollTrigger: { trigger: root.querySelector(".home-visuals-scene"), start: "top bottom", end: "bottom top", scrub: 1 } });

      gsap.fromTo(root.querySelector(".home-release-art"), { yPercent: 12, rotation: 5 }, { yPercent: -7, rotation: -3, ease: "none", scrollTrigger: { trigger: release, start: "top bottom", end: "bottom bottom", scrub: 1 } });
    });
    return () => media.revert();
  }, { dependencies: [], revertOnUpdate: true });
  return <span ref={marker} hidden />;
}
