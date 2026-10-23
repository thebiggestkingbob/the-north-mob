"use client";
import Image from "next/image";
import { album } from "@/config/catalogue";
import { SpotifyPlayButton, useSoundtrack } from "@/components/soundtrack";

export function SpotifyTrackList({ additional = false }: { additional?: boolean }) {
  const { tracks, currentUri, status, pause } = useSoundtrack();
  const visible = tracks.filter(track => additional ? track.releaseId !== album.id : track.releaseId === album.id);
  return <div className="song-list">{visible.map((song, index) => {
    const playing = status === "playing" && song.uri === currentUri;
    return <div key={song.id} className="catalogue-row">
      {playing ? <button type="button" className="song-play" aria-label={`Pause ${song.title}`} onClick={pause}><span className="eyebrow">{String(index + 1).padStart(2, "0")}</span><span>{song.title}</span><span aria-hidden="true">Ⅱ</span></button> : song.uri ? <SpotifyPlayButton uri={song.uri} className="song-play"><span className="eyebrow">{String(index + 1).padStart(2, "0")}</span><span>{song.title}</span><span aria-hidden="true">▷</span></SpotifyPlayButton> : <a href={song.source} onClick={pause} target="_blank" rel="noreferrer" className="song-play"><span className="eyebrow">{String(index + 1).padStart(2, "0")}</span><span>{song.title}<small>Listen on Spotify</small></span></a>}
      <p className="track-credit">{song.credits}<span>{song.duration}</span></p>
    </div>;
  })}</div>;
}


export function AlbumArtwork({cover=album.cover,title=album.title}:{cover?:string;title?:string}) {
  return <Image unoptimized={cover.startsWith("/api/media/")} src={cover} alt={`${title} — official cover artwork`} style={{ objectFit: "contain" }} fill priority quality={90} sizes="(max-width: 600px) 100vw, 48vw" />;
}
