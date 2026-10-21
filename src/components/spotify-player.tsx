"use client";
import { songs } from "@/config/content";
import { ARTIST_URI, SpotifyPlayButton, useSoundtrack } from "@/components/soundtrack";

export function SpotifyPlayer() {
  const { status } = useSoundtrack();
  return <div className="spotify-block"><h2 className="eyebrow">Listen here / Spotify</h2><div className="embed-consent"><p>Sound from the North.</p><SpotifyPlayButton uri={ARTIST_URI}>Play the collective <span aria-hidden="true">▷</span></SpotifyPlayButton><small>Music stays with you as you explore. Use the Spotify player to choose a track. {status === "playing" ? "Your soundtrack is playing." : "Your browser may need you to press play inside Spotify."}</small></div></div>;
}

export function SpotifyTrackList() {
  return <div className="song-list">{songs.map((song, index) => <SpotifyPlayButton key={song.uri} uri={song.uri} className="song-play"><span className="eyebrow">0{index + 1}</span><span>{song.title}</span><span aria-hidden="true">▷</span></SpotifyPlayButton>)}</div>;
}
