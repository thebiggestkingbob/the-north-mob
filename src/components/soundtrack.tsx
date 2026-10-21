"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createSpotifyController, type SpotifyController } from "@/lib/spotify";
import { songs, spotifyArtistUri } from "@/config/content";
export const ARTIST_URI = spotifyArtistUri;
type SoundStatus = "off" | "loading" | "starting" | "ready" | "playing" | "paused" | "native";
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
function remember(value: "on" | "off") { try { sessionStorage.setItem(PREFERENCE_KEY, value); } catch { /* Storage is optional. */ } }
function showPlayer() { window.dispatchEvent(new Event("northmob:show-player")); }

export function SoundtrackProvider({ children }: { children: React.ReactNode }) {
  const autoplayAllowed = useSyncExternalStore(subscribePreference, readAutoplayPreference, () => false);
  const [enabledChoice, setEnabled] = useState<boolean | null>(null);
  const enabled = enabledChoice ?? autoplayAllowed;
  const [status, setStatus] = useState<SoundStatus>("off");
  const [currentUri, setCurrentUri] = useState<string>(START_URI);
  const [attempt, setAttempt] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SpotifyController | null>(null);
  const ready = useRef(false);
  const native = useRef(false);
  const selectedUri = useRef<string>(START_URI);
  const wantSound = useRef(true);
  const confirmedPlaying = useRef(false);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStartTimer = useCallback(() => {
    if (startTimer.current) clearTimeout(startTimer.current);
    startTimer.current = null;
  }, []);
  const beginPlayback = useCallback(() => {
    if (!controller.current || !ready.current || !wantSound.current) return;
    clearStartTimer(); confirmedPlaying.current = false; setStatus("starting");
    controller.current.play();
    startTimer.current = setTimeout(() => {
      if (!confirmedPlaying.current && wantSound.current) { setStatus("ready"); showPlayer(); }
    }, 5000);
  }, [clearStartTimer]);
  const play = useCallback((uri?: string) => {
    wantSound.current = true; remember("on"); showPlayer();
    const nextUri = uri ?? selectedUri.current;
    if (nextUri !== selectedUri.current) {
      clearStartTimer(); selectedUri.current = nextUri; setCurrentUri(nextUri);
      ready.current = false; confirmedPlaying.current = false; setStatus("loading");
      controller.current?.loadUri(nextUri);
    } else if (native.current) { setStatus("native"); }
    else if (ready.current) beginPlayback();
    else setStatus("loading");
    // Repeated clicks while loading only update intent; they do not remount.
    setEnabled(true);
  }, [beginPlayback, clearStartTimer]);
  const pause = useCallback(() => {
    wantSound.current = false; remember("off"); clearStartTimer();
    confirmedPlaying.current = false;
    controller.current?.pause();
    // Native embeds have no confirmed controller. Unload them to guarantee stop.
    setEnabled(!native.current && !!controller.current);
    setStatus("paused");
  }, [clearStartTimer]);
  const off = useCallback(() => { pause(); setEnabled(false); setStatus("off"); }, [pause]);
  const retry = useCallback(() => {
    wantSound.current = true; remember("on"); setEnabled(true); setStatus("loading");
    setAttempt(value => value + 1); showPlayer();
  }, []);

  useEffect(() => {
    const stopForVideo = () => { if (enabled) pause(); };
    window.addEventListener("northmob:video-open", stopForVideo);
    return () => window.removeEventListener("northmob:video-open", stopForVideo);
  }, [enabled, pause]);

  useEffect(() => {
    if (!enabled || !host.current) return;
    let cancelled = false;
    ready.current = false; native.current = false;
    const instance = createSpotifyController(host.current, selectedUri.current);
    controller.current = instance;
    instance.addListener("loading", () => {
      if (cancelled) return;
      ready.current = false; clearStartTimer(); setStatus("loading");
    });
    instance.addListener("ready", () => {
      if (cancelled) return;
      ready.current = true; native.current = false;
      if (wantSound.current) beginPlayback(); else setStatus("paused");
    });
    instance.addListener("native", () => {
      if (cancelled) return;
      ready.current = false; native.current = true; clearStartTimer();
      confirmedPlaying.current = false; setStatus("native"); showPlayer();
    });
    instance.addListener("playback_started", () => {
      if (cancelled) return;
      wantSound.current = true; confirmedPlaying.current = true; clearStartTimer(); remember("on"); setStatus("playing");
    });
    instance.addListener("playback_update", event => {
      if (cancelled) return;
      const playing = event.data.isPaused === false && event.data.isBuffering === false;
      const wasPlaying = confirmedPlaying.current;
      confirmedPlaying.current = playing;
      if (playing) {
        // A direct click in Spotify may resume a previously paused session.
        wantSound.current = true; clearStartTimer(); remember("on"); setStatus("playing");
      } else if (event.data.isBuffering) setStatus("starting");
      else if (wasPlaying || !wantSound.current) {
        clearStartTimer(); wantSound.current = false; remember("off"); setEnabled(true); setStatus("paused");
      }
      // Initial paused updates do not cancel the outstanding autoplay timeout.
    });
    return () => {
      cancelled = true; clearStartTimer(); ready.current = false; native.current = false;
      instance.destroy(); if (controller.current === instance) controller.current = null;
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
  const label = { off: "Sound off", loading: "Connecting", starting: "Starting", ready: "Tap to play", playing: "Now playing", paused: "Paused", native: "Use player" }[status];
  const song = songs.find(item => item.uri === currentUri);
  useEffect(() => {
    const open = () => setExpanded(true);
    window.addEventListener("northmob:show-player", open);
    return () => window.removeEventListener("northmob:show-player", open);
  }, []);


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
      else if (status === "native") { setExpanded(true); }
      else play();
    }}><span className="sound-bars" aria-hidden="true"><i /><i /><i /></span><span className="sound-caption"><span>Spotify</span><span role="status">{label}</span></span><span aria-hidden="true" className="transport-icon">{playing ? "Ⅱ" : "▷"}</span></button>
    <button ref={disclosure} type="button" className="sound-expand" aria-label="Show Spotify player" aria-expanded={expanded} aria-controls="spotify-panel" onClick={() => setExpanded(value => !value)}><span aria-hidden="true">⌄</span></button>
    <div id="spotify-panel" className={`sound-panel ${expanded ? "is-open" : ""}`} inert={!expanded} aria-hidden={!expanded}>
      <div className="sound-panel-heading"><span>{song?.title ?? "THE NORTH MOB"}</span><button type="button" onClick={off} aria-label="Turn sound off">Off ×</button></div>
      {enabled && <div className="spotify-mount" ref={host} />}
      <p className="sound-hint">{!enabled ? "Sound is off. Press play to listen." : status === "native" || status === "ready" ? "Press play inside Spotify to listen here." : "Your soundtrack stays with you as you explore."}</p>
      {status === "native" && <button type="button" className="sound-retry" onClick={retry}>Reconnect Spotify</button>}
      <p className="sound-disclosure">Spotify may use cookies. Full tracks depend on your Spotify account and availability.</p>
    </div>
  </div>;
}
