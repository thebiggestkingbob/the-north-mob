"use client";
import { useState } from "react";
import { links } from "@/config/content";
export function SpotifyPlayer() {
  const [enabled, setEnabled] = useState(false);
  return <div className="spotify-block"><h2 className="eyebrow">Listen to THE NORTH MOB</h2>{enabled ? <iframe title="THE NORTH MOB on Spotify" src="https://open.spotify.com/embed/artist/0iZ4kkTa0bDsMz9Qgrr0zx?utm_source=generator&theme=0" width="100%" height="352" allow="encrypted-media; fullscreen; picture-in-picture" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /> : <div className="embed-consent"><p>Sound from the North.</p><button className="button" onClick={() => setEnabled(true)}>Load Spotify player <span>↗</span></button><small>Loading connects to Spotify, which may use cookies.</small></div>}<a className="text-link" href={links.spotify} target="_blank" rel="noreferrer">Open in Spotify ↗</a></div>;
}
