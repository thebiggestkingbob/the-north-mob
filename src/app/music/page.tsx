import type { Metadata } from "next";
import { album } from "@/config/catalogue";
import { SoundEntryButton } from "@/components/soundtrack";
import { AlbumArtwork, SpotifyPlayer, SpotifyTrackList } from "@/components/spotify-player";
export const metadata: Metadata = { title: "Music" };
export default function Music() {
  return <main id="main" className="page music-page">
    <section className="music-feature">
      <div className="release-copy" data-reveal><p className="eyebrow">The North Mob</p><h1 tabIndex={-1}>HERE 4<br />BUSINESS</h1><p className="eyebrow release-subtitle">{album.title}</p><p className="body-copy">Real stories, real people,<br />real movement.</p><SoundEntryButton /></div>
      <figure className="release-photo" data-reveal><AlbumArtwork /><figcaption className="eyebrow">{album.artist} / {album.year}</figcaption></figure>
    </section>
    <section className="music-lower" data-scroll-reveal><div><div className="section-label"><h2 className="eyebrow">HERE 4 BUSINESS / 11 tracks</h2><span className="eyebrow">Spotify / Play here</span></div><SpotifyTrackList /><p className="source-note">Play a track here. Playback continues while you explore the site.</p></div><SpotifyPlayer /></section>
  </main>;
}
