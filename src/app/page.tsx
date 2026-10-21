import Image from "next/image";
import Link from "next/link";
import { SoundEntryButton } from "@/components/soundtrack";
import { HomeParallax } from "@/components/home-parallax";

export default function Home() {
  return <main id="main" className="home-hero">
    <div className="hero-photo"><div className="hero-photo-surface"><Image src="/assets/homepage-cover.jpg" alt="THE NORTH MOB standing together outside a building in Pretoria" fill priority sizes="100vw" quality={90} /></div></div>
    <HomeParallax />
    <p className="eyebrow home-location" data-reveal>Pretoria<br />South Africa<br />Trapcardi</p>
    <h1 tabIndex={-1} className="home-title" data-reveal><span className="home-title-line"><span className="home-word">THE</span></span><span className="home-title-line"><span className="home-word">NORTH</span></span><span className="home-title-line"><span className="home-word">MOB</span></span></h1>
    <div className="home-bottom" data-reveal><div><p className="eyebrow">Real sounds.<br />Bigger impacts.</p><div className="button-row"><SoundEntryButton /><Link href="/the-mob" className="button">Explore the Mob <span>→</span></Link></div></div><p className="eyebrow home-signoff">A collective<br />A sound<br />A movement</p></div>
  </main>;
}
