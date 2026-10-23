import type { Metadata } from "next";
import { links } from "@/config/content";
export const metadata: Metadata = { title: "Shop" };
export default function Shop() {
  return <main id="main" className="page shop-page"><p className="eyebrow">THE NORTH MOB</p><h1 tabIndex={-1}>SHOP</h1><p>No products announced.</p><a className="text-link" href={links.instagram} target="_blank" rel="noreferrer">Follow the collective ↗</a></main>;
}
