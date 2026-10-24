import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only",()=>({}));
const fixture=vi.hoisted(()=>({client:vi.fn()}));
vi.mock("./public-client",()=>({publicStudioClient:fixture.client}));
import { publishedMusic } from "./public-music";
afterEach(()=>vi.clearAllMocks());
function configure(rows:unknown[]){fixture.client.mockReturnValue({from:(name:string)=>({select:()=>({eq:()=>({order:()=>name==="music_releases"?Promise.resolve({data:[{slug:"here-4-business",cover:null}],error:null}):{order:()=>Promise.resolve({data:rows,error:null})}})})})});}
it("uses supplied Spotify links only for matching published catalogue records and preserves Studio overrides",async()=>{
 configure([{catalogue_id:"h4b-4",release_slug:"here-4-business",title:"sjepa",spotify_uri:null},{catalogue_id:"h4b-7",release_slug:"here-4-business",title:"gerr , ten",spotify_uri:"spotify:track:1234567890123456789012"},{catalogue_id:"h4b-8",release_slug:"here-4-business",title:"a different song",spotify_uri:null}]);
 const music=await publishedMusic();expect(music.tracks[0].uri).toBe("spotify:track:3F9op8u11jyr1OGLyEIwDW");expect(music.tracks[1].uri).toBe("spotify:track:1234567890123456789012");expect(music.tracks[2].uri).toBeUndefined();
});
it("does not restore unpublished songs from the static catalogue",async()=>{configure([]);expect((await publishedMusic()).tracks).toEqual([]);});
