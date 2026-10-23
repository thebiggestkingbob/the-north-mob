import type { Metadata } from "next";
import Image from "next/image";
import { links } from "@/config/content";
export const metadata: Metadata = { title: "Shop" };
export default function Shop() {
  return <main id="main" className="page shop-page"><figure className="shop-backdrop"><Image src="/assets/mob-ties/mob-ties-26.webp" alt="Mob Ties editorial photograph" fill priority sizes="100vw" /></figure><p className="eyebrow">THE NORTH MOB / SHOP</p><h1 tabIndex={-1} className="shop-title">SHOP</h1><div className="shop-empty"><p>No products announced.</p><a className="cinematic-link" href={links.instagram} target="_blank" rel="noreferrer">Follow the collective <span aria-hidden="true">↗</span></a><p className="eyebrow">Join the mailing list below for North Mob updates.</p></div><div className="shop-mark"><Image src="/assets/official-logo-transparent.png" alt="THE NORTH MOB" width={1983} height={793} sizes="(max-width: 750px) 55vw, 26vw" /></div><p className="shop-photo-credit eyebrow">MOB TIES / EDITORIAL PHOTOGRAPHY</p></main>;
}
