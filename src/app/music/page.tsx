import type { Metadata } from "next";
import { MusicMilestones, FeaturedArtists } from "@/components/music-discovery";
import "./music.css";
import { album as approvedAlbum } from "@/config/catalogue";
import { SoundEntryButton } from "@/components/soundtrack";
import { AlbumArtwork, SpotifyTrackList } from "@/components/spotify-player";
export const metadata: Metadata = { title: "Music" };
import { publishedMusic } from "@/lib/studio/public-music";
export default async function Music() {
  const music=await publishedMusic();
  const release=music.releases.find(r=>r.slug===approvedAlbum.id);
  if(music.unavailable||!release)return <main id="main" className="page music-page"><h1 tabIndex={-1}>MUSIC</h1><p role="status">{music.unavailable?"Music is temporarily unavailable. Please try again shortly.":"No featured release is currently published."}</p></main>;
  const album={...release,cover:release.cover??approvedAlbum.cover};
  const catalogue=music.tracks.filter(t=>t.releaseId===approvedAlbum.id);
  return <main id="main" className="page music-page">
    <section className="music-feature">
      <div className="release-copy" data-reveal><p className="eyebrow">The North Mob</p><h1 tabIndex={-1}>HERE 4<br />BUSINESS</h1><p className="eyebrow release-subtitle">{album.title}</p><p className="body-copy">Real stories, real people,<br />real movement.</p><div className="h4b-story"><h2>A SOUND FROM PITORI. BUILT FOR EVERYWHERE.</h2><p>HERE 4 BUSINESS introduces TRAPCARDI — THE NORTHMOB&apos;s fusion of hard-hitting trap, hip-hop attitude and the unmistakable bounce of Barcadi. Rooted in Pretoria, the project brings a new energy to South African rap.</p></div><SoundEntryButton /></div>
      <figure className="release-photo" data-reveal><AlbumArtwork cover={album.cover} title={album.title}/><figcaption className="eyebrow">{album.artist} / {album.year}</figcaption></figure>
    </section>
    <MusicMilestones tracks={catalogue.length} year={album.year} />
    <FeaturedArtists tracks={catalogue} />
    <section className="music-lower" data-scroll-reveal><div><div className="section-label"><h2 className="eyebrow">HERE 4 BUSINESS / {catalogue.length} tracks</h2><span className="eyebrow">Spotify / Play here</span></div><SpotifyTrackList /><p className="source-note">Play a track here. Playback continues while you explore the site.</p></div></section>
  </main>;
}
