import { ShopMotion } from "@/components/shop-motion";
import type { Metadata } from "next";
import Image from "next/image";
import { links } from "@/config/content";
export const metadata: Metadata = { title: "Shop" };
export default function Shop() {
  return <ShopMotion><main id="main" className="page shop-page"><figure className="shop-backdrop"><Image src="/assets/mob-ties/mob-ties-26.webp" alt="Mob Ties editorial photograph" fill priority sizes="100vw" /></figure><p className="eyebrow">THE NORTH MOB / SHOP</p><div className="shop-identity"><h1 tabIndex={-1} className="shop-title">SHOP</h1><div className="shop-mark"><Image src="/assets/official-logo-transparent.png" alt="THE NORTH MOB" width={1983} height={793} sizes="(max-width: 750px) 55vw, 26vw" /></div></div><div className="shop-empty"><h2>Coming soon.</h2><p>No products announced.</p><a className="cinematic-link" href={links.instagram} target="_blank" rel="noreferrer">Follow the collective </a><p className="eyebrow">Get North Mob updates in the footer.</p></div><p className="shop-photo-credit eyebrow">MOB TIES / EDITORIAL PHOTOGRAPHY</p></main></ShopMotion>;
}
