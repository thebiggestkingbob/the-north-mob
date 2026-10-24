"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/animation";
import { pages } from "@/config/pages";
import { SiteFooter } from "@/components/site-footer";
import { ShopHeaderActions } from "@/components/shop-header-actions";
import { SoundtrackControls } from "@/components/soundtrack";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const cinematic = ["/", "/visuals", "/shop"].includes(pathname);
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const navigating = useRef(false);
  const firstRender = useRef(true);
  const previousPath = useRef(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!header.current) return;
    const update = () => document.documentElement.style.setProperty("--shell-header-height", `${header.current?.getBoundingClientRect().height ?? 0}px`);
    const observer = new ResizeObserver(update); observer.observe(header.current); update();
    return () => { observer.disconnect(); document.documentElement.style.removeProperty("--shell-header-height"); };
  }, [pathname]);

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

  // Keep the wipe outside the page-reveal context: reverting that context on
  // navigation must not reset a fully covered veil before the new page arrives.
  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const layer = veil.current;
    if (!layer) return;
    gsap.killTweensOf(layer);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(layer, { yPercent: -100 });
      layer.style.pointerEvents = "none"; navigating.current = false; return;
    }
    layer.style.pointerEvents = "auto";
    const reveal = gsap.fromTo(layer, { yPercent: 0 }, {
      yPercent: -100, delay: .35, duration: 1.1, ease: "power3.inOut",
      onComplete: () => { layer.style.pointerEvents = "none"; navigating.current = false; },
    });
    return () => { reveal.kill(); };
  }, [pathname]);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("main [data-reveal]", { y: 26, opacity: 0, duration: 1.15, delay: .45, stagger: .08, ease: "power3.out", clearProps: "all" });
      gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]").forEach((element) => {
        gsap.from(element, { y: 24, opacity: 0, duration: .7, scrollTrigger: { trigger: element, start: "top 95%", once: true }, clearProps: "all" });
      });
    });
    if (!firstRender.current) {
      const heading = root.current?.querySelector<HTMLElement>("main h1");
      heading?.focus({ preventScroll: true });
    }
    firstRender.current = false;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) navigating.current = false;
    return () => media.revert();
  }, { scope: root, dependencies: [pathname], revertOnUpdate: true });

  if (pathname.startsWith("/studio")) return <div ref={root}><a href="#main" className="skip-link">Skip to content</a>{children}</div>;

  return <div ref={root} className={`site-shell ${pathname === "/" ? "is-home" : ""} ${cinematic ? "is-cinematic" : ""}`} onClickCapture={(event) => {
    const target = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
    if (!target || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || target.target === "_blank") return;
    const url = new URL(target.href);
    if (url.origin !== location.origin || url.pathname === pathname || url.hash || url.search) return;
    event.preventDefault();
    if (navigating.current) return;
    navigating.current = true;
    setMenuOpen(false);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(url.pathname); return; }
    gsap.killTweensOf(veil.current);
    if (veil.current) veil.current.style.pointerEvents = "auto";
    gsap.fromTo(veil.current, { yPercent: 100 }, { yPercent: 0, duration: .9, ease: "power3.inOut", onComplete: () => { router.push(url.pathname); } });
  }}>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header" ref={header}>
      <SoundtrackControls />
      <ShopHeaderActions />
      <Link href="/" className="brand" aria-label="THE NORTH MOB — Home"><Image src="/assets/official-logo-transparent.png" alt="THE NORTH MOB" width={1983} height={793} unoptimized priority /></Link>
      <button ref={menuButton} type="button" className="menu-toggle" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(true)}><span /><span /></button>
    </header>
    <dialog id="mobile-menu" ref={menuRef} className="menu-panel" onCancel={() => setMenuOpen(false)} onClose={() => { setMenuOpen(false); menuButton.current?.focus(); }}>
      <button className="close-button" autoFocus onClick={() => setMenuOpen(false)} aria-label="Close navigation">×</button>
      <p className="eyebrow">THE NORTH MOB</p>
      <nav aria-label="Expanded navigation">{pages.map((page, index) => <Link key={page.path} href={page.path} aria-current={pathname === page.path ? "page" : undefined} onClick={() => setMenuOpen(false)}><span className="eyebrow">0{index + 1}</span>{page.name}</Link>)}</nav>
    </dialog>
    {children}
    <SiteFooter />
    <div ref={veil} className="transition-veil" style={{ transform: "translateY(-100%)" }} aria-hidden="true"><span>THE<br />NORTH<br />MOB</span></div>
  </div>;
}
