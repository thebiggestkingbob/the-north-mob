"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/animation";
import { pages } from "@/config/pages";
import { links } from "@/config/content";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const navigating = useRef(false);
  const firstRender = useRef(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) menuRef.current?.showModal();
    else menuRef.current?.close();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(veil.current, { yPercent: -100, duration: .55, ease: "power3.inOut" });
      gsap.from("main [data-reveal]", { y: 26, opacity: 0, duration: .85, stagger: .08, ease: "power3.out", clearProps: "all" });
      gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]").forEach((element) => {
        gsap.from(element, { y: 24, opacity: 0, duration: .7, scrollTrigger: { trigger: element, start: "top 95%", once: true }, clearProps: "all" });
      });
    });
    if (!firstRender.current) {
      const heading = root.current?.querySelector<HTMLElement>("main h1");
      heading?.focus({ preventScroll: true });
    }
    firstRender.current = false;
    navigating.current = false;
    return () => media.revert();
  }, { scope: root, dependencies: [pathname], revertOnUpdate: true });

  return <div ref={root} className={`site-shell ${pathname === "/" ? "is-home" : ""}`} onClickCapture={(event) => {
    const target = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
    if (!target || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || target.target === "_blank") return;
    const url = new URL(target.href);
    if (url.origin !== location.origin || url.pathname === pathname || url.hash || url.search) return;
    event.preventDefault();
    if (navigating.current) return;
    navigating.current = true;
    setMenuOpen(false);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(url.pathname); return; }
    gsap.fromTo(veil.current, { yPercent: 100 }, { yPercent: 0, duration: .36, ease: "power3.inOut", onComplete: () => { router.push(url.pathname); } });
  }}>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header">
      <Link href="/" className="brand" aria-label="THE NORTH MOB — Home"><Image src="/assets/official_logo.jpeg" alt="THE NORTH MOB" width={957} height={960} unoptimized priority /></Link>
      <nav aria-label="Main navigation" className="desktop-nav">{pages.slice(1).map((page) => <Link href={page.path} key={page.path} aria-current={pathname === page.path ? "page" : undefined}>{page.name}</Link>)}</nav>
      <button ref={menuButton} type="button" className="menu-toggle" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(true)}><span /><span /></button>
    </header>
    <dialog id="mobile-menu" ref={menuRef} className="menu-panel" onCancel={() => setMenuOpen(false)} onClose={() => { setMenuOpen(false); menuButton.current?.focus(); }}>
      <button className="close-button" autoFocus onClick={() => setMenuOpen(false)} aria-label="Close navigation">×</button>
      <p className="eyebrow">THE NORTH MOB</p>
      <nav aria-label="Expanded navigation">{pages.map((page, index) => <Link key={page.path} href={page.path} aria-current={pathname === page.path ? "page" : undefined} onClick={() => setMenuOpen(false)}><span className="eyebrow">0{index + 1}</span>{page.name}</Link>)}</nav>
      <p className="eyebrow">Pretoria / South Africa</p>
    </dialog>
    {children}
    {pathname !== "/" && <footer className="site-footer"><p className="eyebrow">Pretoria<br />South Africa<br />Trapcardi</p><div className="social-links"><a href={links.instagram} target="_blank" rel="noreferrer">Instagram ↗</a><a href={links.spotify} target="_blank" rel="noreferrer">Spotify ↗</a><a href={links.youtube} target="_blank" rel="noreferrer">YouTube ↗</a></div><Link href="/" className="footer-wordmark">The North Mob</Link></footer>}
    <div ref={veil} className="transition-veil" style={{ transform: "translateY(-100%)" }} aria-hidden="true"><span>THE<br />NORTH<br />MOB</span></div>
  </div>;
}
