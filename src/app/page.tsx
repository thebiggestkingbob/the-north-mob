import Image from "next/image";
import Link from "next/link";
import { SoundEntryButton } from "@/components/soundtrack";
import { WaterRipple } from "@/components/water-ripple";
import { HomeParallax } from "@/components/home-parallax";

export default function Home() {
  return <main id="main" className="home-hero home-logo-page">
    <HomeParallax />
    <p className="eyebrow home-location" data-reveal>Pretoria<br />South Africa<br />Trapcardi</p>
    <h1 tabIndex={-1} className="home-logo-heading" data-reveal><span className="visually-hidden">THE NORTH MOB</span><span className="hero-photo-surface"><Image src="/assets/official-logo-transparent.png" alt="" fill priority unoptimized sizes="90vw" /><WaterRipple /></span></h1>
    <div className="home-bottom" data-reveal><div><p className="eyebrow">Real sounds.<br />Bigger impacts.</p><div className="button-row"><SoundEntryButton /><Link href="/the-mob" className="button">Explore the Mob <span>→</span></Link></div></div><p className="eyebrow home-signoff">A collective<br />A sound<br />A movement</p></div>
  </main>;
}
