"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createSpotifyController, type SpotifyController } from "@/lib/spotify";
import { spotifyArtistUri } from "@/config/content";
import { allTracks, album, openingTrack, type CatalogueTrack } from "@/config/catalogue";
export const ARTIST_URI = spotifyArtistUri;
type SoundStatus = "off" | "loading" | "starting" | "ready" | "playing" | "paused" | "native";
type Soundtrack = {
  enabled: boolean; status: SoundStatus; currentUri: string; tracks: CatalogueTrack[];
  positionMs: number; durationMs: number; seek: (seconds: number) => void;
  next: () => void; previous: () => void;
  play: (uri?: string) => void; pause: () => void; off: () => void; retry: () => void;
  host: React.RefObject<HTMLDivElement | null>;
};
type SavedPlayback = { uri: string; position: number };
let initialPlayback: SavedPlayback | null | undefined;
function initialSessionPlayback() {
  if (initialPlayback !== undefined) return initialPlayback;
  initialPlayback = null;
  try {
    const value = JSON.parse(sessionStorage.getItem("northmob:playback:v1") ?? "null");
    if (value && allTracks.some(track => track.uri === value.uri) && Number.isFinite(value.position) && value.position >= 0 && value.position < 3600000) initialPlayback = value;
  } catch { /* Session persistence is optional. */ }
  return initialPlayback;
}
const noSubscription = () => () => {};
const SoundContext = createContext<Soundtrack | null>(null);
const START_URI = openingTrack.uri!;
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
  const pathname = usePathname();
  const enabled = !pathname.startsWith("/studio") && (enabledChoice ?? autoplayAllowed);
  const [status, setStatus] = useState<SoundStatus>("off");
  const savedPlayback = useSyncExternalStore(noSubscription, initialSessionPlayback, () => null);
  const [chosenUri, setCurrentUri] = useState<string | null>(null);
  const currentUri = chosenUri ?? savedPlayback?.uri ?? START_URI;
  const [attempt, setAttempt] = useState(0);
  const [resolvedIds, setResolvedIds] = useState<Record<string, string>>({});
  const tracks = useMemo(() => allTracks.map(track => ({ ...track, ...(resolvedIds[track.id] ? { uri: resolvedIds[track.id] } : {}) })), [resolvedIds]);
  const queue = useRef(allTracks);
  const advance = useRef<() => void>(() => {});
  const position = useRef(0);
  const [progress, setProgress] = useState({ positionMs: 0, durationMs: 0 });
  const resumePosition = useRef(0);
  const endHandled = useRef(false);
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
      startTimer.current = null;
      if (!confirmedPlaying.current && wantSound.current) { setStatus("ready"); }
    }, 5000);
  }, [clearStartTimer]);
  useEffect(() => { queue.current = tracks; }, [tracks]);
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/catalogue", { signal: abort.signal }).then(response => response.ok ? response.json() : null).then(data => {
      if (!Array.isArray(data?.tracks)) return;
      const ids: Record<string, string> = {};
      for (const item of data.tracks) if (allTracks.some(track => track.id === item.id) && typeof item.uri === "string" && /^spotify:track:[A-Za-z0-9]{22}$/.test(item.uri)) ids[item.id] = item.uri;
      setResolvedIds(ids);
    }).catch(() => { /* Verified static IDs and native album listening remain available. */ });
    return () => abort.abort();
  }, []);
  useEffect(() => {
    if (!savedPlayback) return;
    selectedUri.current = savedPlayback.uri; resumePosition.current = savedPlayback.position;
    controller.current?.loadUri(savedPlayback.uri);
  }, [savedPlayback]);
  const play = useCallback((uri?: string) => {
    wantSound.current = true; remember("on"); showPlayer();
    const nextUri = uri ?? selectedUri.current;
    if (nextUri !== selectedUri.current) {
      setProgress({ positionMs: 0, durationMs: 0 });
      position.current = 0; resumePosition.current = 0; endHandled.current = false;
      clearStartTimer(); selectedUri.current = nextUri; setCurrentUri(nextUri);
      ready.current = false; confirmedPlaying.current = false; setStatus("loading");
      controller.current?.loadUri(nextUri);
    } else if (native.current) { setStatus("native"); }
    else if (ready.current) beginPlayback();
    else setStatus("loading");
    // Repeated clicks while loading only update intent; they do not remount.
    setEnabled(true);
  }, [beginPlayback, clearStartTimer]);
  const skip = useCallback((direction: number) => {
    const playable = queue.current.filter(track => track.uri);
    if (!playable.length) return;
    const index = playable.findIndex(track => track.uri === selectedUri.current);
    play(playable[(Math.max(index, 0) + direction + playable.length) % playable.length].uri);
  }, [play]);
  const next = useCallback(() => skip(1), [skip]);
  const previous = useCallback(() => skip(-1), [skip]);
  useEffect(() => { advance.current = next; }, [next]);
  const pause = useCallback(() => {
    wantSound.current = false; remember("off"); clearStartTimer();
    resumePosition.current = position.current;
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
      if (resumePosition.current > 0) { instance.seek(resumePosition.current / 1000); resumePosition.current = 0; }
      if (wantSound.current) beginPlayback(); else setStatus("paused");
    });
    instance.addListener("native", () => {
      if (cancelled) return;
      ready.current = false; native.current = true; clearStartTimer();
      confirmedPlaying.current = false; setStatus("native");
    });
    instance.addListener("playback_started", () => {
      if (cancelled) return;
      wantSound.current = true; confirmedPlaying.current = true; clearStartTimer(); remember("on"); setStatus("playing");
    });
    instance.addListener("playback_update", event => {
      if (cancelled) return;
      const cursor = event.data.position, duration = event.data.duration;
      if (typeof cursor === "number" && Number.isFinite(cursor) && cursor >= 0) {
        position.current = cursor;
        if (typeof duration === "number" && Number.isFinite(duration) && duration > 0) setProgress({ positionMs: Math.min(cursor, duration), durationMs: duration });
        try { sessionStorage.setItem("northmob:playback:v1", JSON.stringify({ uri: selectedUri.current, position: cursor })); } catch { /* Storage is optional. */ }
      }
      if (selectedUri.current.startsWith("spotify:track:") && !endHandled.current && wantSound.current && confirmedPlaying.current && typeof duration === "number" && duration > 1000 && typeof cursor === "number" && cursor >= duration - 50) {
        endHandled.current = true; advance.current(); return;
      }
      const playing = event.data.isPaused === false && event.data.isBuffering === false;
      const wasPlaying = confirmedPlaying.current;
      confirmedPlaying.current = playing;
      if (playing) {
        // A direct click in Spotify may resume a previously paused session.
        wantSound.current = true; clearStartTimer(); remember("on"); setStatus("playing");
      } else if (event.data.isBuffering && wantSound.current) {
        setStatus("starting");
        if (!startTimer.current) startTimer.current = setTimeout(() => {
          startTimer.current = null;
          if (!confirmedPlaying.current && wantSound.current) setStatus("ready");
        }, 8000);
      }
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

  const seek = useCallback((seconds: number) => { if (ready.current && !native.current && Number.isFinite(seconds) && seconds >= 0) controller.current?.seek(seconds); }, []);
  return <SoundContext.Provider value={{ ...progress, seek, enabled, status: enabled && status === "off" ? "loading" : status, currentUri, tracks, next, previous, play, pause, off, retry, host }}>{children}</SoundContext.Provider>;
}

export function useSoundtrack() {
  const value = useContext(SoundContext);
  if (!value) throw new Error("SoundtrackProvider is required");
  return value;
}

export function SoundEntryButton() {
  const { status, play, pause } = useSoundtrack();
  const playing = status === "playing";
  return <button type="button" className="button button-light" onClick={() => playing ? pause() : play()}>{playing ? "Pause soundtrack" : "Enable Sound"}<span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span></button>;
}

export function SpotifyPlayButton({ uri = ARTIST_URI, children, className = "button" }: { uri?: string; children: React.ReactNode; className?: string }) {
  const { play } = useSoundtrack();
  return <button type="button" className={className} onClick={() => play(uri)}>{children}</button>;
}

export function SoundtrackControls() {
  const { enabled, status, currentUri, tracks, play, pause, off, retry, next, previous, host, positionMs, durationMs, seek } = useSoundtrack();
  const [needsNative, setNeedsNative] = useState(false);
  const playing = status === "playing";
  const song = tracks.find(item => item.uri === currentUri);
  const title = song?.title ?? (currentUri === album.uri ? album.title : "THE NORTH MOB");
  useEffect(() => {
    const open = () => setNeedsNative(true);
    window.addEventListener("northmob:show-player", open);
    return () => window.removeEventListener("northmob:show-player", open);
  }, []);
  const playbackLabel = status === "loading" ? "Connecting…" : status === "starting" ? "Starting…" : status === "ready" ? "Tap to enable sound" : status === "native" ? "Use Spotify’s play button" : status === "paused" ? "Paused" : status === "off" ? "Sound off" : song?.artist ?? album.artist;
  const nativeVisible = enabled && needsNative && (!playing || currentUri === album.uri);
  return <div className={`header-sound ${playing ? "is-playing" : ""}`}>
    <Image className="mini-artwork" src={song?.releaseId === album.id ? album.cover : "/assets/official-logo-transparent.png"} alt="" width={32} height={40} />
    <div className="track-meta"><span title={title}>{title}</span><span role="status" aria-live="polite">{playbackLabel}</span></div>
    <button type="button" className="queue-button" onClick={previous} aria-label="Previous track"><svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M5 5h2v14H5zM18 5 8 12l10 7z" /></svg></button>
    <button className="sound-transport" type="button" aria-label={playing ? "Pause soundtrack" : status === "ready" || status === "native" ? "Enable Sound" : "Play soundtrack"} aria-pressed={playing} onClick={() => playing ? pause() : play()}><span className="sound-bars" aria-hidden="true"><i /><i /><i /></span><span className="sound-enable">{status === "ready" || status === "native" ? "Enable Sound" : playing ? "Ⅱ" : "▷"}</span></button>
    <button type="button" className="queue-button" onClick={next} aria-label="Next track"><svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17 5h2v14h-2zM6 5l10 7-10 7z" /></svg></button>
    <button type="button" className="sound-off" onClick={off} aria-label="Turn sound off">×</button>
    {durationMs > 0 && status !== "native" && status !== "off" && <label className="sound-progress"><span className="sr-only">Track position</span><span>{Math.floor(positionMs / 60000)}:{String(Math.floor(positionMs / 1000) % 60).padStart(2, "0")}</span><input type="range" min={0} max={durationMs / 1000} value={positionMs / 1000} step={1} aria-label="Track position" onChange={event => seek(Number(event.target.value))} /><span>{Math.floor(durationMs / 60000)}:{String(Math.floor(durationMs / 1000) % 60).padStart(2, "0")}</span></label>}
    <div className={`native-playback ${nativeVisible ? "is-needed" : ""}`} inert={!nativeVisible} aria-hidden={!nativeVisible} aria-label="Spotify playback controls">
      {enabled && <div className="spotify-mount" ref={host} />}
      {nativeVisible && <p className="native-hint">Press Spotify’s play button to enable sound.{(status === "native" || status === "ready") && <button type="button" onClick={retry}>Reconnect</button>}</p>}
    </div>
  </div>;
}
