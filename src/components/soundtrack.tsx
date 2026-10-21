"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { loadSpotifyApi, spotifyEmbedUrl, type SpotifyController } from "@/lib/spotify";

import { spotifyArtistUri } from "@/config/content";
export const ARTIST_URI = spotifyArtistUri;
type SoundStatus = "off" | "loading" | "starting" | "ready" | "playing" | "paused" | "error";
type Soundtrack = {
  enabled: boolean; status: SoundStatus; currentUri: string;
  play: (uri?: string) => void; pause: () => void; off: () => void; retry: () => void;
  host: React.RefObject<HTMLDivElement | null>;
};
const SoundContext = createContext<Soundtrack | null>(null);
const PREFERENCE_KEY = "northmob:sound";
function readAutoplayPreference() { try { return sessionStorage.getItem(PREFERENCE_KEY) !== "off"; } catch { return true; } }
function subscribePreference(callback: () => void) {
  const listener = (event: StorageEvent) => { if (event.key === PREFERENCE_KEY) callback(); };
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}
function remember(value: "on" | "off") { try { sessionStorage.setItem(PREFERENCE_KEY, value); } catch { /* Playback also works without storage. */ } }

export function SoundtrackProvider({ children }: { children: React.ReactNode }) {
  const autoplayAllowed = useSyncExternalStore(subscribePreference, readAutoplayPreference, () => false);
  const [enabledChoice, setEnabled] = useState<boolean | null>(null);
  const enabled = enabledChoice ?? autoplayAllowed;
  const [status, setStatus] = useState<SoundStatus>("off");
  const [currentUri, setCurrentUri] = useState(ARTIST_URI);
  const [attempt, setAttempt] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SpotifyController | null>(null);
  const selectedUri = useRef(ARTIST_URI);
  const wantSound = useRef(true);
  const confirmedPlaying = useRef(false);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStartTimer = useCallback(() => {
    if (startTimer.current) clearTimeout(startTimer.current);
    startTimer.current = null;
  }, []);
  const beginPlayback = useCallback(() => {
    if (!controller.current || !wantSound.current) return;
    clearStartTimer(); confirmedPlaying.current = false; setStatus("starting");
    try { controller.current.play(); }
    catch { setStatus("ready"); }
    // A play request is not evidence of playback. Spotify must confirm it.
    startTimer.current = setTimeout(() => {
      if (!confirmedPlaying.current && wantSound.current) setStatus("ready");
    }, 6000);
  }, [clearStartTimer]);
  const play = useCallback((uri?: string) => {
    wantSound.current = true; remember("on");
    const nextUri = uri ?? selectedUri.current;
    if (nextUri !== selectedUri.current) {
      selectedUri.current = nextUri; setCurrentUri(nextUri);
      try { controller.current?.loadUri(nextUri); } catch { setStatus("error"); }
    }
    setEnabled(true);
    if (controller.current) beginPlayback();
    else { setStatus("loading"); setAttempt(value => value + 1); }
  }, [beginPlayback]);
  const pause = useCallback(() => {
    wantSound.current = false; remember("off"); clearStartTimer();
    confirmedPlaying.current = false;
    setEnabled(!!controller.current);
    try { controller.current?.pause(); } catch { /* The native Spotify controls remain available. */ }
    setStatus("paused");
  }, [clearStartTimer]);
  const off = useCallback(() => {
    pause(); setEnabled(false); setStatus("off");
  }, [pause]);
  const retry = useCallback(() => {
    wantSound.current = true; remember("on"); setEnabled(true); setStatus("loading"); setAttempt(value => value + 1);
  }, []);

  useEffect(() => {
    const stopForVideo = () => { if (enabled) pause(); };
    window.addEventListener("northmob:video-open", stopForVideo);
    return () => window.removeEventListener("northmob:video-open", stopForVideo);
  }, [enabled, pause]);

  useEffect(() => {
    if (!enabled || !host.current) return;
    let cancelled = false;
    let instance: SpotifyController | null = null;
    const mount = document.createElement("div");
    host.current.replaceChildren(mount);
    loadSpotifyApi().then(api => {
      if (cancelled) return;
      setStatus("loading");
      api.createController(mount, { uri: selectedUri.current, width: "100%", height: 152 }, embed => {
        if (cancelled) { embed.destroy(); return; }
        instance = embed; controller.current = embed;
        const iframe = host.current?.querySelector("iframe");
        if (iframe) {
          iframe.title = "THE NORTH MOB Spotify player";
          iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
          iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        }
        embed.addListener("ready", () => {
          if (cancelled) return;
          if (wantSound.current) beginPlayback(); else setStatus("paused");
        });
        embed.addListener("playback_started", () => {
          if (cancelled) return;
          // A direct click inside Spotify is also an intentional request to listen.
          wantSound.current = true; confirmedPlaying.current = true;
          clearStartTimer(); remember("on"); setStatus("playing");
        });
        embed.addListener("playback_update", event => {
          if (cancelled) return;
          const playing = !event.data.isPaused && !event.data.isBuffering;
          confirmedPlaying.current = playing;
          if (playing) { clearStartTimer(); wantSound.current = true; remember("on"); setStatus("playing"); }
          else if (event.data.isBuffering) setStatus("starting");
          else { clearStartTimer(); setStatus("paused"); }
        });
      });
    }).catch(() => { if (!cancelled) setStatus("error"); });
    return () => {
      cancelled = true; clearStartTimer();
      try { instance?.destroy(); } catch { /* The iframe may already have been removed. */ }
      if (controller.current === instance) controller.current = null;
    };
  }, [enabled, attempt, beginPlayback, clearStartTimer]);

  return <SoundContext.Provider value={{ enabled, status: enabled && status === "off" ? "loading" : status, currentUri, play, pause, off, retry, host }}>{children}</SoundContext.Provider>;
}

export function useSoundtrack() {
  const value = useContext(SoundContext);
  if (!value) throw new Error("SoundtrackProvider is required");
  return value;
}

export function SoundToggle() {
  const { status, play, pause } = useSoundtrack();
  const playing = status === "playing";
  return <button className={`sound-toggle ${playing ? "is-playing" : ""}`} type="button" onClick={() => playing ? pause() : play()} aria-label={playing ? "Pause soundtrack" : "Play soundtrack"} aria-pressed={playing}><span className="sound-bars" aria-hidden="true"><i /><i /><i /></span><span>Sound</span></button>;
}

export function SoundEntryButton() {
  const { status, play, pause } = useSoundtrack();
  const playing = status === "playing";
  return <button type="button" className="button button-light" onClick={() => playing ? pause() : play()}>{playing ? "Pause soundtrack" : "Enter with sound"}<span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span></button>;
}

export function SpotifyPlayButton({ uri = ARTIST_URI, children, className = "button" }: { uri?: string; children: React.ReactNode; className?: string }) {
  const { play } = useSoundtrack();
  return <button type="button" className={className} onClick={() => play(uri)}>{children}</button>;
}

export function SoundtrackDock() {
  const { enabled, status, currentUri, pause, off, retry, host } = useSoundtrack();
  if (!enabled) return null;
  const message = {
    off: "Sound is off.", loading: "Connecting to Spotify…", starting: "Starting Spotify…",
    ready: "Tap play in the Spotify player to start the sound.",
    playing: "Playing here. Keep exploring.", paused: "Press play in Spotify to continue listening.",
    error: "Spotify controls are available below. If loading is blocked, try again.",
  }[status];
  return <aside id="site-soundtrack" className="sound-dock" aria-label="Spotify soundtrack">
    <div className="sound-dock-heading"><p className="eyebrow">THE NORTH MOB / Spotify</p><div>{status === "playing" && <button type="button" className="sound-action" onClick={pause}>Pause</button>}<button type="button" className="sound-action" onClick={off} aria-label="Turn sound off">Off ×</button></div></div>
    <div ref={host} className="spotify-mount" />
    {status === "error" && <iframe title="THE NORTH MOB Spotify fallback player" src={spotifyEmbedUrl(currentUri)} width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" />}
    <p className="sound-status" role="status" aria-live="polite">{message} {status === "error" && <button type="button" className="sound-action" onClick={retry}>Retry</button>}</p>
    <p className="sound-disclosure">Spotify may use cookies. Full tracks depend on Spotify availability and your account.</p>
  </aside>;
}
