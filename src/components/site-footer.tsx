"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { pages } from "@/config/pages";
import { links } from "@/config/content";
import { NewsletterSignup } from "./newsletter-signup";
export function SiteFooter(){
 const pathname=usePathname();
 return <footer className="site-footer refined-footer" id="site-footer"><Link href="/" className="footer-wordmark">The North Mob</Link><details className="footer-disclosure"><summary>Explore &amp; updates</summary><div className="footer-expanded"><nav aria-label="Footer navigation">{pages.slice(1).map(page=><Link key={page.path} href={page.path} aria-current={pathname===page.path?"page":undefined}>{page.name}</Link>)}<a href={links.instagram} target="_blank" rel="noreferrer">Instagram</a><a href={links.spotify} target="_blank" rel="noreferrer">Spotify</a><a href={links.youtube} target="_blank" rel="noreferrer">YouTube</a></nav><NewsletterSignup/></div></details></footer>;
}
