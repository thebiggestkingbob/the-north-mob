import { album, catalogue, additionalTracks } from "@/config/catalogue";
import { verifiedTrackIds } from "@/lib/catalogue-metadata";
import { publishedMusic } from "@/lib/studio/public-music";
export async function GET() {
  const music=await publishedMusic();
  if(music.unavailable)return Response.json({tracks:[]},{status:503,headers:{"Cache-Control":"no-store"}});
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
  const tracks = music.tracks.map(track=>({...track,...(!track.uri&&ids[track.id]?{uri:ids[track.id]}:{})}));
  return Response.json({ tracks, album, completeAlbumIds: tracks.filter(track => track.releaseId === album.id && track.uri).length === catalogue.length }, { headers: { "Cache-Control": "no-store" } });
}
