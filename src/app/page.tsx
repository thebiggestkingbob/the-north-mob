import Image from "next/image";
import Link from "next/link";
import { HomeParallax } from "@/components/home-parallax";

export default function Home() {
  return <main id="main" className="home-hero">
    <div className="hero-photo"><Image src="/assets/group_close_glasses.jpeg" alt="THE NORTH MOB photographed together in Pretoria" fill priority sizes="100vw" quality={90} /></div>
    <HomeParallax />
    <p className="eyebrow home-location" data-reveal>Pretoria<br />South Africa<br />Trapcardi</p>
    <h1 tabIndex={-1} className="home-title" data-reveal>THE<br />NORTH<br />MOB</h1>
    <div className="home-bottom" data-reveal><div><p className="eyebrow">Real sounds.<br />Bigger impacts.</p><div className="button-row"><Link href="/music" className="button button-light">Listen now <span>↗</span></Link><Link href="/the-mob" className="button">Explore the Mob <span>→</span></Link></div></div><p className="eyebrow home-signoff">A collective<br />A sound<br />A movement</p></div>
  </main>;
}
