"use client";

export type SpotifyPlaybackEvent = { data: { isPaused?: boolean; isBuffering?: boolean; position?: number; duration?: number; playingURI?: string } };
export type SpotifyEvent = "ready" | "loading" | "native" | "playback_started" | "playback_update";
export type SpotifyController = {
  play(): void;
  pause(): void;
  loadUri(uri: string): void;
  destroy(): void;
  addListener(event: SpotifyEvent, callback: (event: SpotifyPlaybackEvent) => void): void;
};
export const SPOTIFY_CHANNEL = "northmob:spotify:v1";
const validUri = (uri: string) => /^spotify:(artist|track):[a-zA-Z0-9]{22}$/.test(uri);

// Keep Spotify's third-party SDK inside a dedicated local frame. The main app
// retains its CSP without unsafe-eval; the frame has no app data or credentials.
export function createSpotifyController(element: HTMLElement, uri: string): SpotifyController {
  if (!validUri(uri)) throw new Error("Unsupported Spotify content");
  const iframe = document.createElement("iframe");
  iframe.title = "THE NORTH MOB Spotify player";
  iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.src = `/spotify-player?uri=${encodeURIComponent(uri)}`;
  iframe.width = "100%"; iframe.height = "80";
  const listeners = new Map<SpotifyEvent, Set<(event: SpotifyPlaybackEvent) => void>>();
  let selected = uri;
  let booted = false;
  let destroyed = false;
  const send = (action: string) => {
    if (!destroyed && booted) iframe.contentWindow?.postMessage({ channel: SPOTIFY_CHANNEL, action, uri: selected }, location.origin);
  };
  const receive = (event: MessageEvent) => {
    if (destroyed || event.origin !== location.origin || event.source !== iframe.contentWindow || event.data?.channel !== SPOTIFY_CHANNEL) return;
    const message = event.data;
    if (message.type === "boot") { booted = true; send("load"); return; }
    if (message.uri !== selected || !listeners.has(message.type)) return;
    const data = message.data && typeof message.data === "object" ? message.data : {};
    listeners.get(message.type)?.forEach(listener => listener({ data }));
  };
  window.addEventListener("message", receive);
  element.replaceChildren(iframe);
  return {
    play: () => send("play"), pause: () => send("pause"),
    loadUri(next) { if (!validUri(next)) throw new Error("Unsupported Spotify content"); selected = next; send("load"); },
    addListener(event, callback) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event)!.add(callback); },
    destroy() { destroyed = true; window.removeEventListener("message", receive); listeners.clear(); iframe.remove(); },
  };
}
