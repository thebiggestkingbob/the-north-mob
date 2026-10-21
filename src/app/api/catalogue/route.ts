import { album, catalogue, additionalTracks } from "@/config/catalogue";
import { mergeVerifiedUris, verifiedTrackIds } from "@/lib/catalogue-metadata";
export async function GET() {
  const sources = [
    { url: "https://open.spotify.com/embed/album/3f1HZdfe4bPLqQOu5sfmvO", tracks: catalogue },
    { url: "https://open.spotify.com/embed/album/10upZ9wALA9z8ByE3nZTHk", tracks: additionalTracks.filter(track => track.id === "fetlhela") },
  ];
  const results = await Promise.allSettled(sources.map(async source => {
    const response = await fetch(source.url, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(6000) });
    if (!response.ok) return {};
    return verifiedTrackIds(await response.text(), source.tracks);
  }));
  const ids = Object.assign({}, ...results.map(result => result.status === "fulfilled" ? result.value : {}));
  const tracks = mergeVerifiedUris(ids);
  return Response.json({ tracks, album, completeAlbumIds: tracks.filter(track => track.releaseId === album.id && track.uri).length === catalogue.length }, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
}
