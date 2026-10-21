import type { Metadata } from "next";
import Image from "next/image";
import { links, songs } from "@/config/content";
import { SpotifyPlayer } from "@/components/spotify-player";
export const metadata: Metadata = { title: "Music" };
export default function Music() {
  return <main id="main" className="page music-page">
    <section className="music-feature">
      <div className="release-copy" data-reveal><p className="eyebrow">The North Mob</p><h1 tabIndex={-1}>HERE 4<br />BUSINESS</h1><p className="eyebrow release-subtitle">Music from Pretoria.</p><p className="body-copy">Real stories, real people,<br />real movement.</p><a href={links.spotify} target="_blank" rel="noreferrer" className="button button-light">Listen on Spotify <span>↗</span></a></div>
      <figure className="release-photo" data-reveal><Image src="/assets/group_close_glasses.jpeg" alt="THE NORTH MOB collective portrait" fill priority sizes="(max-width: 700px) 100vw, 48vw" /><figcaption className="eyebrow">THE NORTH MOB / PRETORIA</figcaption></figure>
    </section>
    <section className="music-lower" data-scroll-reveal><div><div className="section-label"><h2 className="eyebrow">From the collective</h2><span className="eyebrow">Spotify ↗</span></div><div className="song-list">{songs.map((song, i) => <a href={links.spotify} target="_blank" rel="noreferrer" key={song}><span className="eyebrow">0{i + 1}</span><span>{song}</span><span>↗</span></a>)}</div><p className="source-note">Titles from the collective’s supplied Spotify biography.</p></div><SpotifyPlayer /></section>
  </main>;
}
