import Image from "next/image";
import Link from "next/link";
import { album } from "@/config/catalogue";
import { CinemaHero } from "@/components/cinema-hero";
import { HomeShopCarousel } from "@/components/home-shop-carousel";
import { HomeSequence } from "@/components/home-sequence";
import "./home.css";

export default function Home() {
  return <main id="main" className="home-experience">
    <h1 tabIndex={-1} className="sr-only">THE NORTH MOB</h1>
    <HomeSequence />
    <section className="home-cinema-scene" aria-label="Mob Ties film">
      <div className="home-scene-stage">
        <div className="home-cinema-shade" />
        <div className="home-film-aperture home-film-background"><Image className="home-film-poster" src="/assets/mob-ties/hero-film-poster.webp" alt="THE NORTH MOB in the supplied Mob Ties film" fill priority sizes="100vw" /><CinemaHero /></div>
        <p className="home-film-caption eyebrow">MOB TIES<span>01 / FILM</span></p>
        <div className="home-opening-copy"><a className="home-scroll-cue" href="#movement">Scroll to explore </a></div>
      </div>
    </section>
    <section id="movement" className="home-movement-scene" aria-labelledby="home-statement">
      <div className="home-scene-stage">
        <p className="home-scene-label eyebrow">02 / THE COLLECTIVE</p>
        <h2 id="home-statement" className="home-statement"><span>REAL</span><span>SOUNDS.</span></h2>
        <figure className="home-editorial-photo"><Image src="/assets/mob-ties/mob-ties-13.webp" alt="THE NORTH MOB photographed in the courtyard" fill sizes="(max-width: 750px) 62vw, 32vw" /></figure>
        <div className="home-movement-copy"><p className="eyebrow">A collective.<br />A sound.<br />A movement.</p><Link className="home-editorial-link" href="/the-mob">Explore the Mob </Link></div>
        <p className="home-impact eyebrow">BIGGER IMPACTS.</p>
      </div>
    </section>
    <section className="home-release-scene" aria-labelledby="home-release-title">
      <div className="home-scene-stage">
        <p className="home-scene-label eyebrow">03 / MUSIC</p>
        <h2 id="home-release-title" className="home-release-title">HERE 4<br />BUSINESS</h2>
        <Link href="/music" className="home-release-art" aria-label="Explore HERE 4 BUSINESS"><Image src={album.cover} alt="HERE 4 BUSINESS — official album artwork" fill sizes="(max-width: 750px) 65vw, 34vw" quality={90} /></Link>
        <div className="home-release-meta"><p className="eyebrow">{album.artist}<br />{album.type} / {album.year}</p><Link href="/music" className="home-editorial-link">Explore the music </Link></div>
        <nav className="home-chapter-links" aria-label="Continue exploring"><Link href="/visuals">Visualz</Link><Link href="/live">Live</Link><Link href="/business">Business As Usual</Link><Link href="/shop">Shop</Link></nav>
      </div>
    </section>
    <section className="home-visuals-scene" aria-labelledby="home-visuals-title">
      <div className="home-scene-stage">
        <p className="home-scene-label eyebrow">04 / VISUALZ</p>
        <figure className="home-visuals-wide"><Image src="/assets/mob-ties/mob-ties-22.webp" alt="Mob Ties editorial group photograph" fill sizes="100vw" /></figure>
        <h2 id="home-visuals-title" className="home-visuals-title">VISUALZ</h2>
        <figure className="home-visuals-detail"><Image src="/assets/mob-ties/mob-ties-09.webp" alt="THE NORTH MOB photographed on location" fill sizes="(max-width: 750px) 62vw, 30vw" /></figure>
        <div className="home-visuals-copy"><p className="eyebrow">Films.<br />Photography.<br />The collective.</p><Link href="/visuals" className="home-editorial-link">Explore Visualz </Link></div>
      </div>
    </section>
    <section className="home-shop-scene" aria-labelledby="home-shop-title">
      <div className="home-scene-stage">
        <p className="home-scene-label eyebrow">05 / SHOP</p>
        <h2 id="home-shop-title" className="home-shop-title">SHOP</h2>
        <HomeShopCarousel />
        <div className="home-shop-copy"><Link href="/shop" className="home-editorial-link">Visit the shop </Link></div>
        <nav className="home-chapter-links" aria-label="More from the collective"><Link href="/music">Music</Link><Link href="/the-mob">The Mob</Link><Link href="/live">Live</Link><Link href="/business">Business As Usual</Link></nav>
      </div>
    </section>
  </main>;
}
