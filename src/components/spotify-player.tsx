"use client";
import Image from "next/image";
import { album } from "@/config/catalogue";
import { SpotifyPlayButton, useSoundtrack } from "@/components/soundtrack";

export function SpotifyPlayer() {
  const { status, pause } = useSoundtrack();
  return <div className="spotify-block"><h2 className="eyebrow">More from the collective</h2><SpotifyTrackList additional /><p className="source-note">{status === "playing" ? "Your soundtrack is playing." : "Enable Sound in the header to listen here."} Spotify may require a direct tap in its player. Full tracks depend on your account and availability.</p><a className="text-link" href="https://open.spotify.com/artist/0iZ4kkTa0bDsMz9Qgrr0zx" onClick={pause} target="_blank" rel="noreferrer">Explore releases on Spotify ↗</a></div>;
}
export function SpotifyTrackList({ additional = false }: { additional?: boolean }) {
  const { tracks, currentUri, status, pause } = useSoundtrack();
  const visible = tracks.filter(track => additional ? track.releaseId !== album.id : track.releaseId === album.id);
  return <div className="song-list">{visible.map((song, index) => {
    const playing = status === "playing" && song.uri === currentUri;
    return <div key={song.id} className="catalogue-row">
      {playing ? <button type="button" className="song-play" aria-label={`Pause ${song.title}`} onClick={pause}><span className="eyebrow">{String(index + 1).padStart(2, "0")}</span><span>{song.title}</span><span aria-hidden="true">Ⅱ</span></button> : song.uri ? <SpotifyPlayButton uri={song.uri} className="song-play"><span className="eyebrow">{String(index + 1).padStart(2, "0")}</span><span>{song.title}</span><span aria-hidden="true">▷</span></SpotifyPlayButton> : song.releaseId === album.id ? <SpotifyPlayButton uri={album.uri} className="song-play"><span className="eyebrow">{String(index + 1).padStart(2, "0")}</span><span>{song.title}<small>Choose this track in the Spotify album player</small></span><span aria-hidden="true">↗</span></SpotifyPlayButton> : <a href={song.source} onClick={pause} target="_blank" rel="noreferrer" className="song-play"><span className="eyebrow">{String(index + 1).padStart(2, "0")}</span><span>{song.title}<small>Listen on Spotify</small></span><span aria-hidden="true">↗</span></a>}
      <p className="track-credit">{song.credits}<span>{song.duration}</span></p>
    </div>;
  })}</div>;
}


export function AlbumArtwork() {
  return <Image src={album.cover} alt={`${album.title} — official cover artwork`} style={{ objectFit: "contain" }} fill priority quality={90} sizes="(max-width: 600px) 100vw, 48vw" />;
}
