"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { loadSpotifyApi, spotifyEmbedUrl, type SpotifyController } from "@/lib/spotify";

import { songs, spotifyArtistUri } from "@/config/content";
export const ARTIST_URI = spotifyArtistUri;
type SoundStatus = "off" | "loading" | "starting" | "ready" | "playing" | "paused" | "error";
type Soundtrack = {
  enabled: boolean; status: SoundStatus; currentUri: string;
  play: (uri?: string) => void; pause: () => void; off: () => void; retry: () => void;
  host: React.RefObject<HTMLDivElement | null>;
};
const SoundContext = createContext<Soundtrack | null>(null);
const START_URI = songs[0].uri;
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
  const [currentUri, setCurrentUri] = useState<string>(START_URI);
  const [attempt, setAttempt] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SpotifyController | null>(null);
  const selectedUri = useRef<string>(START_URI);
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

  // Retry a blocked arrival request on the first intentional page interaction.
  // This does not pretend to bypass browser or Spotify playback permissions.
  useEffect(() => {
    const activate = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest("button,input,textarea,select,.header-sound") || !wantSound.current || confirmedPlaying.current || !controller.current) return;
      beginPlayback();
      document.removeEventListener("pointerdown", activate);
      document.removeEventListener("keydown", activate);
    };
    document.addEventListener("pointerdown", activate, { passive: true });
    document.addEventListener("keydown", activate);
    return () => { document.removeEventListener("pointerdown", activate); document.removeEventListener("keydown", activate); };
  }, [beginPlayback]);

  useEffect(() => {
    const stopForVideo = () => { if (enabled) pause(); };
    window.addEventListener("northmob:video-open", stopForVideo);
    return () => window.removeEventListener("northmob:video-open", stopForVideo);
  }, [enabled, pause]);

  useEffect(() => {
    if (!enabled || !host.current) return;
    let cancelled = false;
    let instance: SpotifyController | null = null;
    let failed = false;
    const fail = () => {
      if (cancelled) return;
      failed = true;
      try { instance?.destroy(); } catch { /* Keep the native fallback usable. */ }
      if (controller.current === instance) controller.current = null;
      host.current?.replaceChildren(); setStatus("error");
    };
    const connectionTimer = setTimeout(fail, 20000);
    const mount = document.createElement("div");
    host.current.replaceChildren(mount);
    loadSpotifyApi().then(api => {
      if (cancelled || failed) return;
      setStatus("loading");
      api.createController(mount, { uri: selectedUri.current, width: "100%", height: 80, theme: "dark" }, embed => {
        if (cancelled || failed) { embed.destroy(); return; }
        instance = embed; controller.current = embed;
        const iframe = host.current?.querySelector("iframe");
        if (iframe) {
          iframe.title = "THE NORTH MOB Spotify player";
          iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
          iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        }
        embed.addListener("ready", () => {
          if (cancelled || failed) return;
          clearTimeout(connectionTimer);
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
    }).catch(() => { clearTimeout(connectionTimer); fail(); });
    return () => {
      cancelled = true; clearTimeout(connectionTimer); clearStartTimer();
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

export function SoundEntryButton() {
  const { status, play, pause } = useSoundtrack();
  const playing = status === "playing";
  return <button type="button" className="button button-light" onClick={() => playing ? pause() : play()}>{playing ? "Pause soundtrack" : "Enter with sound"}<span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span></button>;
}

export function SpotifyPlayButton({ uri = ARTIST_URI, children, className = "button" }: { uri?: string; children: React.ReactNode; className?: string }) {
  const { play } = useSoundtrack();
  return <button type="button" className={className} onClick={() => play(uri)}>{children}</button>;
}

export function SoundtrackControls() {
  const { enabled, status, currentUri, play, pause, off, retry, host } = useSoundtrack();
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const disclosure = useRef<HTMLButtonElement>(null);
  const playing = status === "playing";
  const label = { off: "Sound off", loading: "Connecting", starting: "Starting", ready: "Tap to play", playing: "Now playing", paused: "Paused", error: "Tap to listen" }[status];
  const song = songs.find(item => item.uri === currentUri);

  useEffect(() => {
    if (!expanded) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setExpanded(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setExpanded(false); disclosure.current?.focus(); }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [expanded]);

  return <div ref={root} className={`header-sound ${playing ? "is-playing" : ""}`}>
    <button className="sound-transport" type="button" aria-label={playing ? "Pause soundtrack" : "Play soundtrack"} aria-pressed={playing} onClick={() => {
      if (playing) pause();
      else if (status === "error") { setExpanded(true); }
      else play();
    }}><span className="sound-bars" aria-hidden="true"><i /><i /><i /></span><span className="sound-caption"><span>Spotify</span><span role="status">{label}</span></span><span aria-hidden="true" className="transport-icon">{playing ? "Ⅱ" : "▷"}</span></button>
    <button ref={disclosure} type="button" className="sound-expand" aria-label="Show Spotify player" aria-expanded={expanded} aria-controls="spotify-panel" onClick={() => setExpanded(value => !value)}><span aria-hidden="true">⌄</span></button>
    <div id="spotify-panel" className={`sound-panel ${expanded ? "is-open" : ""}`} inert={!expanded} aria-hidden={!expanded}>
      <div className="sound-panel-heading"><span>{song?.title ?? "THE NORTH MOB"}</span><button type="button" onClick={off} aria-label="Turn sound off">Off ×</button></div>
      {enabled && <div className={`spotify-mount ${status === "error" ? "has-error" : ""}`} ref={host} />}
      {enabled && status === "error" && <iframe title="THE NORTH MOB Spotify fallback player" src={spotifyEmbedUrl(currentUri)} width="100%" height="80" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" />}
      <p className="sound-hint">{!enabled ? "Sound is off. Press play to listen." : status === "error" || status === "ready" ? "Press play inside Spotify to listen here." : "Your soundtrack stays with you as you explore."}</p>
      {status === "error" && <button type="button" className="sound-retry" onClick={retry}>Reconnect Spotify</button>}
      <p className="sound-disclosure">Spotify may use cookies. Full tracks depend on your Spotify account and availability.</p>
    </div>
  </div>;
}
