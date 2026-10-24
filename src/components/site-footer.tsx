"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { pages } from "@/config/pages";
import { links } from "@/config/content";
import { NewsletterSignup } from "./newsletter-signup";
const nextPages: Record<string, {path:string;name:string}[]> = {
 "/":[{path:"/the-mob",name:"Meet the Mob"},{path:"/music",name:"Listen to H4B"}],
 "/music":[{path:"/visuals",name:"See the Visualz"},{path:"/the-mob",name:"Meet the Mob"}],
 "/the-mob":[{path:"/shop",name:"Explore the Shop"},{path:"/music",name:"Hear the collective"}],
 "/visuals":[{path:"/music",name:"Explore the music"},{path:"/live",name:"Catch the Mob live"}],
 "/live":[{path:"/business",name:"Book the Mob"},{path:"/visuals",name:"See the Visualz"}],
 "/business":[{path:"/the-mob",name:"Meet the Mob"},{path:"/music",name:"Explore the music"}],
 "/shop":[{path:"/music",name:"Listen to H4B"},{path:"/visuals",name:"See the Visualz"}],
};
export function SiteFooter(){
 const pathname=usePathname();
 return <footer className="site-footer refined-footer" id="site-footer"><nav className="page-continuation" aria-label="Continue exploring"><p className="eyebrow">Keep exploring</p>{(nextPages[pathname] ?? nextPages["/"]).map(page=><Link key={page.path} href={page.path}>{page.name}<span aria-hidden="true">↗</span></Link>)}</nav><Link href="/" className="footer-wordmark">The North Mob</Link><details className="footer-disclosure"><summary>Explore &amp; updates</summary><div className="footer-expanded"><nav aria-label="Footer navigation">{pages.slice(1).map(page=><Link key={page.path} href={page.path} aria-current={pathname===page.path?"page":undefined}>{page.name}</Link>)}<a href={links.instagram} target="_blank" rel="noreferrer">Instagram</a><a href={links.spotify} target="_blank" rel="noreferrer">Spotify</a><a href={links.youtube} target="_blank" rel="noreferrer">YouTube</a></nav><NewsletterSignup/></div></details></footer>;
}
