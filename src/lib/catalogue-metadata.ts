import { allTracks, type CatalogueTrack } from "@/config/catalogue";
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

// Read public embed metadata only. Never return preview URLs, streams or tokens.
export function verifiedTrackIds(html: string, expected: CatalogueTrack[]): Record<string, string> {
  if (html.length > 2_000_000) return {};
  const script = /<script\b[^>]*\bid=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i.exec(html)?.[1];
  if (!script) return {};
  let data: unknown;
  try { data = JSON.parse(script); } catch { return {}; }
  const found: Record<string, string> = {};
  const visit = (value: unknown, depth = 0) => {
    if (!value || typeof value !== "object" || depth > 15) return;
    if (Array.isArray(value)) { value.slice(0, 200).forEach(item => visit(item, depth + 1)); return; }
    const record = value as Record<string, unknown>;
    if (typeof record.uri === "string" && /^spotify:track:[A-Za-z0-9]{22}$/.test(record.uri) && typeof record.title === "string") {
      const title = record.title;
      const match = expected.find(track => normalize(track.title) === normalize(title));
      const credits = typeof record.subtitle === "string" ? record.subtitle : Array.isArray(record.artists) ? record.artists.map(artist => artist && typeof artist === "object" && "name" in artist ? artist.name : "").join(", ") : "";
      if (match && /the northmob/i.test(credits)) found[match.id] = record.uri;
    }
    Object.values(record).forEach(item => visit(item, depth + 1));
  };
  visit(data); return found;
}
export function mergeVerifiedUris(ids: Record<string, string>): CatalogueTrack[] {
  return allTracks.map(track => ({ ...track, ...(!track.uri && ids[track.id] ? { uri: ids[track.id] } : {}) }));
}
