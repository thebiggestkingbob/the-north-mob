import Image from "next/image";
import Link from "next/link";
import { SoundEntryButton } from "@/components/soundtrack";
import { CinemaHero } from "@/components/cinema-hero";

export default function Home() {
  return <main id="main" className="home-hero">
    <div className="hero-photo"><div className="hero-photo-surface"><Image src="/assets/homepage-cover.jpg" alt="THE NORTH MOB standing together outside a building in Pretoria" fill priority sizes="100vw" quality={90} /></div></div>
    <CinemaHero />
    <p className="eyebrow home-location" data-reveal>Pretoria<br />South Africa<br />Trapcardi</p>
    <h1 tabIndex={-1} className="sr-only">THE NORTH MOB</h1>
    <div className="home-bottom" data-reveal><div><p className="eyebrow">Real sounds.<br />Bigger impacts.</p><div className="button-row"><SoundEntryButton /><Link href="/the-mob" className="button">Explore the Mob <span>→</span></Link></div></div><p className="eyebrow home-signoff">A collective<br />A sound<br />A movement</p></div>
  </main>;
}
