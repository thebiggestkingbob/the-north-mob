"use client";

export type SpotifyPlaybackEvent = { data: { isPaused: boolean; isBuffering: boolean; position: number; duration: number; playingURI?: string } };
export type SpotifyController = {
  play(): void;
  pause(): void;
  loadUri(uri: string): void;
  destroy(): void;
  addListener(event: "ready" | "playback_started" | "playback_update", callback: (event: SpotifyPlaybackEvent) => void): void;
};
export type SpotifyIframeApi = {
  createController(element: HTMLElement, options: { uri: string; width: string; height: number }, callback: (controller: SpotifyController) => void): void;
};
declare global {
  interface Window { onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void; }
}
let api: SpotifyIframeApi | undefined;
let loading: Promise<SpotifyIframeApi> | undefined;

// Spotify's documented Embed API. No account tokens or scraped audio URLs.
export function loadSpotifyApi(): Promise<SpotifyIframeApi> {
  if (api) return Promise.resolve(api);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    const timeout = setTimeout(() => {
      script.remove(); loading = undefined; reject(new Error("Spotify connection timed out"));
    }, 12000);
    window.onSpotifyIframeApiReady = (readyApi) => {
      api = readyApi; clearTimeout(timeout); resolve(readyApi);
    };
    script.onerror = () => { clearTimeout(timeout); script.remove(); loading = undefined; reject(new Error("Spotify could not connect")); };
    document.body.appendChild(script);
  });
  return loading;
}

export function spotifyEmbedUrl(uri: string) {
  const match = /^spotify:(artist|track):([a-zA-Z0-9]{22})$/.exec(uri);
  if (!match) throw new Error("Unsupported Spotify content");
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`;
}
