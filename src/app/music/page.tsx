import type { Metadata } from "next";
import Image from "next/image";
import { spotifyArtistUri as ARTIST_URI } from "@/config/content";
import { SpotifyPlayButton } from "@/components/soundtrack";
import { SpotifyPlayer, SpotifyTrackList } from "@/components/spotify-player";
export const metadata: Metadata = { title: "Music" };
export default function Music() {
  return <main id="main" className="page music-page">
    <section className="music-feature">
      <div className="release-copy" data-reveal><p className="eyebrow">The North Mob</p><h1 tabIndex={-1}>HERE 4<br />BUSINESS</h1><p className="eyebrow release-subtitle">Music from Pretoria.</p><p className="body-copy">Real stories, real people,<br />real movement.</p><SpotifyPlayButton uri={ARTIST_URI} className="button button-light">Listen here on Spotify <span aria-hidden="true">▷</span></SpotifyPlayButton></div>
      <figure className="release-photo" data-reveal><Image src="/assets/group_close_glasses.jpeg" alt="THE NORTH MOB collective portrait" fill priority sizes="(max-width: 700px) 100vw, 48vw" /><figcaption className="eyebrow">THE NORTH MOB / PRETORIA</figcaption></figure>
    </section>
    <section className="music-lower" data-scroll-reveal><div><div className="section-label"><h2 className="eyebrow">From the collective</h2><span className="eyebrow">Spotify / Play here</span></div><SpotifyTrackList /><p className="source-note">Play a track here. Playback continues while you explore the site.</p></div><SpotifyPlayer /></section>
  </main>;
}
