import { describe, it, expect } from "vitest";
import { catalogue, allTracks } from "@/config/catalogue";
import { mergeVerifiedUris, verifiedTrackIds } from "./catalogue-metadata";
const html = (tracks: unknown[]) => `<script id="__NEXT_DATA__">${JSON.stringify({ props: { pageProps: { state: { data: { entity: { trackList: tracks } } } } } })}</script>`;
describe("public catalogue metadata", () => {
  it("only returns matched North Mob track IDs and never audio fields", () => {
    const uri = `spotify:track:${"A".repeat(22)}`;
    const data = html([{ title: catalogue[0].title, subtitle: "THE NORTHMOB., Trophy", uri, audioPreview: { url: "https://example.test/protected" } }, { title: catalogue[1].title, subtitle: "Unrelated artist", uri }]);
    expect(verifiedTrackIds(data, catalogue)).toEqual({ "h4b-1": uri });
  });
  it("rejects malformed metadata, invalid URIs and oversized documents", () => {
    expect(verifiedTrackIds("not metadata", catalogue)).toEqual({});
    expect(verifiedTrackIds(html([{ title: catalogue[0].title, subtitle: "THE NORTHMOB.", uri: "javascript:bad" }]), catalogue)).toEqual({});
    expect(verifiedTrackIds("x".repeat(2_000_001), catalogue)).toEqual({});
  });
  it("preserves existing verified IDs and keeps all tracks when enrichment is absent", () => {
    expect(mergeVerifiedUris({})).toEqual(allTracks);
    expect(mergeVerifiedUris({ "h4b-10": `spotify:track:${"B".repeat(22)}` })[9].uri).toBe(catalogue[9].uri);
    expect(catalogue).toHaveLength(11);
    expect(new Set(allTracks.map(track => track.id)).size).toBe(allTracks.length);
  });
});
